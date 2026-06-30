# FileBrowser 项目记忆

## 项目背景
- Fork 的开源项目 filebrowser，进行了个人使用适配
- 前端技术栈：Vue 3 + TypeScript + Vite + Pinia + Tailwind CSS + DaisyUI

## UI 改造方向
- 引入 Tailwind CSS 和 DaisyUI，逐步替换原生手写 CSS
- 改造指南文档：`frontend/DAISYUI_MIGRATION.md`
- 已完成部分：P1-P6 已完成（主题配置、Action、Login、Prompts、Sidebar、HeaderBar）
- 改造顺序：Phase 1-10，从 Action.vue 按钮开始，到 FileListing.vue 最复杂
- 兼容性注意：`HeaderBar.vue` 已改为 `sticky` 布局，因此需要移除 `body { padding-top: 4em }` 这类为固定 header 预留的样式

## 后端运行方式
- 使用 `go run main.go --noauth` 免密启动后端
- 或编译后：`go build -o fb.exe main.go` 然后 `.\fb.exe --noauth`

