import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const preventCloudflareRocketLoader = () => ({
  name: 'prevent-cf-rocket-loader',
  transformIndexHtml(html) {
    return html.replace(/<script\s+type="module"/g, '<script data-cfasync="false" type="module"')
  }
})

export default defineConfig({
  plugins: [react(), preventCloudflareRocketLoader()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
