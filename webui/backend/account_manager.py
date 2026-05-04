import os
import json
import uuid
import secrets
from typing import List, Dict, Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
ACCOUNTS_FILE = os.path.join(DATA_DIR, 'accounts.json')
PROFILES_DIR = os.path.join(DATA_DIR, 'profiles')

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(PROFILES_DIR, exist_ok=True)

class AccountManager:
    def __init__(self):
        self._load_accounts()

    def _generate_secret_key(self) -> str:
        return secrets.token_urlsafe(16)

    def _load_accounts(self):
        if os.path.exists(ACCOUNTS_FILE):
            with open(ACCOUNTS_FILE, 'r', encoding='utf-8') as f:
                self.accounts = json.load(f)
            for account in self.accounts:
                if 'secret_key' not in account:
                    account['secret_key'] = self._generate_secret_key()
            self._save_accounts()
        else:
            self.accounts = []
            self._save_accounts()

    def _save_accounts(self):
        with open(ACCOUNTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.accounts, f, indent=4, ensure_ascii=False)

    def get_accounts(self, include_secret_keys: bool = True) -> List[Dict]:
        self._load_accounts()
        accounts = sorted(self.accounts, key=lambda x: x.get('order', 0))
        if not include_secret_keys:
            accounts = [{k: v for k, v in a.items() if k != 'secret_key'} for a in accounts]
        return accounts

    def add_account(self, name: str) -> Dict:
        account = {
            'id': str(uuid.uuid4()),
            'name': name,
            'enabled': True,
            'order': len(self.accounts),
            'config_override': '',
            'is_logged_in': False,
            'secret_key': self._generate_secret_key()
        }
        self.accounts.append(account)
        self._save_accounts()
        return account

    def update_account(self, account_id: str, data: Dict) -> Optional[Dict]:
        for account in self.accounts:
            if account['id'] == account_id:
                for key, value in data.items():
                    if key in ['name', 'enabled', 'order', 'config_override', 'is_logged_in', 'secret_key']:
                        account[key] = value
                self._save_accounts()
                return account
        return None

    def delete_account(self, account_id: str) -> bool:
        initial_len = len(self.accounts)
        self.accounts = [a for a in self.accounts if a['id'] != account_id]
        if len(self.accounts) < initial_len:
            self._save_accounts()
            return True
        return False

    def get_account(self, account_id: str) -> Optional[Dict]:
        for account in self.accounts:
            if account['id'] == account_id:
                return account
        return None

    def get_account_by_secret_key(self, secret_key: str) -> Optional[Dict]:
        for account in self.accounts:
            if account.get('secret_key') == secret_key:
                return account
        return None

    def regenerate_secret_key(self, account_id: str) -> Optional[Dict]:
        for account in self.accounts:
            if account['id'] == account_id:
                account['secret_key'] = self._generate_secret_key()
                self._save_accounts()
                return account
        return None

    def reorder_accounts(self, account_ids: List[str]):
        id_to_order = {aid: idx for idx, aid in enumerate(account_ids)}
        for account in self.accounts:
            if account['id'] in id_to_order:
                account['order'] = id_to_order[account['id']]
        self._save_accounts()

account_manager = AccountManager()
