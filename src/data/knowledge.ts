// Knowledge base data - AI learning articles

export interface ArticleSection {
  title: string;
  body?: string;
  code?: { lang: string; code: string; filename?: string }[];
  table?: { headers: string[]; rows: string[][] };
  mermaid?: string;
  list?: string[];
  tip?: string;
  warning?: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  date: string;
  readTime: string;
  level: "入门" | "进阶" | "高级";
  content?: ArticleSection[];
}

export const categories = [
  { key: "all", label: "全部", icon: "📋" },
  { key: "ml", label: "机器学习", icon: "📊" },
  { key: "dl", label: "深度学习", icon: "🧠" },
  { key: "nlp", label: "自然语言处理", icon: "💬" },
  { key: "cv", label: "计算机视觉", icon: "👁️" },
  { key: "llm", label: "大语言模型", icon: "🤖" },
  { key: "agent", label: "AI Agent", icon: "🦾" },
  { key: "rl", label: "强化学习", icon: "🎮" },
  { key: "genai", label: "生成式 AI", icon: "🎨" },
  { key: "multimodal", label: "多模态学习", icon: "🔗" },
  { key: "aieng", label: "AI 工程化", icon: "🔧" },
  { key: "practice", label: "实践应用", icon: "🌍" },
  { key: "mlops", label: "MLOps 与部署", icon: "🚀" },
  { key: "ethics", label: "AI 伦理与安全", icon: "⚖️" },
  { key: "math", label: "数学基础", icon: "📐" },
];

import { article as ml001 } from './articles/ml-001';
import { article as ml002 } from './articles/ml-002';
import { article as ml003 } from './articles/ml-003';
import { article as ml004 } from './articles/ml-004';
import { article as ml005 } from './articles/ml-005';
import { article as ml006 } from './articles/ml-006';
import { article as ml009 } from './articles/ml-009';
import { article as dl001 } from './articles/dl-001';
import { article as dl002 } from './articles/dl-002';
import { article as dl003 } from './articles/dl-003';
import { article as dl004 } from './articles/dl-004';
import { article as dl005 } from './articles/dl-005';
import { article as dl006 } from './articles/dl-006';
import { article as nlp001 } from './articles/nlp-001';
import { article as nlp002 } from './articles/nlp-002';
import { article as nlp003 } from './articles/nlp-003';
import { article as cv001 } from './articles/cv-001';
import { article as cv002 } from './articles/cv-002';
import { article as cv003 } from './articles/cv-003';
import { article as llm001 } from './articles/llm-001';
import { article as llm002 } from './articles/llm-002';
import { article as llm003 } from './articles/llm-003';
import { article as llm004 } from './articles/llm-004';
import { article as llm005 } from './articles/llm-005';
import { article as llm006 } from './articles/llm-006';
import { article as agent001 } from './articles/agent-001';
import { article as agent002 } from './articles/agent-002';

export const articles: Article[] = [ml001, ml002, ml003, ml004, ml005, ml006, ml009, dl001, dl002, dl003, dl004, dl005, dl006, nlp001, nlp002, nlp003, cv001, cv002, cv003, llm001, llm002, llm003, llm004, llm005, llm006, agent001, agent002];
