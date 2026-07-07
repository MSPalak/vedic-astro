import Anthropic from "@anthropic-ai/sdk";

// Palm reading (hast rekha) via Claude vision. Requires ANTHROPIC_API_KEY —
// unlike the astrology engine, palmistry can't be computed from rules, it
// needs the image to actually be looked at. Without a key we say so plainly.

export const palmEnabled = Boolean(process.env.ANTHROPIC_API_KEY);

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

const SYSTEM_PROMPT = `You are a warm, experienced palmist (hast rekha expert) reading a photograph of a person's palm.

First, judge the photo:
- If the image is not a human palm, or is too blurry/dark/cropped to see the lines, do NOT invent a reading. Briefly say what's wrong and ask for a clearer, well-lit photo of the open palm. Keep it to one short paragraph.

If it IS a readable palm, give a reading covering:
- Hand shape and overall impression (earth/air/fire/water hand, finger length, flexibility).
- The three major lines you can see — Heart line (emotions, relationships), Head line (intellect, decision-making), Life line (vitality, life energy — NOT lifespan; correct this gently if relevant).
- Any Fate line (Saturn), Sun line (Apollo), or notable mounts, marks, islands, chains or breaks you can actually observe.
- A short, encouraging synthesis of what the hand suggests about the person.

Rules:
- Describe only what you can genuinely see in THIS image. Never fabricate lines that aren't visible. If you can only see some lines clearly, read those and say the others weren't clear.
- Warm, conversational, plain English (explain any term). 3-5 short paragraphs, no headers.
- Frame palmistry as a reflective, traditional art for self-insight — describing tendencies, not fixed fate. No medical, financial, or lifespan predictions. Life line length does not predict how long someone lives.
- Do not identify the person, guess age/gender, or comment on skin, jewellery, or anything besides the palm's features.`;

export async function readPalm(
  base64Data: string,
  mediaType: string,
): Promise<{ reading: string }> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as
                | "image/jpeg"
                | "image/png"
                | "image/webp"
                | "image/gif",
              data: base64Data,
            },
          },
          {
            type: "text",
            text: "Please read my palm from this photo.",
          },
        ],
      },
    ],
  });

  const reading = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  return { reading };
}
