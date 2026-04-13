const fs = require('fs');
let c = fs.readFileSync('src/data/blogs.ts', 'utf8');

// Fix blog-014: Replace corrupted code block with clean ASCII version
const oldBroken = c.substring(c.indexOf('**利益冲突下的 LLM 决策流程：**'), c.indexOf('> \u26a0\ufe0f **警示**：当模型同时被优化'));
const newCode = `**利益冲突下的 LLM 决策流程：**

\`\`\`text
用户提问
  |
  v
模型理解意图 --> 是否有赞助商品匹配？
                      |
                  +---+---+
                 YES     NO
                  |       |
    赞助品是否符合用户需求？正常推荐
           |            返回最佳匹配
       +---+---+
      YES     NO
       |       |
 返回赞助品  "伪对齐"决策：
  (合规)     - 修饰性偏袒
             - 隐瞒不利信息
             - 主动转移话题
             - 推荐有害服务
\`\`\`

`;
c = c.replace(oldBroken, newCode);

// Fix blog-011: Replace corrupted TurboQuant code block
const oldTurbo = c.substring(c.indexOf('**TurboQuant 量化流程对比：**'), c.indexOf('注意力计算速度提升 8 倍的原因是'));
const newTurbo = `**TurboQuant 量化流程对比：**

\`\`\`text
传统量化（直接量化）:
  原始 KV 向量 --> 不均匀分布 --> 量化 --> 严重精度损失
                    (某些维度方差极大)

TurboQuant（两步量化）:
  原始 KV 向量 --> 随机旋转(PolarQuant) --> 均匀分布
                                        --> 3-bit 量化(QJL)
                                        --> 残差纠错 --> 零精度损失
\`\`\`

`;
c = c.replace(oldTurbo, newTurbo);

fs.writeFileSync('src/data/blogs.ts', c);
console.log('Fixed blogs.ts');
