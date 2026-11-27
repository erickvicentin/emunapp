/**
 * Lightweight client-side receipt parser & image compressor.
 * Extracts operation numbers and amounts from PDF/text receipts or filenames,
 * and compresses receipt images into compact JPEG data URLs for preview.
 */

const OPERATION_PATTERNS = [
  /(?:operaci[oó]n|comprobante|nro\.?|n[uú]mero|referencia|id(?:\s+de\s+pago)?|c[oó]digo)[\s:#°\-]*([0-9]{6,16})/i,
  /#\s*([0-9]{7,16})/,
  /\b([0-9]{9,14})\b/,
];

const AMOUNT_PATTERNS = [
  /\$\s*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?)/,
  /(?:total|monto|importe|transferiste|pagaste)[\s:$]*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?)/i,
];

function normalizeAmount(raw) {
  if (!raw) return null;
  let cleaned = String(raw).trim();
  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    const parts = cleaned.split(',');
    cleaned = parts[1]?.length === 2 ? cleaned.replace(',', '.') : cleaned.replace(/,/g, '');
  } else if (cleaned.includes('.')) {
    const parts = cleaned.split('.');
    if (parts[1]?.length === 3) {
      cleaned = cleaned.replace(/\./g, '');
    }
  }
  const num = Number(cleaned);
  return Number.isFinite(num) && num > 0 ? Math.round(num) : null;
}

export function parseReceiptText(text = '') {
  const source = String(text || '');
  let operationNumber = '';
  for (const regex of OPERATION_PATTERNS) {
    const match = source.match(regex);
    if (match?.[1]) {
      operationNumber = match[1].trim();
      break;
    }
  }

  let amount = null;
  for (const regex of AMOUNT_PATTERNS) {
    const match = source.match(regex);
    if (match?.[1]) {
      const parsed = normalizeAmount(match[1]);
      if (parsed) {
        amount = parsed;
        break;
      }
    }
  }

  return { operationNumber, amount };
}

export async function compressReceiptImage(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('No se pudo leer la imagen del comprobante.'));
    reader.readAsDataURL(file);
  });

  if (!file.type.startsWith('image/')) {
    return dataUrl.length <= 250_000 ? dataUrl : '';
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxWidth = 900;
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl.length <= 250_000 ? dataUrl : '');
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => resolve('');
    img.src = dataUrl;
  });
}

export async function extractReceiptMetadata(file) {
  if (!file) {
    return { operationNumber: '', amount: null, previewDataUrl: '' };
  }

  let extractedText = `${file.name || ''}\n`;
  if (file.type === 'application/pdf' || file.type.startsWith('text/')) {
    try {
      const raw = await file.text();
      extractedText += raw.slice(0, 60_000);
    } catch {
      // Ignore unreadable binary streams
    }
  }

  const parsed = parseReceiptText(extractedText);
  const previewDataUrl = await compressReceiptImage(file);

  return {
    operationNumber: parsed.operationNumber,
    amount: parsed.amount,
    previewDataUrl,
  };
}
