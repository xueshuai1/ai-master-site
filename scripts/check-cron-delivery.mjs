#!/usr/bin/env node
/**
 * 检查所有需要飞书投递的 cron job 是否配置了 target
 * 运行: node scripts/check-cron-delivery.mjs
 */

import { readFileSync } from 'fs';

const cronPath = '/Users/xueshuai/.openclaw/cron/jobs.json';
let errors = 0;

try {
  const raw = readFileSync(cronPath, 'utf-8');
  const { jobs } = JSON.parse(raw);
  
  console.log(`🔍 检查 ${jobs.length} 个 cron 任务\n`);
  
  for (const job of jobs) {
    if (!job.enabled) continue;
    
    const delivery = job.delivery || {};
    if (delivery.mode !== 'announce') continue;
    
    // 需要投递的任务必须有 target
    if (!delivery.to && !delivery.chatId) {
      console.log(`❌ ${job.name} (${job.id.slice(0, 8)})`);
      console.log(`   投递配置: ${JSON.stringify(delivery)}`);
      console.log(`   问题: 缺少 --to 参数`);
      errors++;
    } else {
      console.log(`✅ ${job.name} → ${delivery.to || delivery.chatId}`);
    }
    
    if (job.state?.consecutiveErrors > 0) {
      console.log(`   ⚠️ 连续失败 ${job.state.consecutiveErrors} 次`);
      errors++;
    }
  }
  
  if (errors === 0) {
    console.log('\n✅ 所有投递任务配置正常');
  } else {
    console.log(`\n❌ 发现 ${errors} 个问题，请修复后重试`);
    process.exit(1);
  }
} catch (e) {
  console.error('❌ 无法读取 cron 配置:', e.message);
  process.exit(1);
}
