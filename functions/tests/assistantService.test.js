import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSystemPrompt,
  checkAssistantRateLimit,
  generateAssistantReply,
  resetRateLimitForTests,
  sanitizeHistory,
} from '../services/assistantService.js';

test('sanitizeHistory keeps only valid user/assistant items and caps at 6', () => {
  const raw = Array.from({ length: 10 }, (_, idx) => ({
    sender: idx % 2 === 0 ? 'user' : 'assistant',
    text: `Mensaje ${idx}`,
  }));
  raw.push({ sender: 'system', text: 'ignorar' });
  raw.push({ sender: 'user', text: '   ' });

  const result = sanitizeHistory(raw);
  assert.equal(result.length, 6);
  assert.equal(result[0].role, 'user');
  assert.equal(result[0].parts[0].text, 'Mensaje 4');
  assert.equal(result[5].role, 'model');
  assert.equal(result[5].parts[0].text, 'Mensaje 9');
});

test('buildSystemPrompt includes dynamic studio context when provided', () => {
  const prompt = buildSystemPrompt({
    knowledgeText: 'Contenido base',
    dynamicContext: {
      nombreProfesora: 'Lucía Gómez',
      horasVentanaCancelacion: 4,
      alias: 'emuna.pilates.mp',
      packages: [{ name: '8 Clases', price: '$38.500', classesCount: 8, validityDays: 30 }],
    },
  });

  assert.match(prompt, /Lucía Gómez/);
  assert.match(prompt, /4 horas antes/);
  assert.match(prompt, /emuna\.pilates\.mp/);
  assert.match(prompt, /8 Clases/);
});

test('checkAssistantRateLimit blocks after 15 requests within 60 seconds', () => {
  resetRateLimitForTests();
  const baseTime = 1_000_000;
  for (let i = 0; i < 15; i += 1) {
    assert.equal(checkAssistantRateLimit('127.0.0.1', baseTime + i * 100), true);
  }
  assert.equal(checkAssistantRateLimit('127.0.0.1', baseTime + 2000), false);
  assert.equal(checkAssistantRateLimit('127.0.0.1', baseTime + 61_000), true);
});

test('generateAssistantReply calls Gemini REST endpoint and returns candidate text', async () => {
  let capturedUrl = '';
  let capturedBody = null;

  const mockFetch = async (url, options) => {
    capturedUrl = url;
    capturedBody = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: 'Podés cancelar hasta 4 horas antes sin costo.' }],
            },
          },
        ],
      }),
    };
  };

  const result = await generateAssistantReply({
    message: '¿Cómo cancelo?',
    history: [{ sender: 'assistant', text: '¡Hola!' }],
    apiKey: 'fake-key-for-test',
    model: 'gemini-2.5-flash',
    fetchImpl: mockFetch,
  });

  assert.match(capturedUrl, /gemini-2\.5-flash:generateContent/);
  assert.equal(capturedBody.generationConfig.temperature, 0.1);
  assert.equal(capturedBody.generationConfig.maxOutputTokens, 800);
  assert.equal(capturedBody.generationConfig.thinkingConfig.thinkingBudget, 0);
  assert.equal(result.reply, 'Podés cancelar hasta 4 horas antes sin costo.');
});
