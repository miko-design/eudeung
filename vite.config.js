import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 배포를 위해 리포지토리 이름을 경로로 설정합니다.
  base: '/eudeung/',
})
