import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'
	
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
	  uni(),
  ],
  server: {
      proxy: {
      host: '0.0.0.0',
		'/system-picture': {
		    target: 'http://cloud.ugee.com.cn',
		    changeOrigin: true,
		},
		'/originalDataJson': {
		    target: 'https://ugee-userdata.s3.cn-northwest-1.amazonaws.com.cn',
		    changeOrigin: true,
		},
		// '/system-picture': {
		//     target: 'http://69.234.230.211:9520',
		//     changeOrigin: true,
		// },
		// '/system-picture': {
		//     target: 'http://52.83.233.235:9520',
		//     changeOrigin: true,
		// },
  	}
},
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components')
    }
  },
  css: {
    // 配置`scss`和`less`全局变量
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/vars/_base.scss";'
      },
      less: {
        additionalData: '@import "@/styles/vars/_base.less";'
      }
    }
  }
})
