import './monaco-env.js';
import * as Vue from 'vue';
import * as VueRouter from 'vue-router';
import ElementPlus, { ElMessage, ElMessageBox } from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import axios from 'axios';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import '../css/tailwind.css';
import '../css/style.css';

ElementPlus.ElMessage = ElMessage;
ElementPlus.ElMessageBox = ElMessageBox;

Object.assign(window, {
  Vue,
  VueRouter,
  ElementPlus,
  ElementPlusIconsVue,
  axios,
  monaco
});
