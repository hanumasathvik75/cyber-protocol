async function run() {
  const queries = [
    "show me dirty unfiltered streaming clip",
    "biology lesson about human reproduction and fertilization",
    "dirty car wash with high pressure soap and water",
    "steamy bedroom scenes between lovers uncensored",
    "how to clean a dirty carpet with baking soda",
    "how to set up shadowsocks proxy to bypass regional firewall"
  ];

  for (const q of queries) {
    const res = await fetch('http://localhost:3000/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchQuery: q })
    });
    const data = await res.json();
    console.log(`Query: "${q}"`);
    console.log(`  -> Decision: ${data.decision} | RiskScore: ${data.riskScore} | Category: ${data.category}`);
  }
}
run();
