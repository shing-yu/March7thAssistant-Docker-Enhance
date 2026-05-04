const { api, ElementPlus } = window;

const Dashboard = {
  props: ['isAdmin'],
  template: `
    <div class="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 m-0">运行与日志</h2>
          <p class="text-slate-400 mt-1">监控执行状态和实时日志</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-1 space-y-6">
          
          <!-- Status Card -->
          <div class="card-glass p-6 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-violet-500/20"></div>
            
            <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
              <el-icon class="mr-2 text-violet-500 dark:text-violet-400"><Odometer /></el-icon>
              执行状态
            </h3>
            
            <div class="flex flex-col gap-4 mb-6">
              <div class="flex items-center gap-3">
                <div class="relative flex h-4 w-4">
                  <span v-if="status.running" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-4 w-4" :class="status.running ? 'bg-emerald-500' : 'bg-slate-500'"></span>
                </div>
                <span class="text-lg font-medium" :class="status.running ? 'text-emerald-400' : 'text-slate-400'">
                  {{ status.running ? 'Running' : 'Idle' }}
                </span>
              </div>
              <div v-if="status.running" class="bg-slate-100/50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700/50">
                <span class="text-xs text-slate-500 uppercase tracking-wider block mb-1">Current Account</span>
                <span class="text-sm text-slate-700 dark:text-slate-300 font-medium">{{ status.current_account_name || 'Loading...' }}</span>
                <span class="text-[10px] text-slate-400 dark:text-slate-600 font-mono block mt-1">{{ status.current_account_id }}</span>
              </div>
            </div>
            
            <div v-if="isAdmin" class="flex gap-3">
              <button @click="startRun" :disabled="status.running" class="flex-1 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-2 px-4 rounded-xl transition-all shadow-[0_0_15px_-3px_rgba(139,92,246,0.4)] disabled:shadow-none flex items-center justify-center">
                <el-icon class="mr-1"><VideoPlay /></el-icon> 立即运行
              </button>
              <button @click="stopRun" :disabled="!status.running" class="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-300 dark:disabled:text-slate-600 font-medium py-2 px-4 rounded-xl border border-rose-500/20 disabled:border-transparent transition-all flex items-center justify-center">
                <el-icon class="mr-1"><VideoPause /></el-icon> 停止
              </button>
            </div>
            <div v-else class="text-sm text-slate-500 text-center py-2">
              任务控制仅管理员可用
            </div>
          </div>

          <!-- History Card -->
          <div class="card-glass p-6 h-[400px] flex flex-col">
            <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
              <el-icon class="mr-2 text-violet-500 dark:text-violet-400"><Clock /></el-icon>
              历史记录
            </h3>
            
            <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <el-timeline v-if="history.length > 0">
                <el-timeline-item
                  v-for="(item, index) in history"
                  :key="index"
                  :timestamp="new Date(item.start_time).toLocaleString()"
                  :type="item.end_time ? 'success' : 'primary'"
                  :hollow="!item.end_time"
                >
                  <div class="bg-slate-100 dark:bg-slate-900/40 rounded-lg p-3 border border-slate-200 dark:border-slate-700/30 mt-1">
                    <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono">
                      <span>ID: {{ item.run_id }}</span>
                      <span v-if="item.start_time" class="flex items-center gap-1 opacity-80">
                        <el-icon><Timer /></el-icon>
                        {{ formatDuration(item.start_time, item.end_time) }}
                      </span>
                    </div>
                    <div v-for="acc in item.accounts" :key="acc.account_id" class="flex items-center justify-between py-1 border-t border-slate-200 dark:border-slate-700/30 first:border-0">
                      <span class="text-sm text-slate-600 dark:text-slate-300 truncate max-w-[120px]" :title="acc.account_name">{{ acc.account_name }}</span>
                      <div class="flex items-center gap-2">
                        <span v-if="acc.start_time" class="text-[10px] text-slate-400 dark:text-slate-500 font-mono italic">
                          {{ formatDuration(acc.start_time, acc.end_time) }}
                        </span>
                        <span class="text-xs px-2 py-0.5 rounded-full" :class="getAccStatusClass(item, acc)">
                          {{ getAccStatusText(item, acc) }}
                        </span>
                        <button @click="viewLog(acc.log_file, !!item.end_time)" class="text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300 transition-colors" title="查看日志">
                          <el-icon><Document /></el-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
              <div v-else class="h-full flex items-center justify-center text-slate-500 flex-col">
                <el-icon class="text-4xl mb-2 opacity-50"><Box /></el-icon>
                暂无记录
              </div>
            </div>
          </div>
        </div>
        
        <!-- Right Column (Logs) -->
        <div class="lg:col-span-2">
          <div class="card-glass h-[600px] flex flex-col overflow-hidden">
            <div class="flex justify-between items-center px-6 py-4 header-glass">
              <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 m-0 flex items-center">
                <el-icon class="mr-2 text-violet-500 dark:text-violet-400"><Document /></el-icon>
                日志输出
                <span v-if="currentLogFile" class="ml-3 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-500 dark:text-slate-400 font-mono border border-slate-200 dark:border-slate-700">{{ currentLogFile }}</span>
              </h3>
              <div class="flex items-center gap-2">
                <button v-if="currentLogFile" @click="downloadLog" class="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-all" title="下载完整日志">
                  <el-icon><Download /></el-icon>
                </button>
                <button @click="refreshLog" class="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-all" title="刷新">
                  <el-icon :class="{'is-loading': logLoading}"><Refresh /></el-icon>
                </button>
              </div>
            </div>
            
            <div class="flex-1 bg-[#020617] p-4 overflow-y-auto font-mono text-[13px] leading-relaxed text-slate-300 custom-scrollbar" ref="logConsole" @scroll="handleScroll">
              <div v-if="!currentLogFile" class="h-full flex items-center justify-center text-slate-600">
                请在左侧选择一次运行历史以查看日志...
              </div>
              <pre v-else class="m-0 whitespace-pre-wrap break-words" v-html="formattedLog"></pre>
              <div v-if="logTruncated" class="text-center py-2 text-xs text-slate-500 border-t border-slate-700/30 mt-2">
                日志已截断（仅显示最新 500 行），点击上方下载按钮获取完整日志
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      status: { running: false, current_account_id: null },
      history: [],
      currentLogFile: null,
      currentLog: '',
      logLoading: false,
      pollInterval: null,
      isAutoScroll: true,
      resumeScrollTimeout: null
    }
  },
  computed: {
    formattedLog() {
      if (!this.currentLog) return 'No logs available.';

      const lines = this.currentLog.split('\n');
      // 过滤掉 DEBUG 级别的日志
      const filteredLines = lines.filter(line => !line.includes('DEBUG'));
      const MAX_LINES = 500;
      this._logTruncated = filteredLines.length > MAX_LINES;
      const displayLog = filteredLines.slice(-MAX_LINES).join('\n');


      // Simple coloring for common log keywords
      return displayLog
        .replace(/(INFO|DEBUG|WARNING|ERROR)/g, match => {
          let color = '';
          if (match.includes('INFO')) color = 'text-sky-400';
          if (match.includes('DEBUG')) color = 'text-slate-500';
          if (match.includes('WARNING')) color = 'text-amber-400';
          if (match.includes('ERROR')) color = 'text-rose-400';
          return `<span class="${color} font-bold">${match}</span>`;
        });
    },
    logTruncated() {
      return this._logTruncated || false;
    }
  },
  mounted() {
    this.fetchData();
    this.pollInterval = setInterval(this.fetchData, 5000);
  },
  unmounted() {
    clearInterval(this.pollInterval);
    if (this.resumeScrollTimeout) clearTimeout(this.resumeScrollTimeout);
  },
  methods: {
    async fetchData() {
      try {
        const oldStatus = this.status;
        this.status = await api.get('/status');
        this.history = await api.get('/history');

        // 如果当前正在运行，且启用了自动滚动，且账号发生切换，则自动切换日志文件
        if (this.status.running && this.isAutoScroll && oldStatus.current_account_id && oldStatus.current_account_id !== this.status.current_account_id) {
          if (this.history.length > 0) {
            const currentRun = this.history[0];
            const activeAcc = currentRun.accounts.find(a => a.account_id === this.status.current_account_id);
            if (activeAcc) {
              this.currentLogFile = activeAcc.log_file;
            }
          }
        }

        if (this.currentLogFile) {
          this.refreshLog();
        } else if (this.history.length > 0 && this.history[0].accounts.length > 0) {
          const currentRunAccounts = this.history[0].accounts;
          this.currentLogFile = currentRunAccounts[currentRunAccounts.length - 1].log_file;
          this.refreshLog();
        }
      } catch (err) {
        console.error(err);
      }
    },
    async startRun() {
      try {
        await api.post('/run/start');
        ElementPlus.ElMessage.success('已触发运行');
        this.fetchData();
      } catch (err) {
        ElementPlus.ElMessage.error('启动失败');
      }
    },
    async stopRun() {
      try {
        await api.post('/run/stop');
        ElementPlus.ElMessage.warning('已发送停止信号');
        this.fetchData();
      } catch (err) {
        ElementPlus.ElMessage.error('停止失败');
      }
    },
    viewLog(filename, isHistory = false) {
      this.currentLogFile = filename;
      if (this.resumeScrollTimeout) clearTimeout(this.resumeScrollTimeout);
      this.isAutoScroll = !isHistory;
      this.refreshLog(isHistory);
    },
    async refreshLog(forceToTop = false) {
      if (!this.currentLogFile) return;
      this.logLoading = true;
      try {
        const res = await api.get(`/logs/${this.currentLogFile}`);
        this.currentLog = res.content;
        this.$nextTick(() => {
          const consoleEl = this.$refs.logConsole;
          if (consoleEl) {
            if (forceToTop) {
              consoleEl.scrollTop = 0;
            } else if (this.isAutoScroll) {
              consoleEl.scrollTop = consoleEl.scrollHeight;
            }
          }
        });
      } catch (err) {
        console.error(err);
      } finally {
        this.logLoading = false;
      }
    },
    downloadLog() {
      if (!this.currentLogFile || !this.currentLog) return;
      const blob = new Blob([this.currentLog], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.currentLogFile;
      a.click();
      URL.revokeObjectURL(url);
    },
    getAccStatusClass(item, acc) {
      if (this.status && this.status.running && this.status.current_account_id === acc.account_id && !item.end_time) {
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 dark:border-sky-500/30';
      }
      return acc.success ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/30';
    },
    getAccStatusText(item, acc) {
      if (this.status && this.status.running && this.status.current_account_id === acc.account_id && !item.end_time) {
        return '运行中';
      }
      return acc.success ? '成功' : '失败';
    },
    handleScroll() {
      const el = this.$refs.logConsole;
      if (!el) return;

      // 判断是否在底部 (阈值 50px)
      const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;

      if (isAtBottom) {
        this.isAutoScroll = true;
        if (this.resumeScrollTimeout) {
          clearTimeout(this.resumeScrollTimeout);
          this.resumeScrollTimeout = null;
        }
      } else {
        // 用户向上滚动，暂停自动滚动
        this.isAutoScroll = false;

        // 设置 5 秒后恢复自动滚动
        if (this.resumeScrollTimeout) clearTimeout(this.resumeScrollTimeout);
        this.resumeScrollTimeout = setTimeout(() => {
          this.isAutoScroll = true;
          this.scrollToBottom();
        }, 5000);
      }
    },
    scrollToBottom() {
      const el = this.$refs.logConsole;
      if (el) {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'smooth'
        });
      }
    },
    formatDuration(start, end) {
      if (!start) return '';
      const s = new Date(start);
      const e = end ? new Date(end) : new Date();
      const diff = Math.floor((e - s) / 1000);
      if (diff < 0) return '0s';
      
      const m = Math.floor(diff / 60);
      const sec = diff % 60;
      return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
    }
  }
};

window.Dashboard = Dashboard;
