import { pipeline } from '@xenova/transformers';

async function test() {
  console.log("Loading pre-trained on-device Transformer model (Xenova/toxic-bert)...");
  const classifier = await pipeline('text-classification', 'Xenova/toxic-bert');
  console.log("Model loaded successfully into RAM!");

  const testCases = [
    "biology lesson on human reproductive organs",
    "how to watch free adult videos online",
    "how to bypass school filter using vpn",
    "minecraft redstone tutorial"
  ];

  for (const text of testCases) {
    const output = await classifier(text);
    console.log(`\nInput: "${text}"`);
    console.log(`Score:`, output);
  }
}

test();
