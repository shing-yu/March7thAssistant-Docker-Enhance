import os
import sys
import shutil

# 设置工作目录为项目根目录
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, project_root)
os.chdir(project_root)

from module.config import cfg
from module.logger import log
from module.game.cloud import CloudGameController

def main():
    if len(sys.argv) < 2:
        print("Usage: python qr_login_runner.py <account_id>")
        sys.exit(1)
        
    account_id = sys.argv[1]
    qr_dest_path = os.path.join("webui", "data", f"qr_{account_id}.png")
    
    # 强制开启 headless
    cfg.set_value("browser_headless_enable", True)
    cfg.set_value("cloud_game_enable", True)
    
    game = CloudGameController(cfg=cfg, logger=log)
    
    try:
        # 重写 QR 保存方法以便我们将二维码存放到 webui/data 目录中供前端获取
        original_save = game._save_qr_from_src
        def custom_save(qr_img, qr_filename):
            original_save(qr_img, qr_filename)
            try:
                shutil.copy(qr_filename, qr_dest_path)
                log.info(f"二维码已复制到 WebUI 数据目录: {qr_dest_path}")
            except Exception as e:
                log.error(f"复制二维码失败: {e}")
                
        game._save_qr_from_src = custom_save

        if not game.start_game_process(headless=True):
            sys.exit(1)

        log.info("浏览器已启动，准备扫码登录...")
        
        # 强制刷新页面确保我们在登录界面
        game._refresh_page()
        
        if game._check_login():
            log.info("该账号已登录，无需扫码。")
            sys.exit(0)
            
        game._run_qr_login_flow()
        
        # 验证是否成功，循环等待手机确认
        import time
        log.info("等待手机确认登录...")
        
        # 给予用户 60 秒的时间在手机端点击“确认登录”
        for _ in range(60):
            if game._check_login():
                log.info("登录成功！")
                game._save_cookies()
                from webui.backend.account_manager import account_manager
                account_manager.update_account(account_id, {'is_logged_in': True})
                sys.exit(0)
            time.sleep(1)
            
        log.error("等待手机确认超时，登录未成功。")
        sys.exit(1)
            
    except Exception as e:
        log.error(f"QR Login runner failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        # 优雅退出浏览器，让 Chrome 有机会正常保存配置文件（避免 Preferences/Local State 损坏）
        try:
            if game.driver:
                game.driver.quit()
        except Exception:
            pass
        game.close_all_m7a_browser(headless=True)
        # 清理生成的二维码
        if os.path.exists(qr_dest_path):
            try:
                os.remove(qr_dest_path)
            except:
                pass

if __name__ == "__main__":
    main()
