import { pipeline } from '@xenova/transformers';

async function testZeroShot() {
  console.log("Loading Zero-Shot Classifier (Xenova/mobilebert-uncased-mnli)...");
  const classifier = await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli');
  console.log("Model loaded successfully!");

  const candidateLabels = [
    'adult pornography or sexual content',
    'vpn proxy network bypass',
    'educational or school homework',
    'general gaming or entertainment'
  ];

  const queries = [
    "biology lesson on human reproductive organs",
    "how to watch free adult videos online",
    "download free vpn to unblock blocked sites",
    "how to make a cake in minecraft"
  ];

  for (const q of queries) {
    const res = await classifier(q, candidateLabels);
    console.log(`\nQuery: "${q}"`);
    console.log(`Top match: ${res.labels[0]} (Confidence: ${(res.scores[0] * 100).toFixed(1)}%)`);
    console.log(`Second match: ${res.labels[1]} (Confidence: ${(res.scores[1] * 100).toFixed(1)}%)`);
  }
}

testZeroShot();
