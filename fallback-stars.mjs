import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const rateLimited = [
  'microsoft/promptbench',
  'microsoft/markitdown',
  'openai/whisper',
  'OpenBMB/VoxCPM',
  'virattt/ai-hedge-fund',
  'TapXWorld/ChinaTextbook',
  'thedotmack/claude-mem',
  'HKUDS/DeepTutor',
  'HKUDS/AI-Trader',
  'jo-inc/camofox-browser',
  'Open-LLM-VTuber/Open-LLM-VTuber',
  'NVIDIA/personaplex',
  'unclecode/crawl4ai',
  'n8n-io/n8n',
  'bytedance/Protenix',
  'z-lab/dflash',
  'rowboatlabs/rowboat',
];

const results = {};

for (const repo of rateLimited) {
  try {
    // Use curl to get GitHub page
    const html = execSync(`curl -s -L -H "User-Agent: Mozilla/5.0" https://github.com/${repo}`, { timeout: 15000 }).toString();
    
    // Extract stars from og:star_count meta tag or link element
    const starMatch = html.match(/aria-label="([\d,]+)\s*stars?"/);
    if (starMatch) {
      const stars = parseInt(starMatch[1].replace(/,/g, ''));
      results[repo] = stars;
      console.log(`✓ ${repo} → ${stars}`);
    } else {
      // Try alternate pattern
      const starMatch2 = html.match(/js-social-count[^>]*>([\d,]+)/);
      if (starMatch2) {
        const stars = parseInt(starMatch2[1].replace(/,/g, ''));
        results[repo] = stars;
        console.log(`✓ ${repo} → ${stars} (alt)`);
      } else {
        console.log(`✗ ${repo} → no stars found`);
        results[repo] = null;
      }
    }
  } catch (e) {
    console.log(`✗ ${repo} → ${e.message}`);
    results[repo] = null;
  }
  // Delay to be safe
  await new Promise(r => setTimeout(r, 2000));
}

writeFileSync('./reports/fallback-stars.json', JSON.stringify(results, null, 2));
console.log('\nDone:', JSON.stringify(results));
