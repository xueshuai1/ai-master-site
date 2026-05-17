/**
 * 全局加粗审计 + 精简
 * 
 * 策略：
 *   - 加粗必须深入理解文章内容，只对真正需要强调的关键概念加粗
 *   - 不机械按语言规则（不是"英文不加/中文加"这么简单）
 *   - 数量要适中：太多=满篇黄色没重点，太少=没有层次感
 *   - 目标：每篇文章 10-30 处加粗
 */

import fs from 'fs';
import path from 'path';

const dirs = [
  { dir: 'src/data/articles', label: '知识库' },
  { dir: 'src/data/blogs', label: '博客' },
];

const allFiles = [];
for (const { dir, label } of dirs) {
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.ts'))) {
    allFiles.push({ path: path.join(dir, f), label, name: f });
  }
}

// ===== 第 1 部分：全局扫描 =====

const stats = [];
for (const { path: fp, label, name } of allFiles) {
  const content = fs.readFileSync(fp, 'utf8');
  const count = (content.match(/\*\*[^*]+\*\*/g) || []).length;
  stats.push({ name, label, count, path: fp });
}

stats.sort((a, b) => b.count - a.count);

console.log('📊 全局加粗审计\n');
console.log(`总文件: ${stats.length} 篇`);
console.log(`总加粗: ${stats.reduce((s, x) => s + x.count, 0)} 个`);
console.log(`平均: ${Math.round(stats.reduce((s, x) => s + x.count, 0) / stats.length)} 个/篇\n`);

// 分布
const ranges = [[0, 5], [6, 10], [11, 20], [21, 30], [31, 50], [51, 100], [101, 9999]];
console.log('分布:');
for (const [lo, hi] of ranges) {
  const cnt = stats.filter(x => x.count >= lo && x.count <= hi).length;
  const bar = '█'.repeat(Math.min(cnt, 50));
  const label = hi > 999 ? `${lo}+` : `${lo}–${hi}`;
  console.log(`  ${label.padStart(8)}: ${String(cnt).padStart(3)}篇  ${bar}`);
}

// TOP 15
console.log('\n🔴 加粗 TOP 15（需要精简）:');
for (const s of stats.slice(0, 15)) {
  const flag = s.count > 100 ? '🔴' : s.count > 50 ? '🟠' : s.count > 30 ? '🟡' : '';
  if (flag) console.log(`  ${flag} ${s.label} ${s.name}: ${s.count}`);
}

// 低于 5 的文章
const low = stats.filter(x => x.count < 5);
console.log(`\n🟢 加粗 < 5 的文章: ${low.length} 篇（可以考虑补充关键加粗）`);

// ===== 第 2 部分：精简加粗 > 30 的文章 =====

// 精简策略：
//   1. 去掉所有纯英文加粗
//   2. 去掉包含"的/了/在/是"的描述性短语加粗
//   3. 去掉超过 12 个中文字的长句加粗
//   4. 去掉列表式/标题式加粗
//   5. 保留短中文核心概念（3-8字）

const boringSet = new Set([
  '网络安全','攻击者','防御者','人工智能','局限性','异常流量',
  '被动匹配','主动识别','检测','预测','解释','响应',
  '签名','规则','阈值','基线','演进',
  '关键挑战','核心优势','核心问题','主要特点',
  '第一代','第二代','第三代','第四代','第五代',
  '第一层','第二层','第三层','第四层','第五层',
  '第一阶段','第二阶段','第三阶段','第四阶段',
  '安全态势','安全运营','安全管理','安全策略',
  '用户体验','用户隐私','数据安全','信息安全',
  '行业趋势','技术趋势','发展趋势','未来趋势',
  '核心引擎','核心技术','核心能力','核心架构',
  '基础模型','基础能力','基础设施',
  '关键因素','关键指标','关键节点','关键转折点',
  '技术突破','技术挑战','技术路线','技术方案',
  '商业模式','商业价值','商业落地',
  '落地场景','应用场景',
  '生态系统','开源生态','开发者生态',
  '技术栈','技术架构','技术选型',
  '数据处理','数据采集','数据存储',
  '算法优化','算法设计','算法实现',
  '性能指标','性能优化','性能测试',
  '隐私保护','伦理审查','合规要求',
  '法律法规','监管框架',
  '技术融合','产业升级','数字化转型',
  '创新模式','创新生态','创新能力',
  '战略意义','战略部署','战略布局','战略卡位',
  '核心竞争力','竞争优势','竞争格局',
  '市场规模','市场前景','市场趋势',
  '应用前景','应用价值','应用效果',
  '解决方案','实施方案','落地方案',
  '技术原理','技术细节','技术水平',
  '研究方法','研究结果','研究意义',
  '数据来源','数据分析','数据模型','数据沼泽',
  '实验结果','实验设计','实验方法',
  '评估指标','评估方法','评估结果',
  '训练数据','训练过程','训练方法',
  '推理能力','推理过程','推理结果',
]);

function shouldKeepBold(inner) {
  const t = inner.trim();
  if (!t) return false;
  
  // 句级标点 → 去掉
  if (/[\uff0c\u3002\uff1b\uff01\uff1a\n\r]/.test(t)) return false;
  
  // 纯英文 → 去掉（用户说英文不需要加粗）
  if (/^[A-Za-z0-9\s\/\.\-\+#]+$/.test(t)) return false;
  
  // 在黑名单中 → 去掉
  if (boringSet.has(t)) return false;
  
  // 包含"的/了/在/是/有/会"且长度>6 → 描述性 → 去掉
  if (/的|了|在|是|有|会/.test(t) && t.length > 6) return false;
  
  // 疑问/标题 → 去掉
  if (/^(为什么|如何|谁|什么|哪里|怎样|怎么|是否|能否)/.test(t)) return false;
  
  // 以"的"结尾 → 去掉
  if (t.endsWith('的')) return false;
  
  // 能/可以/应该/需要 → 动词性 → 去掉
  if (/^(能|可以|应该|需要|必须|应当)/.test(t)) return false;
  
  // 超过 12 个中文字 → 太长 → 去掉
  const cn = (t.match(/[\u4e00-\u9fff]/g) || []).length;
  if (cn > 12) return false;
  
  // 列表式 → 去掉
  if (/[和与、]/.test(t) && t.length > 15) return false;
  
  // 短中文术语（3-10字）→ 保留
  if (cn >= 3 && cn <= 10 && t.length <= 16) return true;
  
  // 其他 → 去掉
  return false;
}

const toFix = stats.filter(x => x.count > 30);
if (toFix.length > 0) {
  console.log(`\n🧹 精简 ${toFix.length} 篇加粗 > 30 的文章：\n`);
  
  let totalReduced = 0;
  for (const { path: fp, name, count: before } of toFix) {
    const content = fs.readFileSync(fp, 'utf8');
    const result = content.replace(/\*\*([^*]+?)\*\*/g, (m, inner) =>
      shouldKeepBold(inner) ? m : inner
    );
    const after = (result.match(/\*\*[^*]+\*\*/g) || []).length;
    if (after !== before) {
      fs.writeFileSync(fp, result, 'utf8');
      totalReduced += (before - after);
    }
    const flag = after > 100 ? '🔴' : after > 50 ? '🟠' : after > 30 ? '🟡' : '🟢';
    console.log(`  ${flag} ${name}: ${before} → ${after} (−${before - after})`);
  }
  console.log(`\n共减少 ${totalReduced} 个加粗标记`);
}

// 最终统计
const finalStats = stats.map(x => {
  const content = fs.readFileSync(x.path, 'utf8');
  return { ...x, final: (content.match(/\*\*[^*]+\*\*/g) || []).length };
});
const stillOver30 = finalStats.filter(x => x.final > 30).length;
const stillUnder5 = finalStats.filter(x => x.final < 5).length;
const totalFinal = finalStats.reduce((s, x) => s + x.final, 0);
console.log(`\n✅ 最终: ${totalFinal} 个加粗, > 30: ${stillOver30}篇, < 5: ${stillUnder5}篇`);
