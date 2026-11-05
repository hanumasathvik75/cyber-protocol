const path = require('path');
const { pipeline, cos_sim } = require(path.join(__dirname, '../safeguard-backend/node_modules/@xenova/transformers'));

async function runBenchmark() {
  console.log('Loading on-device transformer Xenova/all-MiniLM-L6-v2...');
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const adultAnchor = await extractor('hardcore explicit adult vulgar pornography nsfw', { pooling: 'mean', normalize: true });

  const testCases = [
    {
      query: 'show me women with no clothes in bed',
      intent: 'Explicit evasion (Zero vulgar keywords)'
    },
    {
      query: 'send me unclad pictures of your body',
      intent: 'Predatory request (Zero vulgar keywords)'
    },
    {
      query: 'sexual reproduction in flowering plants class 10 biology',
      intent: 'Legitimate school homework (Contains word "sexual")'
    },
    {
      query: 'history of human pornography and exploitation laws',
      intent: 'Sociology research paper (Contains word "pornography")'
    },
    {
      query: 'how to shoot a three pointer in basketball',
      intent: 'Sports tutorial (Contains word "shoot")'
    }
  ];

  console.log('\n========================================================================');
  console.log('       RULE-BASED (REGEX / KEYWORD) VS. PRE-TRAINED AI BENCHMARK        ');
  console.log('========================================================================\n');

  for (const tc of testCases) {
    const qEmbed = await extractor(tc.query, { pooling: 'mean', normalize: true });
    const similarity = cos_sim(adultAnchor.data, qEmbed.data);
    
    // Simple rule-based check
    const hasPornKeyword = /\b(porn|pornography|xxx|sex|nude)\b/i.test(tc.query);

    console.log(`[Query]: "${tc.query}"`);
    console.log(`  Expected Intent : ${tc.intent}`);
    console.log(`  Rule-Based Check: ${hasPornKeyword ? '🔴 BLOCKED (False Alarm or Hit)' : '🟢 ALLOWED (Passes right through)'}`);
    console.log(`  AI Vector Score : ${similarity.toFixed(4)} (${similarity > 0.45 ? '🔴 BLOCKED BY INTENT' : '🟢 ALLOWED BY CONTEXT'})`);
    console.log('------------------------------------------------------------------------');
  }
}

runBenchmark().catch(console.error);
