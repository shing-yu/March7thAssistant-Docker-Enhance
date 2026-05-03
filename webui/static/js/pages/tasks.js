let monacoInitialized = false;

const Tasks = {
  template: `
    <div class="h-full flex flex-col space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 m-0">任务配置 (Tasks)</h2>
          <p class="text-slate-500 dark:text-slate-400 mt-1">Configure global workflow and override settings per account using the YAML editor.</p>
        </div>
        <div class="flex gap-3">
          <div class="bg-white/80 dark:bg-slate-800/60 rounded-xl p-1 border border-slate-200 dark:border-white/5 flex items-center shadow-lg backdrop-blur-md">
            <el-select v-model="selectedAccount" placeholder="全局配置 (Global)" @change="loadConfig" clearable class="!bg-transparent custom-el-select w-64">
              <el-option label="全局配置 (Global)" value=""></el-option>
              <el-option
                v-for="acc in accounts"
                :key="acc.id"
                :label="acc.name + ' (覆盖配置)'"
                :value="acc.id">
              </el-option>
            </el-select>
          </div>
          <button @click="saveConfig" :disabled="saving" class="bg-violet-600 hover:bg-violet-500 text-white font-medium py-2 px-6 rounded-xl transition-all shadow-[0_0_15px_-3px_rgba(139,92,246,0.5)] flex items-center">
            <el-icon v-if="saving" class="is-loading mr-2"><Loading /></el-icon>
            <el-icon v-else class="mr-2"><Check /></el-icon>
            {{ saving ? 'Saving...' : '保存配置' }}
          </button>
        </div>
      </div>

      <div class="card-glass flex-1 relative overflow-hidden flex flex-col group">
        <!-- Glow effect -->
        <div class="absolute -bottom-20 -left-20 w-72 h-72 bg-violet-600/10 rounded-full blur-[60px] pointer-events-none transition-all group-hover:bg-violet-600/20"></div>
        
        <!-- Editor Header -->
        <div class="px-4 py-2 header-glass flex items-center justify-between z-10">
          <div class="flex gap-2">
            <div class="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div class="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div class="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <span class="text-xs text-slate-500 font-mono">
            {{ selectedAccount ? 'account_override.yaml' : 'config.yaml' }}
          </span>
        </div>
        
        <!-- Editor Container (Absolute inset to prevent flex loop bugs) -->
        <div class="relative flex-1 w-full bg-[#1e1e1e] dark:bg-[#1e1e1e] z-10">
          <div id="monaco-editor" class="absolute inset-0"></div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      accounts: [],
      selectedAccount: '',
      saving: false,
      currentConfigContent: ''
    }
  },
  async mounted() {
    await this.fetchAccounts();

    const initEditor = () => {
      this.editor = monaco.editor.create(document.getElementById('monaco-editor'), {
        value: '',
        language: 'yaml',
        theme: document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
        padding: { top: 16, bottom: 16 },
        scrollBeyondLastLine: false,
        renderLineHighlight: 'all',
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on'
      });
      this.loadConfig();
      
      // Theme watcher for Monaco
      this.themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const isDark = document.documentElement.classList.contains('dark');
            monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
          }
        });
      });
      this.themeObserver.observe(document.documentElement, { attributes: true });
    };

    if (window.monaco && window.monaco.editor) {
      initEditor();
    } else {
      if (!monacoInitialized) {
        require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.45.0/min/vs' } });
        monacoInitialized = true;
      }
      require(['vs/editor/editor.main'], () => {
        initEditor();
      });
    }
  },
  beforeUnmount() {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
  },
  methods: {
    async fetchAccounts() {
      try {
        this.accounts = await api.get('/accounts');
      } catch (err) {
        console.error(err);
      }
    },
    async loadConfig() {
      if (!this.editor) return;
      try {
        if (!this.selectedAccount) {
          // Global config
          const res = await api.get('/config');
          this.editor.setValue(res.content || '');
        } else {
          // Account specific
          const acc = this.accounts.find(a => a.id === this.selectedAccount);
          this.editor.setValue(acc.config_override || '');
        }
      } catch (err) {
        ElementPlus.ElMessage.error('加载配置失败');
      }
    },
    async saveConfig() {
      if (!this.editor) return;
      this.saving = true;
      const content = this.editor.getValue();
      try {
        if (!this.selectedAccount) {
          // Global
          await api.post('/config', { content });
        } else {
          // Account
          const acc = this.accounts.find(a => a.id === this.selectedAccount);
          acc.config_override = content;
          await api.put(`/accounts/${acc.id}`, acc);
        }
        ElementPlus.ElMessage.success('配置已保存');
      } catch (err) {
        ElementPlus.ElMessage.error('保存失败');
      } finally {
        this.saving = false;
      }
    }
  }
};
