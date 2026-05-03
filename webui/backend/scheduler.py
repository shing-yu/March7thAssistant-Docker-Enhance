import os
import time
import json
import subprocess
import threading
from datetime import datetime
import ruamel.yaml

from .account_manager import account_manager, DATA_DIR, PROFILES_DIR

SETTINGS_FILE = os.path.join(DATA_DIR, 'settings.json')
HISTORY_FILE = os.path.join(DATA_DIR, 'history.json')
LOGS_DIR = os.path.join(DATA_DIR, 'run_logs')
os.makedirs(LOGS_DIR, exist_ok=True)

class Scheduler:
    def __init__(self):
        self.running = False
        self.current_process = None
        self.current_account_id = None
        self.current_account_name = None
        self.run_history = []
        self._load_settings()
        self._load_history()
        self.thread = threading.Thread(target=self._loop, daemon=True)
        self.thread.start()

    def _load_settings(self):
        if os.path.exists(SETTINGS_FILE):
            with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
                self.settings = json.load(f)
        else:
            self.settings = {
                'scheduled_time': '04:00',
                'auto_run': True
            }
            self._save_settings()

    def _save_settings(self):
        with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.settings, f, indent=4, ensure_ascii=False)

    def update_settings(self, new_settings):
        self.settings.update(new_settings)
        self._save_settings()

    def get_settings(self):
        return self.settings

    def _load_history(self):
        if os.path.exists(HISTORY_FILE):
            try:
                with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
                    self.run_history = json.load(f)
            except Exception as e:
                print(f"加载历史记录失败: {e}")
                self.run_history = []

    def _save_history(self):
        try:
            with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.run_history, f, indent=4, ensure_ascii=False)
        except Exception as e:
            print(f"保存历史记录失败: {e}")

    def _loop(self):
        last_run_date = None
        while True:
            time.sleep(10)
            if not self.settings.get('auto_run'):
                continue

            now = datetime.now()
            current_time_str = now.strftime('%H:%M')
            current_date_str = now.strftime('%Y-%m-%d')

            if current_time_str == self.settings.get('scheduled_time') and last_run_date != current_date_str:
                if not self.running:
                    last_run_date = current_date_str
                    self.start_run()

    def start_run(self):
        if self.running:
            return False
        
        threading.Thread(target=self._execute_all_accounts, daemon=True).start()
        return True

    def stop_run(self):
        if self.running and self.current_process:
            self.current_process.terminate()
            try:
                self.current_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.current_process.kill()
            self.running = False
            return True
        return False

    def _execute_all_accounts(self):
        self.running = True
        accounts = [a for a in account_manager.get_accounts() if a.get('enabled')]
        
        run_id = datetime.now().strftime('%Y%m%d_%H%M%S')
        history_entry = {
            'run_id': run_id,
            'start_time': datetime.now().isoformat(),
            'end_time': None,
            'accounts': []
        }
        self.run_history.insert(0, history_entry)
        if len(self.run_history) > 50:  # 稍微增加一点上限
            self.run_history.pop()
        self._save_history()  # 启动时保存一次

        for account in accounts:
            if not self.running:
                break
            
            acc_result = {
                'account_id': account['id'],
                'account_name': account['name'],
                'success': False,
                'log_file': f"log_{run_id}_{account['id']}.txt"
            }
            history_entry['accounts'].append(acc_result)
            self._run_single_account(account, acc_result)
            self._save_history()  # 每次账号运行结束后立即保存状态，以便前端及时更新

        history_entry['end_time'] = datetime.now().isoformat()
        self._save_history()  # 运行结束后保存
        self.running = False
        self.current_account_id = None
        self.current_account_name = None

    def _run_single_account(self, account, acc_result):
        self.current_account_id = account['id']
        self.current_account_name = account['name']
        account_profile_dir = os.path.join(PROFILES_DIR, account['id'])
        os.makedirs(account_profile_dir, exist_ok=True)

        # 准备独立的配置
        base_config_path = os.path.join(DATA_DIR, 'config.yaml')
        if not os.path.exists(base_config_path):
            base_config_path = os.path.join(os.getcwd(), 'config.yaml')
        temp_config_path = os.path.join(DATA_DIR, f"config_{account['id']}.yaml")
        
        yaml = ruamel.yaml.YAML()
        if os.path.exists(base_config_path):
            with open(base_config_path, 'r', encoding='utf-8') as f:
                config_data = yaml.load(f) or {}
        else:
            config_data = {}

        # 叠加 account 覆盖配置
        if account.get('config_override'):
            try:
                override_data = yaml.load(account['config_override']) or {}
                # 简单递归更新
                def deep_update(d, u):
                    for k, v in u.items():
                        if isinstance(v, dict):
                            d[k] = deep_update(d.get(k, {}), v)
                        else:
                            d[k] = v
                    return d
                deep_update(config_data, override_data)
            except Exception as e:
                print(f"解析账号配置覆盖失败: {e}")

        # 强制接管控制权：必须让子进程在执行完本账号后退出，以便调度器继续执行下一个账号
        config_data['after_finish'] = "Exit"
        # 强制启用浏览器持久化，确保 user-data-dir 生效（登录信息才能被复用）
        config_data['browser_persistent_enable'] = True

        # 保存临时配置
        with open(temp_config_path, 'w', encoding='utf-8') as f:
            yaml.dump(config_data, f)

        # 环境变量
        env = os.environ.copy()
        env['MARCH7TH_CONFIG_PATH'] = temp_config_path
        env['MARCH7TH_USER_PROFILE_DIR'] = account_profile_dir
        # Cloud game mode default to true for WebUI execution if not specified
        if 'MARCH7TH_CLOUD_GAME_ENABLE' not in env:
            env['MARCH7TH_CLOUD_GAME_ENABLE'] = 'true'
        # 强制子进程使用 UTF-8 编码输出，防止 Windows 下日志乱码
        env['PYTHONIOENCODING'] = 'utf-8'
        # 再次确保退出模式生效，防止环境变量覆盖
        env['MARCH7TH_AFTER_FINISH'] = 'Exit'

        log_path = os.path.join(LOGS_DIR, acc_result['log_file'])
        
        try:
            with open(log_path, 'w', encoding='utf-8') as log_file:
                # 运行 main.py
                import sys
                self.current_process = subprocess.Popen(
                    [sys.executable, 'main.py'],
                    cwd=os.getcwd(),
                    env=env,
                    stdout=log_file,
                    stderr=subprocess.STDOUT,
                    text=True,
                    encoding='utf-8'
                )
                self.current_process.wait()
                acc_result['success'] = (self.current_process.returncode == 0)
        except Exception as e:
            with open(log_path, 'a', encoding='utf-8') as log_file:
                log_file.write(f"\n[WebUI] 执行异常: {e}\n")
            acc_result['success'] = False
        finally:
            self.current_process = None
            if os.path.exists(temp_config_path):
                try:
                    os.remove(temp_config_path)
                except:
                    pass

scheduler = Scheduler()
