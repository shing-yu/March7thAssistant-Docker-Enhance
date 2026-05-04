const { api, ElementPlus } = window;

const Accounts = {
  props: ['isAdmin', 'boundAccountId'],
  template: `
    <div class="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 m-0">账号配置</h2>
          <p class="text-slate-500 dark:text-slate-400 mt-1">管理多个云游戏账号及执行优先级。</p>
        </div>
        <button v-if="isAdmin" @click="showAddDialog = true" class="bg-violet-600 hover:bg-violet-500 text-white font-medium py-2 px-5 rounded-xl transition-all shadow-[0_0_15px_-3px_rgba(139,92,246,0.5)] flex items-center">
          <el-icon class="mr-2"><Plus /></el-icon> 新增账号
        </button>
      </div>

      <div class="card-glass p-6 relative overflow-hidden group">
        <div class="absolute -top-32 -right-32 w-64 h-64 bg-fuchsia-500/5 dark:bg-fuchsia-500/10 rounded-full blur-3xl transition-all group-hover:bg-fuchsia-500/20"></div>
        
        <div class="overflow-x-auto custom-scrollbar">
          <el-table :data="accounts" row-key="id" style="width: 100%;" class="bg-transparent">
          <el-table-column prop="order" label="执行顺序" width="120" align="center">
            <template #default="scope">
              <div class="flex flex-col gap-1 items-center justify-center">
                <button @click="moveUp(scope.$index)" :disabled="scope.$index === 0 || !isAdmin" class="w-8 h-6 flex items-center justify-center rounded bg-slate-700/50 hover:bg-violet-500/50 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-700/50 transition-colors">
                  <el-icon><CaretTop /></el-icon>
                </button>
                <button @click="moveDown(scope.$index)" :disabled="scope.$index === accounts.length - 1 || !isAdmin" class="w-8 h-6 flex items-center justify-center rounded bg-slate-700/50 hover:bg-violet-500/50 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-700/50 transition-colors">
                  <el-icon><CaretBottom /></el-icon>
                </button>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="name" label="账号名称">
            <template #default="scope">
              <div class="flex items-center">
                <span class="font-medium text-slate-700 dark:text-slate-200 text-base mr-2">{{ scope.row.name }}</span>
                <button v-if="canModifyAccount(scope.row)" @click="editName(scope.row)" class="p-1 text-slate-500 hover:text-violet-400 transition-colors mr-3" title="修改名称">
                  <el-icon><EditPen /></el-icon>
                </button>
                <span v-if="scope.row.id === boundAccountId" class="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">我的账号</span>
                <span v-if="scope.row.is_logged_in" class="px-2 py-0.5 ml-1 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">已登录</span>
                <span v-else class="px-2 py-0.5 ml-1 rounded text-xs bg-slate-500/20 text-slate-400 border border-slate-500/30">未登录</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column v-if="isAdmin" prop="secret_key" label="账号密钥" min-width="260">
            <template #default="scope">
              <div class="flex items-center gap-2">
                <code class="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono text-slate-600 dark:text-slate-400 select-all" :title="scope.row.secret_key">{{ maskSecretKey(scope.row.secret_key) }}</code>
                <button @click="copySecretKey(scope.row.secret_key)" class="p-1.5 text-slate-400 hover:text-violet-400 bg-slate-700/30 hover:bg-slate-700/60 rounded-lg transition-colors" title="复制密钥">
                  <el-icon><CopyDocument /></el-icon>
                </button>
                <button @click="regenerateSecretKey(scope.row)" class="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-700/30 hover:bg-slate-700/60 rounded-lg transition-colors" title="重新生成密钥">
                  <el-icon><RefreshRight /></el-icon>
                </button>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="enabled" label="是否启用" width="120">
            <template #default="scope">
              <el-switch v-model="scope.row.enabled" :disabled="!isAdmin" @change="updateAccount(scope.row)" />
            </template>
          </el-table-column>
          
          <el-table-column label="操作" :width="isAdmin ? 240 : 160" align="right">
            <template #default="scope">
              <button v-if="canModifyAccount(scope.row)" @click="scanLogin(scope.row)" class="px-3 py-1.5 mr-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-colors inline-flex items-center text-sm">
                <el-icon class="mr-1"><FullScreen /></el-icon> {{ scope.row.is_logged_in ? '重新登录' : '扫码登录' }}
              </button>
              <span v-else class="px-3 py-1.5 mr-2 inline-flex items-center text-sm text-slate-500">
                无操作权限
              </span>
              <el-popconfirm v-if="isAdmin" title="确定要删除此账号吗？" @confirm="deleteAccount(scope.row.id)" confirm-button-text="删除" confirm-button-type="danger" cancel-button-text="取消">
                <template #reference>
                  <button class="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors inline-flex items-center text-sm">
                    <el-icon class="mr-1"><Delete /></el-icon> 删除
                  </button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
        
        <div v-if="accounts.length === 0" class="text-center py-12 text-slate-500">
          暂无配置账号，请管理员添加。
        </div>
      </div>

      <!-- Add Account Dialog -->
      <el-dialog v-model="showAddDialog" title="新增账号" width="400px" class="custom-dialog">
        <div class="mt-2">
          <label class="block text-sm font-medium text-slate-300 mb-2">账号名称</label>
          <el-input v-model="newAccountName" placeholder="例如: 手机端主账号" @keyup.enter="addAccount" size="large" />
        </div>
        <template #footer>
          <span class="flex justify-end gap-3 mt-6">
            <button @click="showAddDialog = false" class="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors">取消</button>
            <button @click="addAccount" :disabled="adding" class="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors shadow-lg shadow-violet-600/30">
              确定
            </button>
          </span>
        </template>
      </el-dialog>

      <!-- QR Login Dialog -->
      <el-dialog v-model="showQrDialog" title="扫码登录" width="400px" @close="stopQrPolling" class="custom-dialog">
        <div class="text-center p-6">
          <div v-if="qrStatus === 'idle' || (qrStatus === 'running' && !qrUrl)" class="py-8 flex flex-col items-center">
            <div class="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-6"></div>
            <div class="text-slate-300 font-medium">正在启动无头浏览器...</div>
            <div class="text-sm text-slate-500 mt-2">首次启动需要准备环境，请耐心等待。</div>
          </div>
          
          <div v-else-if="qrStatus === 'running' && qrUrl" class="py-2 animate-[fadeIn_0.3s_ease-out]">
            <div class="p-2 bg-white rounded-xl inline-block shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] mb-6 ring-4 ring-white/10">
              <img :src="qrUrl" alt="QR Code" class="w-[200px] h-[200px] object-contain" />
            </div>
            <div class="text-lg font-bold text-slate-200">请打开米游社 App 扫码</div>
            <div class="text-sm text-slate-400 mt-2">扫描并在手机上确认登录<br>过期自动刷新</div>
          </div>
          
          <div v-else-if="qrStatus === 'success'" class="py-8 flex flex-col items-center animate-[bounceIn_0.5s_ease-out]">
            <div class="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 ring-4 ring-emerald-500/30">
              <el-icon class="text-4xl text-emerald-400"><Check /></el-icon>
            </div>
            <div class="text-xl font-bold text-emerald-400">登录成功！</div>
            <div class="text-sm text-slate-400 mt-2">Cookie 已保存，自动关闭...</div>
          </div>
          
          <div v-else-if="qrStatus === 'failed'" class="py-8 flex flex-col items-center">
            <div class="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mb-4 ring-4 ring-rose-500/30">
              <el-icon class="text-4xl text-rose-400"><Close /></el-icon>
            </div>
            <div class="text-xl font-bold text-rose-400">操作失败或已超时取消</div>
          </div>
        </div>
      </el-dialog>
    </div>
  `,
  data() {
    return {
      accounts: [],
      showAddDialog: false,
      newAccountName: '',
      adding: false,
      showQrDialog: false,
      qrStatus: 'idle',
      qrUrl: null,
      qrPollingInterval: null,
      currentQrAccountId: null
    }
  },
  mounted() {
    this.fetchAccounts();
  },
  methods: {
    canModifyAccount(account) {
      return this.isAdmin || account.id === this.boundAccountId;
    },
    maskSecretKey(key) {
      if (!key) return '';
      if (key.length <= 8) return key;
      return key.substring(0, 8) + '...' + key.substring(key.length - 4);
    },
    async copySecretKey(key) {
      try {
        await navigator.clipboard.writeText(key);
        ElementPlus.ElMessage.success('密钥已复制到剪贴板');
      } catch (e) {
        // Fallback for non-HTTPS
        const textarea = document.createElement('textarea');
        textarea.value = key;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        ElementPlus.ElMessage.success('密钥已复制到剪贴板');
      }
    },
    async regenerateSecretKey(account) {
      try {
        const el = ElementPlus;
        const action = await el.ElMessageBox.confirm(
          '重新生成密钥后，旧密钥将立即失效。确定要继续吗？',
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            confirmButtonType: 'danger',
            type: 'warning',
            customClass: 'custom-message-box'
          }
        );
        if (action === 'confirm') {
          const updated = await api.post(`/accounts/${account.id}/regenerate-secret-key`);
          ElementPlus.ElMessage.success('密钥已重新生成');
          await this.fetchAccounts();
        }
      } catch (e) {
        // Cancelled
      }
    },
    async fetchAccounts() {
      try {
        this.accounts = await api.get('/accounts');
      } catch (err) {
        ElementPlus.ElMessage.error('获取账号失败');
      }
    },
    async addAccount() {
      if (!this.newAccountName.trim()) {
        ElementPlus.ElMessage.warning('请输入账号名称');
        return;
      }
      this.adding = true;
      try {
        await api.post('/accounts', { name: this.newAccountName });
        this.newAccountName = '';
        this.showAddDialog = false;
        ElementPlus.ElMessage.success('添加成功');
        await this.fetchAccounts();
      } catch (err) {
        ElementPlus.ElMessage.error('添加失败');
      } finally {
        this.adding = false;
      }
    },
    async updateAccount(account) {
      try {
        await api.put(`/accounts/${account.id}`, account);
      } catch (err) {
        ElementPlus.ElMessage.error('更新失败');
        this.fetchAccounts();
      }
    },
    async editName(account) {
      if (!this.canModifyAccount(account)) {
        ElementPlus.ElMessage.error('无权限修改此账号');
        return;
      }
      try {
        const { value } = await ElementPlus.ElMessageBox.prompt('请输入新的账号名称', '编辑账号', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: account.name,
          inputPattern: /\S+/,
          inputErrorMessage: '名称不能为空',
          customClass: 'custom-message-box'
        });

        if (value && value !== account.name) {
          const updatedAcc = { ...account, name: value };
          await api.put(`/accounts/${account.id}`, updatedAcc);
          ElementPlus.ElMessage.success('账号名已更新');
          await this.fetchAccounts();
        }
      } catch (e) {
        // 用户取消输入
      }
    },
    async deleteAccount(id) {
      try {
        await api.delete(`/accounts/${id}`);
        ElementPlus.ElMessage.success('删除成功');
        this.fetchAccounts();
      } catch (err) {
        ElementPlus.ElMessage.error('删除失败');
      }
    },
    async moveUp(index) {
      if (index === 0) return;
      const ids = this.accounts.map(a => a.id);
      [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
      await this.saveOrder(ids);
    },
    async moveDown(index) {
      if (index === this.accounts.length - 1) return;
      const ids = this.accounts.map(a => a.id);
      [ids[index + 1], ids[index]] = [ids[index], ids[index + 1]];
      await this.saveOrder(ids);
    },
    async saveOrder(ids) {
      try {
        await api.post('/accounts/reorder', { account_ids: ids });
        await this.fetchAccounts();
      } catch (err) {
        ElementPlus.ElMessage.error('排序保存失败');
      }
    },
    async scanLogin(account) {
      if (!this.canModifyAccount(account)) {
        ElementPlus.ElMessage.error('无权限操作此账号');
        return;
      }
      this.currentQrAccountId = account.id;
      this.showQrDialog = true;
      this.qrStatus = 'idle';
      this.qrUrl = null;

      try {
        const res = await api.post(`/qr_login/start/${account.id}`);
        if (res.success) {
          this.qrStatus = 'running';
          this.startQrPolling();
        } else {
          ElementPlus.ElMessage.warning(res.message);
          this.showQrDialog = false;
        }
      } catch (err) {
        ElementPlus.ElMessage.error('请求扫码登录失败');
        this.showQrDialog = false;
      }
    },
    startQrPolling() {
      if (this.qrPollingInterval) clearInterval(this.qrPollingInterval);
      this.qrPollingInterval = setInterval(async () => {
        try {
          const res = await api.get(`/qr_login/status/${this.currentQrAccountId}`);
          if (res.status === 'success') {
            this.qrStatus = 'success';
            this.stopQrPolling();
            this.fetchAccounts();
            setTimeout(() => { this.showQrDialog = false; }, 2000);
          } else if (res.status === 'failed') {
            this.qrStatus = 'failed';
            this.stopQrPolling();
          } else if (res.status === 'running') {
            if (res.qr_ready && res.qr_url) {
              this.qrUrl = res.qr_url;
            }
          }
        } catch (e) {
          console.error("QR polling failed", e);
        }
      }, 3000);
    },
    stopQrPolling() {
      if (this.qrPollingInterval) {
        clearInterval(this.qrPollingInterval);
        this.qrPollingInterval = null;
      }
    }
  }
};

window.Accounts = Accounts;
