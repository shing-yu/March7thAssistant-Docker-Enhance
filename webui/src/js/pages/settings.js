const { api, ElementPlus } = window;

const Settings = {
  props: ['isAdmin'],
  template: `
    <div class="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 m-0">全局设置</h2>
          <p class="text-slate-500 dark:text-slate-400 mt-1">设置自动任务运行和参数配置</p>
        </div>
      </div>
      
      <div class="card-glass p-8 max-w-2xl relative overflow-hidden group">
        <!-- Decoration -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-all group-hover:bg-indigo-500/20"></div>
        
        <el-form label-position="top" class="relative z-10 custom-form">
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-6 flex items-center">
              <el-icon class="mr-2 text-violet-500 dark:text-violet-400"><MagicStick /></el-icon>
              自动化调度
            </h3>
            
            <div class="flex items-start justify-between bg-slate-100/50 dark:bg-slate-900/40 p-5 rounded-xl border border-slate-200 dark:border-white/5 mb-6">
              <div>
                <label class="block text-base font-medium text-slate-700 dark:text-slate-200 mb-1">自动排队运行</label>
                <div class="text-sm text-slate-500 dark:text-slate-400">启用后，将在指定时间自动开始按顺序运行已启用的各个账号的任务。</div>
              </div>
              <el-switch v-model="settings.auto_run" size="large" :disabled="!isAdmin" />
            </div>
            
            <div class="bg-slate-100/50 dark:bg-slate-900/40 p-5 rounded-xl border border-slate-200 dark:border-white/5" :class="{'opacity-50 pointer-events-none': !settings.auto_run || !isAdmin}">
              <label class="block text-base font-medium text-slate-700 dark:text-slate-200 mb-1">每日定时启动时间</label>
              <div class="text-sm text-slate-500 dark:text-slate-400 mb-4">设置每天触发云游戏队列运行的具体时间（推荐避开服务器繁忙时段）。</div>
              <el-time-picker 
                v-model="settings.scheduled_time" 
                format="HH:mm"
                value-format="HH:mm"
                placeholder="选择时间"
                :disabled="!isAdmin"
                class="w-full sm:w-64">
              </el-time-picker>
            </div>

            <div class="mt-8 pt-8 border-t border-slate-200 dark:border-white/5">
              <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-6 flex items-center">
                <el-icon class="mr-2 text-amber-500 dark:text-amber-400"><Tools /></el-icon>
                开发与调试
              </h3>
              
              <div class="flex items-start justify-between bg-amber-500/5 dark:bg-amber-500/10 p-5 rounded-xl border border-amber-500/10 dark:border-amber-500/20">
                <div>
                  <label class="block text-base font-medium text-amber-700 dark:text-amber-400 mb-1">调试模拟模式</label>
                  <div class="text-sm text-slate-500 dark:text-slate-400">开启后，点击“立即运行”将仅模拟运行过程输出伪造日志，不会启动真实浏览器及游戏。用于测试 UI 功能和调度逻辑。</div>
                </div>
                <el-switch v-model="settings.debug_mode" size="large" active-color="#f59e0b" :disabled="!isAdmin" />
              </div>
            </div>
          </div>

          <div class="pt-6 border-t border-white/5 flex justify-end">
            <button v-if="isAdmin" @click.prevent="saveSettings" :disabled="saving" class="bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)] flex items-center">
              <el-icon v-if="saving" class="is-loading mr-2"><Loading /></el-icon>
              <el-icon v-else class="mr-2"><Check /></el-icon>
              {{ saving ? 'Saving...' : '保存全局设置' }}
            </button>
            <span v-else class="text-sm text-slate-500">全局设置仅管理员可修改</span>
          </div>
        </el-form>
      </div>
    </div>
  `,
  data() {
    return {
      settings: {
        auto_run: false,
        scheduled_time: '04:00',
        debug_mode: false
      },
      saving: false
    }
  },
  mounted() {
    this.fetchSettings();
  },
  methods: {
    async fetchSettings() {
      try {
        const res = await api.get('/settings');
        this.settings = res;
      } catch (err) {
        ElementPlus.ElMessage.error('获取设置失败');
      }
    },
    async saveSettings() {
      this.saving = true;
      try {
        await api.post('/settings', this.settings);
        ElementPlus.ElMessage.success('设置保存成功');
      } catch (err) {
        ElementPlus.ElMessage.error('保存失败');
      } finally {
        this.saving = false;
      }
    }
  }
};

window.Settings = Settings;
