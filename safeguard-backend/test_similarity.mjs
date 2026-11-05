import { pipeline, cos_sim } from '@xenova/transformers';

async function testSemanticSimilarity() {
  console.log("Loading SOTA Semantic Embedding Transformer (Xenova/all-MiniLM-L6-v2)...");
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log("Model loaded successfully!");

  // Pre-computed Safety Anchor Intents
  const safetyAnchors = {
    ADULT_EXPLICIT: "watching explicit pornographic adult sex nude videos",
    VPN_BYPASS: "download free vpn proxy to unblock restricted websites"
  };

  const adultAnchorVec = await extractor(safetyAnchors.ADULT_EXPLICIT, { pooling: 'mean', normalize: true });
  const vpnAnchorVec = await extractor(safetyAnchors.VPN_BYPASS, { pooling: 'mean', normalize: true });

  const testQueries = [
    "biology lesson on human reproductive organs",
    "how to watch free adult videos online",
    "download free vpn to unblock blocked sites",
    "how to make a cake in minecraft",
    "nude hot babes streaming",
    "bypass firewall with proxy tunnel"
  ];

  for (const q of testQueries) {
    const qVec = await extractor(q, { pooling: 'mean', normalize: true });
    const adultScore = cos_sim(qVec.data, adultAnchorVec.data);
    const vpnScore = cos_sim(qVec.data, vpnAnchorVec.data);

    console.log(`\nQuery: "${q}"`);
    console.log(`  -> Adult Intent Similarity: ${(adultScore * 100).toFixed(1)}%`);
    console.log(`  -> VPN Bypass Similarity:   ${(vpnScore * 100).toFixed(1)}%`);

    if (adultScore > 0.60) {
      console.log(`  [DECISION]: 🚨 CRITICAL KILL-SWITCH (Adult Intent Detected)`);
    } else if (vpnScore > 0.60) {
      console.log(`  [DECISION]: ⚠️ 10-SECOND WARNING HUD (VPN Evasion Detected)`);
    } else {
      console.log(`  [DECISION]: ✅ SAFE / ALLOWED`);
    }
  }
}

testSemanticSimilarity();
