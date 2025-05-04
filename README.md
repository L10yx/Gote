# Gote - 一个简单的 Go + React 笔记应用

这是一个使用 Go 语言编写后端 API，React 编写前端界面的简单笔记应用程序。

## 技术栈

*   **后端 (Backend):**
    *   Go
    *   Gin (Web 框架)
    *   GORM (ORM 库)
    *   SQLite (数据库)
*   **前端 (Frontend):**
    *   React
    *   axios (HTTP 请求库)
    *   @dnd-kit (拖拽排序库)
    *   CSS

## 功能列表

*   **笔记管理:**
    *   添加新笔记 (标题和内容)
    *   显示笔记列表 (按更新时间倒序排列)
    *   编辑现有笔记
    *   删除笔记
*   **界面交互:**
    *   拖拽笔记进行排序
    *   笔记内容超过2行时自动折叠，并显示 "Show More" / "Show Less" 按钮
    *   点击笔记内容区域可全屏查看笔记详情
    *   标题输入限制为 100 个字符

## 如何启动

### 1. 启动后端服务

```bash
# 进入后端目录
cd backend

# 安装 Go 依赖 (如果尚未安装)
go mod tidy

# 运行后端服务器
go run main.go
# 或者编译后运行
# go build -o main
# ./main
```

后端服务默认运行在 `http://localhost:8080`。

### 2. 启动前端开发服务器

```bash
# 进入前端目录
cd frontend

# 安装 npm 依赖 (如果尚未安装)
npm install

# 启动 React 开发服务器
npm start
```

前端应用默认运行在 `http://localhost:3000`，并会自动在浏览器中打开。

## 模块引入

*   **后端:** 使用 Go Modules 管理依赖。`go.mod` 文件定义了项目所需的 Go 库及其版本。运行 `go mod tidy` 会自动下载和管理这些依赖。
*   **前端:** 使用 npm (Node Package Manager) 管理依赖。`package.json` 文件列出了项目所需的 JavaScript 库。运行 `npm install` 会将这些库下载到 `node_modules` 目录中。在 React 组件中，使用 `import` 语句来引入所需的模块。

## API 端点

*   `GET /api/memos`: 获取所有笔记
*   `POST /api/memos`: 创建新笔记
*   `PUT /api/memos/:id`: 更新指定 ID 的笔记
*   `DELETE /api/memos/:id`: 删除指定 ID 的笔记
