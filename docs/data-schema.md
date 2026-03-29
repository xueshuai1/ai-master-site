# 数据结构 Schema 文档

本文档定义了面试题和知识库的结构化数据格式，用于统一 API 接口和前端展示。

---

## 一、面试题 JSON Schema

### 1.1 数据结构定义

```typescript
interface InterviewQuestion {
  // 基础信息
  id: string;              // 唯一标识符，格式：{CATEGORY}-{NUMBER}
  title: string;           // 题目标题
  category: string;        // 分类（LLM, RL, NLP, CV, ML, DL 等）
  difficulty: string;      // 难度等级：⭐, ⭐⭐, ⭐⭐⭐
  tags: string[];          // 标签数组
  
  // 来源信息
  source: string;          // 题目来源
  sourceUrl: string;       // 来源链接（可选）
  collectedAt: string;     // 收集日期（ISO 8601 格式）
  
  // 题目内容
  description: string;     // 题目描述（支持 Markdown）
  requirements: string[];  // 答题要求列表
  
  // 参考答案
  answer: {
    summary: string;       // 答案摘要（1-2 句话）
    coreFormula?: string;  // 核心公式（可选）
    sections: Section[];   // 答案章节
  };
  
  // 考察重点（三维度）
  evaluation: {
    knowledge: string;     // 知识维度考察点
    ability: string;       // 能力维度考察点
    thinking: string;      // 思维维度考察点
  };
  
  // 延伸追问（25 分）
  followUpQuestions: FollowUpQuestion[];
  
  // 补充内容
  deepUnderstanding?: string;  // 深入理解说明（可选）
  references?: Reference[];    // 参考资料（可选）
  
  // 元数据
  version: {
    number: string;        // 版本号：v1, v2, ...
    updatedAt: string;     // 更新时间
    changeLog: string;     // 变更说明
  };
}

interface Section {
  title: string;           // 章节标题
  content: string;         // 章节内容（支持 Markdown）
  code?: CodeSnippet;      // 代码示例（可选）
  diagram?: string;        // 图表描述（可选）
}

interface CodeSnippet {
  language: string;        // 编程语言
  code: string;            // 代码内容
  explanation?: string;    // 代码说明
}

interface FollowUpQuestion {
  question: string;        // 追问问题
  points: number;          // 分值（通常 5 分）
  answerHint?: string;     // 答案提示（可选）
}

interface Reference {
  title: string;           // 资料标题
  url: string;             // 链接
  type: string;            // 类型：paper, blog, video, doc
}
```

### 1.2 JSON Schema 示例

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "InterviewQuestion",
  "type": "object",
  "required": ["id", "title", "category", "difficulty", "tags", "description", "answer", "evaluation", "followUpQuestions", "version"],
  "properties": {
    "id": { "type": "string", "pattern": "^[A-Z]+-[0-9]+$" },
    "title": { "type": "string", "minLength": 1 },
    "category": { "type": "string" },
    "difficulty": { "type": "string", "enum": ["⭐", "⭐⭐", "⭐⭐⭐"] },
    "tags": { "type": "array", "items": { "type": "string" } },
    "source": { "type": "string" },
    "sourceUrl": { "type": "string", "format": "uri" },
    "collectedAt": { "type": "string", "format": "date" },
    "description": { "type": "string" },
    "requirements": { "type": "array", "items": { "type": "string" } },
    "answer": {
      "type": "object",
      "required": ["summary", "sections"],
      "properties": {
        "summary": { "type": "string" },
        "coreFormula": { "type": "string" },
        "sections": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["title", "content"],
            "properties": {
              "title": { "type": "string" },
              "content": { "type": "string" },
              "code": {
                "type": "object",
                "properties": {
                  "language": { "type": "string" },
                  "code": { "type": "string" },
                  "explanation": { "type": "string" }
                }
              }
            }
          }
        }
      }
    },
    "evaluation": {
      "type": "object",
      "required": ["knowledge", "ability", "thinking"],
      "properties": {
        "knowledge": { "type": "string" },
        "ability": { "type": "string" },
        "thinking": { "type": "string" }
      }
    },
    "followUpQuestions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["question", "points"],
        "properties": {
          "question": { "type": "string" },
          "points": { "type": "number", "minimum": 1 },
          "answerHint": { "type": "string" }
        }
      }
    },
    "version": {
      "type": "object",
      "required": ["number", "updatedAt", "changeLog"],
      "properties": {
        "number": { "type": "string" },
        "updatedAt": { "type": "string", "format": "date-time" },
        "changeLog": { "type": "string" }
      }
    }
  }
}
```

---

## 二、知识库 JSON Schema

### 2.1 数据结构定义

```typescript
interface KnowledgeArticle {
  // 基础信息
  id: string;              // 唯一标识符，格式：{CATEGORY}-{NUMBER}
  title: string;           // 文章标题
  category: string;        // 分类（LLM, RL, NLP, CV, ML, DL 等）
  difficulty: string;      // 难度等级：⭐, ⭐⭐, ⭐⭐⭐
  tags: string[];          // 标签数组
  
  // 元信息
  author?: string;         // 作者（可选）
  createdAt: string;       // 创建日期
  updatedAt: string;       // 更新日期
  readTime: number;        // 阅读时长（分钟）
  
  // 内容结构
  abstract: string;        // 摘要（200-300 字）
  sections: ArticleSection[];  // 文章章节
  
  // 学习辅助
  keyTakeaways: string[];  // 关键要点（3-5 条）
  prerequisites: string[]; // 前置知识
  relatedArticles: string[];  // 相关文章 ID 列表
  
  // 视觉元素
  diagrams: Diagram[];     // 图表列表
  codeExamples: CodeExample[];  // 代码示例
  
  // 参考资料
  references: Reference[]; // 参考资料
  
  // 元数据
  version: string;         // 版本号
}

interface ArticleSection {
  id: string;              // 章节 ID
  title: string;           // 章节标题
  level: number;           // 章节层级（1, 2, 3...）
  content: string;         // 章节内容（Markdown）
  subsections?: ArticleSection[];  // 子章节
}

interface Diagram {
  id: string;              // 图表 ID
  title: string;           // 图表标题
  description: string;     // 图表描述
  type: string;            // 类型：flowchart, architecture, comparison
  content: string;         // 图表内容（Mermaid 或图片 URL）
}

interface CodeExample {
  id: string;              // 示例 ID
  title: string;           // 示例标题
  language: string;        // 编程语言
  code: string;            // 代码内容
  explanation: string;     // 代码说明
}
```

### 2.2 JSON Schema 示例

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "KnowledgeArticle",
  "type": "object",
  "required": ["id", "title", "category", "abstract", "sections", "keyTakeaways", "version"],
  "properties": {
    "id": { "type": "string" },
    "title": { "type": "string" },
    "category": { "type": "string" },
    "difficulty": { "type": "string", "enum": ["⭐", "⭐⭐", "⭐⭐⭐"] },
    "tags": { "type": "array", "items": { "type": "string" } },
    "author": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" },
    "readTime": { "type": "number", "minimum": 1 },
    "abstract": { "type": "string", "maxLength": 500 },
    "sections": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "title", "level", "content"],
        "properties": {
          "id": { "type": "string" },
          "title": { "type": "string" },
          "level": { "type": "number", "minimum": 1 },
          "content": { "type": "string" },
          "subsections": {
            "type": "array",
            "items": { "$ref": "#" }
          }
        }
      }
    },
    "keyTakeaways": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 3,
      "maxItems": 5
    },
    "prerequisites": { "type": "array", "items": { "type": "string" } },
    "relatedArticles": { "type": "array", "items": { "type": "string" } },
    "version": { "type": "string" }
  }
}
```

---

## 三、API 接口定义

### 3.1 面试题 API

#### GET `/api/questions`
获取面试题列表

**Query Parameters:**
- `category?: string` - 按分类筛选
- `difficulty?: string` - 按难度筛选
- `tag?: string` - 按标签筛选
- `search?: string` - 搜索关键词
- `limit?: number` - 返回数量限制（默认 50）
- `offset?: number` - 偏移量（默认 0）

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": InterviewQuestion[],
    "pagination": {
      "total": number,
      "limit": number,
      "offset": number,
      "hasMore": boolean
    },
    "facets": {
      "categories": [{ "name": string, "count": number }],
      "difficulties": [{ "name": string, "count": number }],
      "tags": [{ "name": string, "count": number }]
    }
  }
}
```

#### GET `/api/questions/[id]`
获取单道面试题详情

**Response:**
```json
{
  "success": true,
  "data": InterviewQuestion
}
```

### 3.2 知识库 API

#### GET `/api/knowledge`
获取知识库文章列表

**Query Parameters:**
- `category?: string` - 按分类筛选
- `tag?: string` - 按标签筛选
- `search?: string` - 搜索关键词

**Response:**
```json
{
  "success": true,
  "data": {
    "articles": KnowledgeArticle[],
    "categories": string[]
  }
}
```

#### GET `/api/knowledge/[category]`
获取指定分类的文章列表

**Response:**
```json
{
  "success": true,
  "data": {
    "category": string,
    "articles": KnowledgeArticle[]
  }
}
```

#### GET `/api/knowledge/[category]/[id]`
获取单篇文章详情

**Response:**
```json
{
  "success": true,
  "data": KnowledgeArticle
}
```

---

## 四、文件存储结构

```
ai-interview-questions/
├── data/
│   ├── questions/           # 结构化面试题数据
│   │   ├── LLM/
│   │   │   ├── LLM-001.json
│   │   │   └── LLM-002.json
│   │   ├── RL/
│   │   └── ...
│   └── knowledge/           # 结构化知识库数据
│       ├── LLM/
│       │   ├── LLM-001.json
│       │   └── LLM-002.json
│       └── ...
├── questions/               # 原始 MD 文件（保留备份）
└── ai-knowledge-base/       # 原始 MD 文件（保留备份）
```

---

## 五、数据迁移规范

### 5.1 MD 转 JSON 规则

1. **Frontmatter 解析**：提取 YAML frontmatter 作为基础字段
2. **内容分段**：根据 Markdown 标题（##, ###）分割内容到 sections
3. **代码提取**：识别 ``` 代码块，转换为 code 对象
4. **表格转换**：Markdown 表格转为结构化数据或保留为 Markdown
5. **元数据补充**：自动添加 version、createdAt、updatedAt

### 5.2 版本控制

- 原始 MD 文件保留在原地作为备份
- 新数据存入 `data/` 目录
- API 优先读取 `data/` 目录的 JSON 文件
- 提供迁移脚本支持批量转换

---

## 六、前端展示规范

### 6.1 面试题库页面
- 卡片式展示，显示：标题、分类、难度、标签
- 支持分类/难度/标签筛选
- 支持搜索功能
- 显示题目数量统计

### 6.2 题目详情页
- **题目描述区域**：清晰展示题目要求
- **参考答案区域**：
  - 答案摘要（突出显示）
  - 核心公式（如有，使用公式渲染）
  - 分章节展示（支持折叠/展开）
  - 代码高亮显示
- **考察重点区域**：三维度展示（知识/能力/思维）
- **延伸追问区域**：25 分追问列表（可折叠）
- **参考资料区域**：链接列表

### 6.3 知识库页面
- 分类导航
- 文章列表（标题、摘要、阅读时长）
- 标签云

### 6.4 文章详情页
- 目录导航（TOC）
- 分章节展示
- 关键要点侧边栏
- 代码示例高亮
- 图表渲染（Mermaid）
- 相关文章推荐

---

## 更新历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| v1.0 | 2026-03-29 | 初始版本，定义基础 Schema |
