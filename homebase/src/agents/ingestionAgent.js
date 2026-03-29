// Ingestion Agent: accepts a receipt image and returns structured receipt data via Claude vision

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a receipt data extraction agent. Your only job is to extract structured data from receipt images.

Return ONLY a valid JSON object with this exact shape:
{
  "store": "store name as printed",
  "date": "YYYY-MM-DD",
  "category": "grocery | restaurant | pharmacy | other",
  "total": 0.00,
  "items": [
    { "name": "item name", "price": 0.00 }
  ]
}

Rules:
- date: use today's date if not printed on receipt
- category: infer from store type
- items: include every line item, skip subtotals and tax lines
- prices: always numbers, never strings
- Return nothing except the JSON object. No explanation, no markdown.`;

// EVAL NOTE: extractReceipt should call Claude with the image and the system prompt above,
// then parse the response as JSON. On success it returns the parsed object plus a `raw` field.
// On any failure (API error, invalid JSON, missing fields) it returns { error: string, raw: string }.
export async function extractReceipt({ imageBase64, mediaType }) {
  let raw = '';

  // EVAL NOTE: The API call must use the messages API with a vision content block.
  // The image is passed as base64 source with the correct mediaType.
  // Model must be claude-sonnet-4-20250514.
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Extract the receipt data from this image.',
            },
          ],
        },
      ],
    });

    // EVAL NOTE: The raw field captures the first text block from the response for debugging.
    // This lets the eval harness inspect what the model returned even when parsing fails.
    raw = response.content[0]?.text ?? '';

    // EVAL NOTE: Parse the raw response as JSON. The system prompt instructs the model to return
    // only valid JSON with no markdown fences or preamble, so we parse directly.
    // If the model returns malformed JSON, this will throw and be caught below.
    const parsed = JSON.parse(raw);

    // EVAL NOTE: Validate that the required top-level fields are present.
    // A response missing store, date, total, or items is considered a failed extraction.
    const required = ['store', 'date', 'category', 'total', 'items'];
    for (const field of required) {
      if (!(field in parsed)) {
        return { error: `Missing required field: ${field}`, raw };
      }
    }

    // EVAL NOTE: Attach the raw string to the valid result so callers can log or debug it.
    return { ...parsed, raw };
  } catch (err) {
    // EVAL NOTE: All errors (API failures, JSON parse errors, network issues) are caught here.
    // We never throw — callers always receive either a valid receipt object or { error, raw }.
    return {
      error: err instanceof SyntaxError
        ? `Failed to parse model response as JSON: ${err.message}`
        : `API call failed: ${err.message}`,
      raw,
    };
  }
}
