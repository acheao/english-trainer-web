# 前端需求文档（Web App）

**技术栈**：Vite + React + TypeScript + MUI  
**项目目标**：提供素材管理、练习做题、批改展示、统计看板四大页面；通过 REST API 与后端交互。

## 1. 页面信息架构

### 1.1 路由

- `/materials` 素材管理
    
- `/practice` 练习页（核心）
    
- `/stats` 统计页
    
- `/settings` 设置（MVP 可选：仅 LLM 配置展示/批次大小等）
    
- 默认首页跳转 `/practice`
    

### 1.2 全局布局

- 左侧导航 Drawer（MUI）
    
- 顶部 AppBar：项目名 + 当前 session 状态（可选）
    
- 主区域：页面内容
    
- 全局提示：Snackbar（成功/失败）
    

---

## 2. 功能需求

## 2.1 素材管理页 `/materials`

### 2.1.1 导入素材

- 支持多行文本粘贴：一行一条
    
- 导入参数：
    
    - `type`：auto / sentence / phrase / word（默认 auto）
        
    - `tags`：可选（逗号分隔）
        
- 导入后显示导入结果：成功条数、失败条数、失败原因（后端返回）
    

**组件**

- `MaterialImportDialog`
    
    - TextField multiline
        
    - Select(type)
        
    - Tags input（可简化为 TextField）
        
    - Submit 按钮 + loading
        

### 2.1.2 列表管理

- 表格列：
    
    - content（可折叠/tooltip）
        
    - type
        
    - tags
        
    - enabled（Switch）
        
    - createdAt
        
    - 操作：编辑（可选）、删除（可选）
        
- 搜索：关键字 query
    
- 过滤：enabled / type
    

**MVP 最少**：导入 + 列表 + enabled 开关 + 搜索

---

## 2.2 练习页 `/practice`（核心）

### 2.2.1 开始练习 / 生成一批题

- 用户点击“开始练习”
    
- 弹出配置（可选，MVP 可默认）：
    
    - batchSize：5/10/20（默认10）
        
    - generatorMode：hybrid / llm / db_only（默认 hybrid）
        
- 请求后端创建 session 并返回 questions
    

**组件**

- `StartSessionPanel`
    
- `SessionConfigDialog`（可选）
    

### 2.2.2 做题流程

- 显示当前题目：
    
    - 题型 badge（rewrite/correct/translate/cloze/compose）
        
    - prompt（题面）
        
    - hint（可选）
        
    - 输入框（多行）
        
    - 提交按钮
        
- 提交后：
    
    - loading 状态
        
    - 展示批改结果卡片：
        
        - score
            
        - correctedAnswer
            
        - errorTypes chips
            
        - explanation（中文）
            
        - suggestions（列表）
            
- 导航：
    
    - 自动进入下一题（默认）
        
    - 提供“上一题/下一题”（可选）
        
- 一批结束：
    
    - 显示本批总结（平均分、错误类型 Top）
        
    - 按钮：进入下一批（调用 `/sessions/{id}/next`）
        

**组件**

- `QuestionCard`
    
- `AnswerEditor`
    
- `GradingPanel`
    
- `BatchSummaryDialog`
    

### 2.2.3 状态与缓存

- sessionId 保存在内存（可选 localStorage）
    
- 刷新页面：
    
    - MVP：提示“session 已丢失，重新开始”
        
    - V2：从后端恢复 session
        

---

## 2.3 统计页 `/stats`

### 2.3.1 概览卡片（MVP）

- 今日完成题数
    
- 今日平均分
    
- 今日正确率
    
- 到期复习数量（due count）
    

### 2.3.2 错误类型 Top（MVP）

- Top5 error types（近7天/30天切换可选）
    
- 列表或条形图（MUI + 基础 chart 库可选；MVP 用列表）
    

---

## 2.4 错误处理与体验

- 所有 API 错误统一拦截：
    
    - 401/403（若后续有登录）
        
    - 429（LLM 限流）提示“请求过多，请稍后重试”
        
    - 5xx 提示“服务异常”
        
- 提交答案时如果解析失败（后端返回 `rawText`）：前端展示 rawText 并提示“结构化解析失败”
    

---

## 3. 前端与后端接口契约（前端视角）

> API Base：`/api`

### 3.1 Materials

- `POST /materials/import`
    
    - req: `{ type?: string, tags?: string[], lines: string[] }`
        
    - resp: `{ successCount: number, failCount: number, fails?: { line: string, reason: string }[] }`
        
- `GET /materials`
    
    - query: `?query=&type=&enabled=&page=&size=`
        
    - resp: `{ items: MaterialDTO[], total: number }`
        
- `PATCH /materials/{id}`
    
    - req: `{ enabled?: boolean, type?: string, tags?: string[] , content?: string }`
        
    - resp: `MaterialDTO`
        

### 3.2 Practice

- `POST /sessions`
    
    - req: `{ batchSize: number, generatorMode: "hybrid"|"llm"|"db_only" }`
        
    - resp: `{ sessionId: string, questions: QuestionDTO[] }`
        
- `POST /answers`
    
    - req: `{ questionId: string, userAnswer: string, timeSpentMs?: number }`
        
    - resp: `GradingDTO`
        
- `POST /sessions/{sessionId}/next`
    
    - resp: `{ questions: QuestionDTO[] }`
        

### 3.3 Stats

- `GET /stats/overview`
    
    - resp: `{ todayDone:number, todayAvgScore:number, todayAccuracy:number, dueCount:number }`
        
- `GET /stats/error-types?range=7d|30d`
    
    - resp: `{ items: { errorType:string, count:number, lastSeenAt:string }[] }`
        

---

## 4. DTO（前端类型定义）

export type MaterialDTO = {  
  id: string;  
  type: "sentence"|"phrase"|"word"|"auto";  
  content: string;  
  tags: string[];  
  enabled: boolean;  
  createdAt: string;  
};  
  
export type QuestionDTO = {  
  id: string;  
  sessionId: string;  
  materialId?: string;  
  type: "rewrite"|"correct"|"translate"|"cloze"|"compose";  
  prompt: string;  
  referenceAnswer?: string[]; // optional for UI  
  difficulty?: number;  
  targetErrorTypes?: string[];  
};  
  
export type GradingDTO = {  
  score: number;  
  isCorrect: boolean;  
  correctedAnswer: string;  
  errorTypes: string[];  
  explanationZh: string;  
  suggestions: string[];  
  confidence?: number;  
  rawText?: string; // fallback  
};

---

## 5. 前端验收标准（MVP）

1. 能导入多行素材并在列表看到
    
2. 能开始练习并拿到 10 题
    
3. 每题提交后展示 score/纠正句/error types/中文解释/建议
    
4. 做完一批后可点击“下一批”继续
    
5. 统计页能显示今日数据与错误类型 Top