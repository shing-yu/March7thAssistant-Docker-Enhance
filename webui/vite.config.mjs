import { defineConfig } from 'vite';
import { compile } from '@vue/compiler-dom';

function precompileInlineVueTemplates() {
  return {
    name: 'precompile-inline-vue-templates',
    transform(code, id) {
      if (!id.includes('/src/js/') && !id.includes('\\src\\js\\')) {
        return null;
      }

      const transformed = code.replace(/template:\s*`([\s\S]*?)`/g, (_, template) => {
        const compiled = compile(template, {
          mode: 'function',
          prefixIdentifiers: true
        }).code;
        return `render: (() => { const Vue = window.Vue; ${compiled} })()`;
      });

      return transformed === code ? null : { code: transformed, map: null };
    }
  };
}

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/static/' : '/',
  plugins: [precompileInlineVueTemplates()],
  build: {
    outDir: 'static',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:8080'
    }
  }
}));
