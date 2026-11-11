import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
// SINGLE=1 이면 파일 하나짜리(미리보기용) 빌드
export default defineConfig({
  base: './',
  plugins: [react(), ...(process.env.SINGLE ? [viteSingleFile()] : [])],
  build: { outDir: process.env.SINGLE ? 'dist-single' : 'dist' },
})
