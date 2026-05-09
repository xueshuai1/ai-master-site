// Knowledge base data - AI learning articles

export interface ArticleSection {
  title: string;
  body?: string;
  body2?: string;
  code?: { lang: string; code: string; filename?: string; title?: string }[];
  table?: { headers: string[]; rows: string[][] };
  mermaid?: string;
  list?: string[];
  tip?: string;
  warning?: string;
}

export type CategoryKey = "ml" | "dl" | "nlp" | "cv" | "llm" | "agent" | "rl" | "genai" | "multimodal" | "aieng" | "practice" | "mlops" | "ethics" | "math" | "prompt";

export interface Article {
  id: string;
  title: string;
  category: CategoryKey;
  tags: string[];
  summary: string;
  date: string;          // 创建日期
  updatedAt?: string;    // 更新日期（仅当文章被更新时存在）
  readTime: string;
  level: "入门" | "进阶" | "高级";
  content?: ArticleSection[];
  // 学习路径元数据（2026-05-08 新增）
  learningPath?: {
    /** 所属学习路线 ID */
    routeId?: string;
    /** 在路线中的阶段序号 */
    phase?: number;
    /** 在同阶段内的阅读顺序 */
    order?: number;
    /** 建议先读的文章 ID 列表 */
    prerequisites?: string[];
    /** 读完本文后推荐下一篇 */
    nextStep?: string | null;
    /** 系列上一篇 */
    prevStep?: string | null;
  };
}

export const categories = [
  { key: "all", label: "全部", icon: "📋" },
  { key: "ml", label: "机器学习", icon: "📊" },
  { key: "dl", label: "深度学习", icon: "🧠" },
  { key: "nlp", label: "自然语言处理", icon: "💬" },
  { key: "cv", label: "计算机视觉", icon: "👁️" },
  { key: "prompt", label: "Prompt Engineering", icon: "✏️" },
  { key: "llm", label: "大语言模型", icon: "🤖" },
  { key: "agent", label: "AI Agent", icon: "🦾" },
  { key: "rl", label: "强化学习", icon: "🎮" },
  { key: "genai", label: "生成式 AI", icon: "🎨" },
  { key: "multimodal", label: "多模态学习", icon: "🔗" },
  { key: "aieng", label: "AI 工程化", icon: "🔧" },
  { key: "practice", label: "实践应用", icon: "🌍" },
  { key: "mlops", label: "MLOps 与部署", icon: "🚀" },
  { key: "ethics", label: "AI 伦理与安全", icon: "⚖️" },
  { key: "math", label: "数学基础", icon: "📐" }];

import { article as agent001 } from './articles/agent-001';
import { article as agent002 } from './articles/agent-002';
import { article as agent003 } from './articles/agent-003';
import { article as agent004 } from './articles/agent-004';
import { article as agent005 } from './articles/agent-005';
import { article as agent006 } from './articles/agent-006';
import { article as agent007 } from './articles/agent-007';
import { article as agent008 } from './articles/agent-008';
import { article as aieng001 } from './articles/aieng-001';
import { article as aieng002 } from './articles/aieng-002';
import { article as aieng003 } from './articles/aieng-003';
import { article as aieng005 } from './articles/aieng-005';
import { article as aieng006 } from './articles/aieng-006';
import { article as aieng007 } from './articles/aieng-007';
import { article as aieng008 } from './articles/aieng-008';
import { article as aieng009 } from './articles/aieng-009';
import { article as aieng010 } from './articles/aieng-010';
import { article as aieng017 } from './articles/aieng-017';
import { article as cv001 } from './articles/cv-001';
import { article as cv002 } from './articles/cv-002';
import { article as cv003 } from './articles/cv-003';
import { article as cv004 } from './articles/cv-004';
import { article as cv005 } from './articles/cv-005';
import { article as cv006 } from './articles/cv-006';
import { article as cv007 } from './articles/cv-007';
import { article as cv008 } from './articles/cv-008';
import { article as cv009 } from './articles/cv-009';
import { article as cv010 } from './articles/cv-010';
import { article as cv011 } from './articles/cv-011';
import { article as cv012 } from './articles/cv-012';
import { article as dl001 } from './articles/dl-001';
import { article as dl002 } from './articles/dl-002';
import { article as dl003 } from './articles/dl-003';
import { article as dl004 } from './articles/dl-004';
import { article as dl005 } from './articles/dl-005';
import { article as dl006 } from './articles/dl-006';
import { article as dl007 } from './articles/dl-007';
import { article as dl008 } from './articles/dl-008';
import { article as dl009 } from './articles/dl-009';
import { article as dl010 } from './articles/dl-010';
import { article as dl012 } from './articles/dl-012';
import { article as dl013 } from './articles/dl-013';
import { article as dl014 } from './articles/dl-014';
import { article as dl015 } from './articles/dl-015';
import { article as dl016 } from './articles/dl-016';
import { article as dl017 } from './articles/dl-017';
import { article as ethics001 } from './articles/ethics-001';
import { article as dl018 } from './articles/dl-018';
import { article as dl019 } from './articles/dl-019';
import { article as dl020 } from './articles/dl-020';
import { article as ethics002 } from './articles/ethics-002';
import { article as ethics003 } from './articles/ethics-003';
import { article as ethics004 } from './articles/ethics-004';
import { article as ethics005 } from './articles/ethics-005';
import { article as ethics006 } from './articles/ethics-006';
import { article as genai001 } from './articles/genai-001';
import { article as genai002 } from './articles/genai-002';
import { article as genai003 } from './articles/genai-003';
import { article as genai004 } from './articles/genai-004';
import { article as genai005 } from './articles/genai-005';
import { article as genai006 } from './articles/genai-006';
import { article as genai007 } from './articles/genai-007';
import { article as genai008 } from './articles/genai-008';
import { article as genai009 } from './articles/genai-009';
import { article as llm001 } from './articles/llm-001';
import { article as llm002 } from './articles/llm-002';
import { article as llm003 } from './articles/llm-003';
import { article as llm005 } from './articles/llm-005';
import { article as llm006 } from './articles/llm-006';
import { article as llm008 } from './articles/llm-008';
import { article as llm009 } from './articles/llm-009';
import { article as llm010 } from './articles/llm-010';
import { article as llm011 } from './articles/llm-011';
import { article as llm012 } from './articles/llm-012';
import { article as math001 } from './articles/math-001';
import { article as math002 } from './articles/math-002';
import { article as math003 } from './articles/math-003';
import { article as math004 } from './articles/math-004';
import { article as math005 } from './articles/math-005';
import { article as math006 } from './articles/math-006';
import { article as math007 } from './articles/math-007';
import { article as math008 } from './articles/math-008';
import { article as ml001 } from './articles/ml-001';
import { article as ml002 } from './articles/ml-002';
import { article as ml003 } from './articles/ml-003';
import { article as ml004 } from './articles/ml-004';
import { article as ml005 } from './articles/ml-005';
import { article as ml006 } from './articles/ml-006';
import { article as ml007 } from './articles/ml-007';
import { article as ml008 } from './articles/ml-008';
import { article as ml009 } from './articles/ml-009';
import { article as ml010 } from './articles/ml-010';
import { article as ml011 } from './articles/ml-011';
import { article as ml012 } from './articles/ml-012';
import { article as ml013 } from './articles/ml-013';
import { article as ml014 } from './articles/ml-014';
import { article as ml015 } from './articles/ml-015';
import { article as ml016 } from './articles/ml-016';
import { article as ml017 } from './articles/ml-017';
import { article as ml018 } from './articles/ml-018';
import { article as ml019 } from './articles/ml-019';
import { article as ml020 } from './articles/ml-020';
import { article as ml021 } from './articles/ml-021';
import { article as ml022 } from './articles/ml-022';
import { article as mlops001 } from './articles/mlops-001';
import { article as mlops002 } from './articles/mlops-002';
import { article as mlops003 } from './articles/mlops-003';
import { article as mlops004 } from './articles/mlops-004';
import { article as mlops005 } from './articles/mlops-005';
import { article as mlops006 } from './articles/mlops-006';
import { article as mm001 } from './articles/mm-001';
import { article as mm002 } from './articles/mm-002';
import { article as mm003 } from './articles/mm-003';
import { article as mm004 } from './articles/mm-004';
import { article as mm005 } from './articles/mm-005';
import { article as mm006 } from './articles/mm-006';
import { article as nlp001 } from './articles/nlp-001';
import { article as nlp002 } from './articles/nlp-002';
import { article as nlp003 } from './articles/nlp-003';
import { article as nlp004 } from './articles/nlp-004';
import { article as nlp005 } from './articles/nlp-005';
import { article as nlp006 } from './articles/nlp-006';
import { article as nlp007 } from './articles/nlp-007';
import { article as nlp008 } from './articles/nlp-008';
import { article as nlp009 } from './articles/nlp-009';
import { article as nlp010 } from './articles/nlp-010';
import { article as practice001 } from './articles/practice-001';
import { article as practice002 } from './articles/practice-002';
import { article as practice003 } from './articles/practice-003';
import { article as practice004 } from './articles/practice-004';
import { article as practice005 } from './articles/practice-005';
import { article as practice006 } from './articles/practice-006';
import { article as practice007 } from './articles/practice-007';
import { article as practice008 } from './articles/practice-008';
import { article as rl001 } from './articles/rl-001';
import { article as rl002 } from './articles/rl-002';
import { article as rl003 } from './articles/rl-003';
import { article as rl004 } from './articles/rl-004';
import { article as rl005 } from './articles/rl-005';
import { article as rl006 } from './articles/rl-006';
import { article as rl007 } from './articles/rl-007';
import { article as rl008 } from './articles/rl-008';
import { article as ethics007 } from './articles/ethics-007';
import { article as ethics008 } from './articles/ethics-008';
import { article as ethics009 } from './articles/ethics-009';
import { article as mm007 } from './articles/mm-007';
import { article as mlops007 } from './articles/mlops-007';
import { article as mlops008 } from './articles/mlops-008';
import { article as synthdata001 } from './articles/synthdata-001';
import { article as ml023 } from './articles/ml-023';
import { article as ml024 } from './articles/ml-024';
import { article as ai000 } from './articles/ai-000';
import { article as ai001 } from './articles/ai-001';
import { article as ai002 } from './articles/ai-002';
import { article as ai003 } from './articles/ai-003';
import { article as ai004 } from './articles/ai-004';
import { article as rl009 } from './articles/rl-009';
import { article as rl010 } from './articles/rl-010';
import { article as rl011 } from './articles/rl-011';
import { article as agent009 } from './articles/agent-009';
import { article as agent010 } from './articles/agent-010';
import { article as agent011 } from './articles/agent-011';
import { article as aiSecurity001 } from './articles/ai-security-001';
import { article as aiSecurity002 } from './articles/ai-security-002';
import { article as aiSecurity003 } from './articles/ai-security-003';
import { article as edge001 } from './articles/edge-001';
import { article as llm013 } from './articles/llm-013';
import { article as agent012 } from './articles/agent-012';
import { article as llm014 } from './articles/llm-014';
import { article as mm008 } from './articles/mm-008';
import { article as aiSecurity004 } from './articles/ai-security-004';
import { article as aiSecurity005 } from './articles/ai-security-005';
import { article as aiSecurity006 } from './articles/ai-security-006';
import { article as aiSecurity007 } from './articles/ai-security-007';
import { article as aiSecurity008 } from './articles/ai-security-008';
import { article as llm015 } from './articles/llm-015';
import { article as llm016 } from './articles/llm-016';
import { article as llm017 } from './articles/llm-017';
import { article as llm018 } from './articles/llm-018';
import { article as mm009 } from './articles/mm-009';
import { article as agent013 } from './articles/agent-013';
import { article as agent014 } from './articles/agent-014';
import { article as agent015 } from './articles/agent-015';
import { article as agent016 } from './articles/agent-016';
import { article as agent017 } from './articles/agent-017';
import { article as aieng011 } from './articles/aieng-011';
import { article as aieng012 } from './articles/aieng-012';
import { article as aieng013 } from './articles/aieng-013';
import { article as practice009 } from './articles/practice-009';
import { article as practice010 } from './articles/practice-010';
import { article as practice011 } from './articles/practice-011';
import { article as practice012 } from './articles/practice-012';
import { article as voice001 } from './articles/voice-001';
import { article as voice002 } from './articles/voice-002';
import { article as voice003 } from './articles/voice-003';
import { article as agent018 } from './articles/agent-018';
import { article as promptGuide } from './articles/prompt-guide';
import { article as prompt001 } from './articles/prompt-001';
import { article as llmAppGuide } from './articles/llm-app-guide';
import { article as agentGuide } from './articles/agent-guide';
import { article as aiengGuide } from './articles/aieng-guide';
import { article as mathMlGuide } from './articles/math-ml-guide';
import { article as dlGuide } from './articles/dl-guide';
import { article as rlGuide } from './articles/rl-guide';
import { article as nlpGuide } from './articles/nlp-guide';
import { article as cvGuide } from './articles/cv-guide';
import { article as mmGuide } from './articles/mm-guide';
import { article as genaiGuide } from './articles/genai-guide';
import { article as securityGuide } from './articles/security-guide';
import { article as infer001 } from './articles/infer-001';
import { article as physical001 } from './articles/physical-001';
import { article as physical002 } from './articles/physical-002';
import { article as anthropicClaude } from './articles/anthropic-claude';
import { article as ai4science001 } from './articles/ai4science-001';
import { article as anthropic002 } from './articles/anthropic-002';
import { article as codex001 } from './articles/codex-001';
import { article as agent019 } from './articles/agent-019';
import { article as agent020 } from './articles/agent-020';
import { article as agent021 } from './articles/agent-021';
import { article as headlessAi001 } from './articles/headless-ai-001';
import { article as infra001 } from './articles/infra-001';
import { article as agent022 } from './articles/agent-022';
import { article as agent023 } from './articles/agent-023';
import { article as multiAgent001 } from './articles/multi-agent-001';
import { article as finance001 } from './articles/finance-001';
import { article as mcp001 } from './articles/mcp-001';
import { article as aiSecurity009 } from './articles/ai-security-009';
import { article as aiSecurity010 } from './articles/ai-security-010';
import { article as aiSecurity011 } from './articles/ai-security-011';
import { article as aiSecurity012 } from './articles/ai-security-012';
import { article as aiSecurity013 } from './articles/ai-security-013';
import { article as agent024 } from './articles/agent-024';
import { article as agent025 } from './articles/agent-025';
import { article as aieng014 } from './articles/aieng-014';
import { article as aieng015 } from './articles/aieng-015';
import { article as aieng016 } from './articles/aieng-016';
import { article as infer002 } from './articles/infer-002';
import { article as tokenEconomics } from './articles/token-economics';
import { article as voice004 } from './articles/voice-004';
import { article as practice013 } from './articles/practice-013';
import { article as agent026 } from './articles/agent-026';
import { article as agent027 } from './articles/agent-027';
import { article as agent028 } from './articles/agent-028';
import { article as agent029 } from './articles/agent-029';
import { article as llm019 } from './articles/llm-019';
import { article as llm020 } from './articles/llm-020';
import { article as prompt002 } from './articles/prompt-002';
import { article as prompt003 } from './articles/prompt-003';
import { article as aiobs001 } from './articles/aiobs-001';
import { article as llm021 } from './articles/llm-021';
import { article as aieng019 } from './articles/aieng019';
import { article as aieng021 } from './articles/aieng-021';
import { article as agent030 } from './articles/agent-030';
import { article as agent031 } from './articles/agent-031';
import { article as agent032 } from './articles/agent-032';
import { article as agent033 } from './articles/agent-033';
import { article as agent034 } from './articles/agent-034';
import { article as agent035 } from './articles/agent-035';
import { article as agent036 } from './articles/agent-036';
import { article as agent037 } from './articles/agent-037';
import { article as agent038 } from './articles/agent-038';
import { article as agent039 } from './articles/agent-039';
import { article as ethics010 } from './articles/ethics-010';
import { article as ethics011 } from './articles/ethics-011';
import { article as ethics012 } from './articles/ethics-012';
import { article as ethics013 } from './articles/ethics-013';
import { article as ethics014 } from './articles/ethics-014';
import { article as guardAct001 } from './articles/guard-act-001';
import { article as practice014 } from './articles/practice-014';
import { article as llm022 } from './articles/llm-022';
import { article as llm023 } from './articles/llm-023';
import { article as llm024 } from './articles/llm-024';
import { article as aieng023 } from './articles/aieng-023';
import { article as aieng024 } from './articles/aieng-024';
import { article as aieng025 } from './articles/aieng-025';
import { article as agent040 } from './articles/agent-040';
import { article as agent041 } from './articles/agent-041';
import { article as agent042 } from './articles/agent-042';
import { article as agent043 } from './articles/agent-043';
import { article as aiChipChina001 } from './articles/ai-chip-china-001';
import { article as aiAgentPayment001 } from './articles/ai-agent-payment-001';
import { article as appleAi001 } from './articles/apple-ai-001';
import { article as chinaLlmScale001 } from './articles/china-llm-scale-001';
import { article as aiDistillation001 } from './articles/ai-distillation-001';
import { article as mm010 } from './articles/mm-010';
import { article as mm011 } from './articles/mm-011';
import { article as legalAi001 } from './articles/legal-ai-001';
import { article as aieng022 } from './articles/aieng-022';
import { article as entertainmentAi001 } from './articles/entertainment-ai-001';
import { article as aiInfra001 } from './articles/ai-infra-001';
import { article as agent044 } from './articles/agent-044';
import { article as agent045 } from './articles/agent-045';
import { article as agent046 } from './articles/agent-046';
import { article as agent047 } from './articles/agent-047';
import { article as infra002 } from './articles/infra-002';
import { article as prac001 } from './articles/prac-001';
import { article as prac002 } from './articles/prac-002';
import { article as agent048 } from './articles/agent-048';
import { article as agent049 } from './articles/agent-049';
import { article as securityAudit001 } from './articles/security-audit-001';
import { article as securityAudit002 } from './articles/security-audit-002';
import { article as geo001 } from './articles/geo-001';
import { article as agent050 } from './articles/agent-050';
import { article as agent051 } from './articles/agent-051';
import { article as agent052 } from './articles/agent-052';
export const articles: Article[] = [headlessAi001,ai000,promptGuide,prompt001,llmAppGuide,agentGuide,aiengGuide,mathMlGuide,dlGuide,rlGuide,nlpGuide,cvGuide,mmGuide,genaiGuide,securityGuide,infer001,physical001,physical002,anthropicClaude,ai4science001,anthropic002,infra001,multiAgent001,finance001,mcp001,aieng014,aiobs001,agent001,agent002,agent003,agent004,agent005,agent006,agent007,agent008,agent009,agent010,agent011,agent012,agent013,agent014,agent015,agent016,agent017,aieng001,aieng002,aieng003,aieng005,aieng006,aieng007,aieng008,aieng009,aieng010,aieng011,aieng012,aieng013,cv001,cv002,cv003,cv004,cv005,cv006,cv007,cv008,cv009,cv010,cv011,cv012,dl001,dl002,dl003,dl004,dl005,dl006,dl007,dl008,dl009,dl010,dl012,dl013,dl014,dl015,dl016,dl017,dl018,dl019,dl020,ethics001,ethics002,ethics003,ethics004,ethics005,ethics006,ethics007,ethics008,ethics009,genai001,genai002,genai003,genai004,genai005,genai006,genai007,genai008,genai009,llm001,llm002,llm003,llm005,llm006,llm008,llm009,llm010,llm011,llm012,llm013,llm014,llm015,llm016,llm017,llm018,math001,math002,math003,math004,math005,math006,math007,math008,ml001,ml002,ml003,ml004,ml005,ml006,ml007,ml008,ml009,ml010,ml011,ml012,ml013,ml014,ml015,ml016,ml017,ml018,ml019,ml020,ml021,ml022,ml023,ml024,mlops001,mlops002,mlops003,mlops004,mlops005,mlops006,mlops007,mlops008,mm001,mm002,mm003,mm004,mm005,mm006,mm007,mm008,mm009,nlp001,nlp002,nlp003,nlp004,nlp005,nlp006,nlp007,nlp008,nlp009,nlp010,practice001,practice002,practice003,practice004,practice005,practice006,practice007,practice008,practice009,practice010,practice011,practice012,rl001,rl002,rl003,rl004,rl005,rl006,rl007,rl008,rl009,rl010,rl011,synthdata001,ai001,ai002,ai003,ai004,aiSecurity001,aiSecurity002,aiSecurity003,aiSecurity004,aiSecurity005,aiSecurity006,aiSecurity007,edge001,voice001,voice002,voice003,voice004,agent018,aiSecurity008,codex001,agent019,agent020,agent021,agent022,agent023,aiSecurity009,aiSecurity010,aiSecurity011,aiSecurity012,aiSecurity013,agent024,agent025,agent026,agent027,agent028,agent029,agent030,agent031,agent032,agent033,agent034,llm019,llm020,infer002,tokenEconomics,prompt002,prompt003,practice013,aieng015,llm021,aieng017,aieng019,aieng021,agent035,agent036,agent037,agent038,agent039,ethics010,ethics011,ethics012,agent040,aieng016,agent041, agent042, agent043, agent044, agent045, aiChipChina001, aiAgentPayment001, appleAi001, chinaLlmScale001, aiDistillation001, mm010, mm011, legalAi001, aieng022, entertainmentAi001, aiInfra001, ethics013, ethics014, guardAct001, practice014, llm022, llm023, llm024, aieng023, aieng024, aieng025, agent046, agent047, infra002, prac001, prac002, agent048, agent049, securityAudit001, securityAudit002, geo001, agent050, agent051, agent052];
