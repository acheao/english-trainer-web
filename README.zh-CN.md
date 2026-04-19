# English Trainer Web

English version: [README.md](README.md)

`english-trainer-web` 是 English Trainer 产品的前端仓库，负责把完整学习闭环呈现为可用的 Web 界面：

`注册 / 登录 -> 连接模型 API -> 导入材料 -> 开始 30 分钟日练 -> 查看反馈 -> 跟踪进度`

后端仓库位于 `C:\Users\Lin Chao\Documents\work\language-agent`。

## 项目定位

这个项目已经不再是一次性的纠错工具，而是围绕“用户自有学习材料 + 自适应练习”构建的学习工作台。

当前预期的产品流程如下：

1. 用户注册并登录。
2. 用户连接一个或多个常见 LLM 提供商，例如 OpenAI、DeepSeek、Qwen、Gemini、Kimi、GLM、Grok 或 MiniMax。
3. 用户从 YouTube 链接、文章链接或纯文本导入学习材料。
4. 后端保存材料，在可用时下载 YouTube 英文字幕和 mp3，并将内容拆分为学习单元。
5. 系统每天生成大约 30 分钟的聚焦练习包。
6. 每次答题后，系统记录分数、错误类型、耗时、犹豫和跳过行为，用于优化后续学习安排。

## 主要页面与能力

### 认证

- 登录
- 注册
- 新用户在设置页内完成引导流程

### Today

- 首页是每日学习指挥台
- 展示当前学习重点、预计练习时长、准备状态、最近课程，以及开始练习的主按钮

### Materials

- 从 YouTube URL 导入
- 从文章 URL 导入
- 从纯文本导入
- 查看 lesson 详情并管理 study units

### Practice

- 开始每日练习或额外练习
- 回答基于用户材料生成的任务
- 查看分数、反馈和错误类型
- 持续完成整场 session

### Stats

- 连续学习天数
- 练习时长
- 平均分
- 错误类型趋势

### Settings

- 个人资料与每日学习目标
- 后端基础 URL 覆盖
- LLM 提供商配置与连通性测试

## 技术栈

- React 19
- TypeScript
- Vite
- Material UI
- React Router

## 目录结构

```text
src/
  features/
    auth/
    home/
    materials/
    practice/
    settings/
    stats/
  shared/
    api/
    config/
    ui/
  types/
```

## 前后端职责划分

前端主要负责：

- 产品流程与新手引导
- 会话状态与用户反馈体验
- lesson、study unit、stats 的展示
- LLM 配置管理交互

后端主要负责：

- 身份认证
- 学习材料导入与持久化
- YouTube 字幕与音频处理
- 文章正文提取
- 每日计划计算
- 自适应任务生成
- 评分与统计聚合

## 本地开发

### 环境要求

- Node.js 20+
- npm

### 安装与启动

```bash
npm install
npm run dev
```

默认开发地址：

```text
http://localhost:5173
```

### 常用脚本

```bash
npm run build
npm run lint
npm run preview
```

### 后端 API 地址

应用默认从 `VITE_API_BASE_URL` 读取 API Base URL，用户也可以在 Settings 中手动覆盖。

示例：

```text
VITE_API_BASE_URL=http://127.0.0.1:8080
```

## Docker 部署

仓库中已经包含：

- `Dockerfile`
- `docker-compose.yml`
- `nginx/default.conf`

启动方式：

```bash
docker compose up -d --build
```

默认情况下，容器会在 `8088` 端口暴露前端服务。

## 当前重构重点

当前这轮重构主要聚焦于：

- 更清晰的 onboarding 流程
- 从 demo 流程转向用户自有材料
- 从泛化练习转向每日 30 分钟自适应练习
- 从单一全局模型转向按用户管理 LLM 设置
- 更统一的产品文案和交互语言

## 相关仓库

- Frontend: `C:\Users\Lin Chao\Documents\work\english-trainer-web`
- Backend: `C:\Users\Lin Chao\Documents\work\language-agent`
