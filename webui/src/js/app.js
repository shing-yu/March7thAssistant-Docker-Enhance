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
  template: `<div class="h-full w-full flex flex-col overflow-hidden relative">
 
    <!-- Mobile Header -->
    <header v-if="isAuthenticated && isMobile" class="h-16 flex-shrink-0 flex items-center justify-between px-4 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/60 z-30">
      <div class="flex items-center">
        <button @click="showSidebar = true" class="p-2 mr-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <el-icon class="text-2xl"><Menu /></el-icon>
        </button>
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20 mr-2"></div>
        <h1 class="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300 tracking-wide">M7A</h1>
      </div>
      <div class="flex items-center gap-3">
        <button @click="toggleTheme" class="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <el-icon v-if="isDark" class="text-xl"><Sunny /></el-icon>
          <el-icon v-else class="text-xl"><Moon /></el-icon>
        </button>
      </div>
    </header>

    <!-- Login Screen -->
    <div v-if="!isAuthenticated" class="flex-1 flex justify-center items-center relative overflow-hidden px-4">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl"></div>

      <div
        class="w-full max-w-[420px] bg-bg-glass backdrop-blur-xl border border-glass-border p-6 sm:p-10 rounded-3xl shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)] z-10 transition-all">
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
          <p class="text-slate-400 text-sm">请输入管理员 Token 或账号密钥登录</p>
        </div>

        <div class="space-y-6">
          <el-input v-model="tokenInput" type="password" placeholder="管理员 Token / 账号密钥" @keyup.enter="login" size="large"
            show-password class="custom-el-input">
          </el-input>

          <button @click="login" :disabled="loginLoading"
            class="w-full relative group overflow-hidden rounded-xl bg-primary hover:bg-primary-hover text-white font-medium py-3 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)]">
            <span class="relative z-10 flex items-center justify-center">
              <el-icon v-if="loginLoading" class="is-loading mr-2">
                <Loading />
              </el-icon>
              {{ loginLoading ? 'Authenticating...' : '进入系统' }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Layout -->
    <div v-else class="flex-1 flex overflow-hidden relative">
      <!-- Sidebar Overlay (Mobile) -->
      <div v-if="isMobile && showSidebar" @click="showSidebar = false" class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm z-40 animate-[fadeIn_0.2s_ease-out]"></div>

      <!-- Sidebar -->
      <aside
        :class="[
          'flex-shrink-0 flex flex-col bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border-r border-slate-200 dark:border-slate-800/60 transition-all duration-300 z-50',
          isMobile ? 'fixed inset-y-0 left-0 w-72 shadow-2xl' : 'w-64',
          isMobile && !showSidebar ? '-translate-x-full' : 'translate-x-0'
        ]">
        <div class="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-800/60 relative">
          <div
            class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20 mr-3">
          </div>
          <h1
            class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300 tracking-wide">
            M7A WebUI</h1>
          <button v-if="isMobile" @click="showSidebar = false" class="absolute right-4 p-2 text-slate-500">
            <el-icon><Close /></el-icon>
          </button>
        </div>

        <!-- User info bar -->
        <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-800/60">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-xs font-medium" :class="userInfo.role === 'admin' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'">
              {{ userInfo.role === 'admin' ? '管理员' : '账号用户' }}
            </span>
          </div>
          <div class="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate" :title="userInfo.bound_account_name || ''">
            {{ userInfo.role === 'admin' ? '全部账号管理权限' : (userInfo.bound_account_name ? '绑定账号: ' + userInfo.bound_account_name : '') }}
          </div>
        </div>

        <div class="flex-1 py-6 px-4 overflow-y-auto custom-scrollbar">
          <nav class="space-y-2">
            <router-link to="/" @click="isMobile && (showSidebar = false)"
              class="flex items-center px-4 py-3 rounded-xl transition-all duration-300 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60 group"
              active-class="bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20 shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]">
              <el-icon class="text-xl mr-3 group-hover:scale-110 transition-transform">
                <Monitor />
              </el-icon>
              <span class="font-medium">运行与日志</span>
            </router-link>

            <router-link to="/accounts" @click="isMobile && (showSidebar = false)"
              class="flex items-center px-4 py-3 rounded-xl transition-all duration-300 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60 group"
              active-class="bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20 shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]">
              <el-icon class="text-xl mr-3 group-hover:scale-110 transition-transform">
                <User />
              </el-icon>
              <span class="font-medium">账号配置</span>
            </router-link>

            <router-link to="/tasks" @click="isMobile && (showSidebar = false)"
              class="flex items-center px-4 py-3 rounded-xl transition-all duration-300 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60 group"
              active-class="bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20 shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]">
              <el-icon class="text-xl mr-3 group-hover:scale-110 transition-transform">
                <Setting />
              </el-icon>
              <span class="font-medium">任务配置</span>
            </router-link>

            <router-link to="/settings" @click="isMobile && (showSidebar = false)"
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
        <div
          class="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] -z-10 pointer-events-none">
        </div>
        <div class="p-4 sm:p-8 h-full">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" :isAdmin="userInfo.role === 'admin'" :boundAccountId="userInfo.bound_account_id" />
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
      isDark: true,
      isMobile: window.innerWidth < 1024,
      showSidebar: false,
      userInfo: {
        role: 'account',
        bound_account_id: null,
        bound_account_name: null
      }
    }
  },
  computed: {
    activeRoute() {
      return this.$route.path;
    }
  },
  mounted() {
    const savedTheme = localStorage.getItem('m7a_theme');
    if (savedTheme === 'light') {
      this.isDark = false;
      document.documentElement.classList.remove('dark');
    } else {
      this.isDark = true;
      document.documentElement.classList.add('dark');
    }

    const token = localStorage.getItem('m7a_webui_token');
    const userInfoStr = localStorage.getItem('m7a_user_info');
    if (token) {
      if (userInfoStr) {
        try {
          this.userInfo = JSON.parse(userInfoStr);
          this.isAuthenticated = true;
        } catch (e) {
          this.isAuthenticated = false;
        }
      } else {
        this.fetchUserInfo().then(() => {
          if (this.userInfo.role) {
            this.isAuthenticated = true;
          }
        });
      }
    }

    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth < 1024;
      if (!this.isMobile) this.showSidebar = false;
    },
    async fetchUserInfo() {
      try {
        const token = localStorage.getItem('m7a_webui_token');
        const info = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.userInfo = info.data;
        localStorage.setItem('m7a_user_info', JSON.stringify(info.data));
      } catch (err) {
        this.logout();
      }
    },
    async login() {
      if (!this.tokenInput) {
        ElementPlus.ElMessage.warning('请输入 Token 或密钥');
        return;
      }
      this.loginLoading = true;
      try {
        const info = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${this.tokenInput}` }
        });
        this.userInfo = info.data;
        localStorage.setItem('m7a_webui_token', this.tokenInput);
        localStorage.setItem('m7a_user_info', JSON.stringify(info.data));
        this.isAuthenticated = true;
        if (info.data.role === 'admin') {
          ElementPlus.ElMessage.success('管理员登录成功');
        } else {
          ElementPlus.ElMessage.success('已绑定账号: ' + (info.data.bound_account_name || ''));
        }
      } catch (err) {
        ElementPlus.ElMessage.error('Token 或密钥无效');
      } finally {
        this.loginLoading = false;
      }
    },
    logout() {
      localStorage.removeItem('m7a_webui_token');
      localStorage.removeItem('m7a_user_info');
      this.isAuthenticated = false;
      this.tokenInput = '';
      this.userInfo = { role: 'account', bound_account_id: null, bound_account_name: null };
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
