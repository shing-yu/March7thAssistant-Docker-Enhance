const { Vue, VueRouter, ElementPlus, ElementPlusIconsVue, Dashboard, Accounts, Tasks, Settings, axios } = window;

const routes = [
  { path: '/', component: Dashboard },
  { path: '/accounts', component: Accounts },
  { path: '/tasks', component: Tasks },
  { path: '/settings', component: Settings },
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});

const app = Vue.createApp({
  template: `<div class="h-full w-full flex flex-col">

    <!-- Login Screen -->
    <div v-if="!isAuthenticated" class="flex-1 flex justify-center items-center relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl"></div>

      <div
        class="w-[420px] bg-bg-glass backdrop-blur-xl border border-glass-border p-10 rounded-3xl shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)] z-10 transition-all">
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg mb-6">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
              </path>
            </svg>
          </div>
          <h2
            class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 mb-2">
            March7th WebUI</h2>
          <p class="text-slate-400 text-sm">Please enter your token to continue</p>
        </div>

        <div class="space-y-6">
          <el-input v-model="tokenInput" type="password" placeholder="Access Token" @keyup.enter="login" size="large"
            show-password class="custom-el-input">
          </el-input>

          <button @click="login" :disabled="loginLoading"
            class="w-full relative group overflow-hidden rounded-xl bg-primary hover:bg-primary-hover text-white font-medium py-3 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)]">
            <span class="relative z-10 flex items-center justify-center">
              <el-icon v-if="loginLoading" class="is-loading mr-2">
                <Loading />
              </el-icon>
              {{ loginLoading ? 'Authenticating...' : 'Enter System' }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Layout -->
    <div v-else class="h-full flex overflow-hidden">
      <!-- Sidebar -->
      <aside
        class="w-64 flex-shrink-0 flex flex-col bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border-r border-slate-200 dark:border-slate-800/60 transition-all z-20">
        <div class="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-800/60">
          <div
            class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20 mr-3">
          </div>
          <h1
            class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300 tracking-wide">
            M7A WebUI</h1>
        </div>

        <div class="flex-1 py-6 px-4 overflow-y-auto custom-scrollbar">
          <nav class="space-y-2">
            <router-link to="/"
              class="flex items-center px-4 py-3 rounded-xl transition-all duration-300 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60 group"
              active-class="bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20 shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]">
              <el-icon class="text-xl mr-3 group-hover:scale-110 transition-transform">
                <Monitor />
              </el-icon>
              <span class="font-medium">运行与日志</span>
            </router-link>

            <router-link to="/accounts"
              class="flex items-center px-4 py-3 rounded-xl transition-all duration-300 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60 group"
              active-class="bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20 shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]">
              <el-icon class="text-xl mr-3 group-hover:scale-110 transition-transform">
                <User />
              </el-icon>
              <span class="font-medium">账号配置</span>
            </router-link>

            <router-link to="/tasks"
              class="flex items-center px-4 py-3 rounded-xl transition-all duration-300 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60 group"
              active-class="bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20 shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]">
              <el-icon class="text-xl mr-3 group-hover:scale-110 transition-transform">
                <Setting />
              </el-icon>
              <span class="font-medium">任务配置</span>
            </router-link>

            <router-link to="/settings"
              class="flex items-center px-4 py-3 rounded-xl transition-all duration-300 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60 group"
              active-class="bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20 shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]">
              <el-icon class="text-xl mr-3 group-hover:scale-110 transition-transform">
                <Tools />
              </el-icon>
              <span class="font-medium">全局设置</span>
            </router-link>
          </nav>
        </div>

        <div class="p-6 border-t border-slate-200 dark:border-slate-800/60 space-y-2">
          <button @click="toggleTheme"
            class="flex items-center justify-center w-full px-4 py-2.5 rounded-lg text-slate-700 dark:text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60 transition-colors">
            <el-icon v-if="isDark" class="mr-2 text-lg">
              <Sunny />
            </el-icon>
            <el-icon v-else class="mr-2 text-lg">
              <Moon />
            </el-icon>
            {{ isDark ? '浅色模式' : '深色模式' }}
          </button>
          <button @click="logout"
            class="flex items-center justify-center w-full px-4 py-2.5 rounded-lg text-rose-500/80 hover:text-rose-600 hover:bg-rose-500/10 transition-colors border border-transparent">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            退出登录
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 relative overflow-x-hidden overflow-y-auto custom-scrollbar">
        <!-- Background accents for main content -->
        <div
          class="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] -z-10 pointer-events-none">
        </div>
        <div class="p-8 h-full">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>`,
  data() {
    return {
      isAuthenticated: false,
      tokenInput: '',
      loginLoading: false,
      isDark: true
    }
  },
  computed: {
    activeRoute() {
      return this.$route.path;
    }
  },
  mounted() {
    // Theme initialization
    const savedTheme = localStorage.getItem('m7a_theme');
    if (savedTheme === 'light') {
      this.isDark = false;
      document.documentElement.classList.remove('dark');
    } else {
      this.isDark = true;
      document.documentElement.classList.add('dark');
    }

    const token = localStorage.getItem('m7a_webui_token');
    if (token) {
      this.isAuthenticated = true;
    }
  },
  methods: {
    async login() {
      if (!this.tokenInput) {
        ElementPlus.ElMessage.warning('请输入 Token');
        return;
      }
      this.loginLoading = true;
      try {
        // test token by calling settings endpoint
        await axios.get('/api/settings', {
          headers: { Authorization: `Bearer ${this.tokenInput}` }
        });
        localStorage.setItem('m7a_webui_token', this.tokenInput);
        this.isAuthenticated = true;
        ElementPlus.ElMessage.success('登录成功');
      } catch (err) {
        ElementPlus.ElMessage.error('Token 错误或无效');
      } finally {
        this.loginLoading = false;
      }
    },
    logout() {
      localStorage.removeItem('m7a_webui_token');
      this.isAuthenticated = false;
      this.tokenInput = '';
    },
    toggleTheme() {
      this.isDark = !this.isDark;
      if (this.isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('m7a_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('m7a_theme', 'light');
      }
    }
  }
});

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router);
app.use(ElementPlus);
app.mount('#app');
