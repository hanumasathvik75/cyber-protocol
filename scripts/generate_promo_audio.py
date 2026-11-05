import asyncio
import os
import edge_tts

# High-Converting 60-Second Cyber-Protocol Launch Script
PROMO_SCRIPT = """
Every day, millions of kids bypass parental controls in less than 10 seconds. 
They simply open Incognito mode, or search using clever evasive phrases that traditional keyword filters completely miss.

Meet Cyber-Protocol. 
Instead of flimsy browser add-ons, Cyber-Protocol enforces Windows Enterprise Group Policies. 
The Incognito shortcut is permanently erased from the operating system, and Chrome is marked as managed by organization. 
It cannot be disabled, bypassed, or deleted.

Even more powerful is our On-Device AI Transformer model. 
Running directly in local RAM in under 15 milliseconds, it understands the human meaning behind searches. 
When a kid types a vulgar or explicit request, navigation is terminated instantly with our custom defense screen, and high-priority alerts are pushed to the Parent Mobile Portal.

No cloud snooping. No reading private messages. Just pure, unbreakable endpoint protection.
Deploy Cyber-Protocol today at cyber-protocol-zeta.vercel.app.
"""

VOICE = "en-US-ChristopherNeural" # Deep, authoritative tech keynote voice
OUTPUT_FILE = "C:\\Users\\SATHVIK\\.gemini\\antigravity\\scratch\\safeguard\\cyber_protocol_promo_voiceover.mp3"

async def main():
    print(f"[*] Generating studio-quality AI voiceover with voice: {VOICE}...")
    communicate = edge_tts.Communicate(PROMO_SCRIPT.strip(), VOICE, rate="+3%", pitch="+0Hz")
    await communicate.save(OUTPUT_FILE)
    print(f"[SUCCESS] Voiceover successfully generated: {OUTPUT_FILE}")
    size = os.path.getsize(OUTPUT_FILE)
    print(f"[SUCCESS] File size: {size / 1024:.1f} KB")

if __name__ == "__main__":
    asyncio.run(main())
