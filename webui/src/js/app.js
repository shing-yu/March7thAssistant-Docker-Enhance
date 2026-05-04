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
