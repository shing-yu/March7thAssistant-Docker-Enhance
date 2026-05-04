const api = window.axios.create({
  baseURL: '/api',
  timeout: 10000
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('m7a_webui_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('m7a_webui_token');
      localStorage.removeItem('m7a_user_info');
      window.location.reload();
    }
    if (error.response && error.response.status === 403) {
      ElementPlus.ElMessage.error('无权限执行此操作');
    }
    return Promise.reject(error);
  }
);

window.api = api;
