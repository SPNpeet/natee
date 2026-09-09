import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * ใช้ Preact แทน React ตอน build
 * เขียนโค้ดด้วยรูปแบบเดียวกับ React ทุกอย่าง แต่ไฟล์ที่ผู้ใช้ต้องโหลดเล็กลงราวสี่เท่า
 */
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: { input: { main: 'index.html', admin: 'admin/index.html' } },
  },
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'react-dom/client': 'preact/compat/client',
      'react-dom/server': 'preact/compat/server',
      'react/jsx-runtime': 'preact/jsx-runtime',
      'react/jsx-dev-runtime': 'preact/jsx-dev-runtime',
    },
  },
})
