import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  define: {
    'tau_file_system': 'window.tau_file_system',
    'tau_user_input': 'window.tau_user_input',
    'tau_user_output': 'window.tau_user_output',
    'tau_user_error': 'window.tau_user_error',
    'nodejs_file_system': 'window.nodejs_file_system',
    'nodejs_user_input': 'window.nodejs_user_input',
    'nodejs_user_output': 'window.nodejs_user_output',
    'nodejs_user_error': 'window.nodejs_user_error'
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true
  }
})
