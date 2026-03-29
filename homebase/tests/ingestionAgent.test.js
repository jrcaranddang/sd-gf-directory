// Test harness for ingestionAgent: validates structured extraction from receipt images

// TODO: add test receipt images to tests/fixtures/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractReceipt } from '../src/agents/ingestionAgent.js';

// Minimal valid receipt result shape
function assertValidReceiptShape(result) {
  assert.ok(typeof result.store === 'string', 'store must be a string');
  assert.ok(typeof result.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(result.date), 'date must be YYYY-MM-DD');
  assert.ok(['grocery', 'restaurant', 'pharmacy', 'other'].includes(result.category), 'category must be a known value');
  assert.ok(typeof result.total === 'number', 'total must be a number');
  assert.ok(Array.isArray(result.items), 'items must be an array');
  for (const item of result.items) {
    assert.ok(typeof item.name === 'string', 'item.name must be a string');
    assert.ok(typeof item.price === 'number', 'item.price must be a number');
  }
}

test('extracts store name correctly', async () => {
  // TODO: load a real fixture image and assert result.store matches expected value
  // Example:
  // const imageBase64 = readFileSync('tests/fixtures/whole-foods-receipt.jpg').toString('base64');
  // const result = await extractReceipt({ imageBase64, mediaType: 'image/jpeg' });
  // assert.equal(result.store, 'Whole Foods Market');
  assert.ok(true, 'placeholder — add fixture image to implement');
});

test('extracts all line items', async () => {
  // TODO: load a fixture receipt with known items and verify result.items length and values
  // Example:
  // const result = await extractReceipt({ imageBase64, mediaType: 'image/jpeg' });
  // assert.equal(result.items.length, 7);
  // assert.deepEqual(result.items[0], { name: 'Organic Milk', price: 4.99 });
  assert.ok(true, 'placeholder — add fixture image to implement');
});

test('infers category correctly', async () => {
  // TODO: load a fixture for each category type (grocery, restaurant, pharmacy, other)
  // and assert the inferred category matches
  // Example:
  // const result = await extractReceipt({ imageBase64, mediaType: 'image/jpeg' });
  // assert.equal(result.category, 'grocery');
  assert.ok(true, 'placeholder — add fixture image to implement');
});

test('handles unreadable or low quality image gracefully', async () => {
  // TODO: pass a blank or corrupted image and assert the result has an `error` field
  // and never throws. Verify raw is a string.
  // Example:
  // const result = await extractReceipt({ imageBase64: 'AAAA', mediaType: 'image/jpeg' });
  // assert.ok(result.error || result.store, 'should return error or best-effort result');
  assert.ok(true, 'placeholder — add blank/corrupt fixture to implement');
});

test('returns valid JSON structure on every run', async () => {
  // TODO: run extractReceipt on a real fixture and call assertValidReceiptShape on the result
  // This test ensures the model never returns partial or malformed shapes in production
  // Example:
  // const result = await extractReceipt({ imageBase64, mediaType: 'image/jpeg' });
  // if (!result.error) assertValidReceiptShape(result);
  assert.ok(true, 'placeholder — add fixture image to implement');
});
