import os
import json
import uuid
from typing import List, Dict, Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
ACCOUNTS_FILE = os.path.join(DATA_DIR, 'accounts.json')
PROFILES_DIR = os.path.join(DATA_DIR, 'profiles')

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(PROFILES_DIR, exist_ok=True)

class AccountManager:
    def __init__(self):
        self._load_accounts()

    def _load_accounts(self):
        if os.path.exists(ACCOUNTS_FILE):
            with open(ACCOUNTS_FILE, 'r', encoding='utf-8') as f:
                self.accounts = json.load(f)
        else:
            self.accounts = []
            self._save_accounts()

    def _save_accounts(self):
        with open(ACCOUNTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.accounts, f, indent=4, ensure_ascii=False)

    def get_accounts(self) -> List[Dict]:
        self._load_accounts()  # 每次从磁盘重新加载，确保子进程写入的更新能被主进程看到
        return sorted(self.accounts, key=lambda x: x.get('order', 0))

    def add_account(self, name: str) -> Dict:
        account = {
            'id': str(uuid.uuid4()),
            'name': name,
            'enabled': True,
            'order': len(self.accounts),
            'config_override': '',
            'is_logged_in': False
        }
        self.accounts.append(account)
        self._save_accounts()
        return account

    def update_account(self, account_id: str, data: Dict) -> Optional[Dict]:
        for account in self.accounts:
            if account['id'] == account_id:
                for key, value in data.items():
                    if key in ['name', 'enabled', 'order', 'config_override', 'is_logged_in']:
                        account[key] = value
                self._save_accounts()
                return account
        return None

    def delete_account(self, account_id: str) -> bool:
        initial_len = len(self.accounts)
        self.accounts = [a for a in self.accounts if a['id'] != account_id]
        if len(self.accounts) < initial_len:
            self._save_accounts()
            # Note: We don't delete the profile directory to avoid accidental data loss.
            return True
        return False

    def get_account(self, account_id: str) -> Optional[Dict]:
        for account in self.accounts:
            if account['id'] == account_id:
                return account
        return None

    def reorder_accounts(self, account_ids: List[str]):
        """Update order based on the list of ids provided"""
        id_to_order = {aid: idx for idx, aid in enumerate(account_ids)}
        for account in self.accounts:
            if account['id'] in id_to_order:
                account['order'] = id_to_order[account['id']]
        self._save_accounts()

account_manager = AccountManager()
