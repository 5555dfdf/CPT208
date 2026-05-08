import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMuseumStore } from "../src/museum/store.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outputDir = resolve(root, "public", "artifact-qrcodes");

const QR_VERSION = 4;
const QR_SIZE = 17 + QR_VERSION * 4;
const DATA_CODEWORDS = 80;
const ECC_CODEWORDS = 20;

const gfExp = new Array(512);
const gfLog = new Array(256);

let x = 1;
for (let i = 0; i < 255; i++) {
  gfExp[i] = x;
  gfLog[x] = i;
  x <<= 1;
  if (x & 0x100) x ^= 0x11d;
}
for (let i = 255; i < 512; i++) gfExp[i] = gfExp[i - 255];

function gfMul(a, b) {
  if (!a || !b) return 0;
  return gfExp[gfLog[a] + gfLog[b]];
}

function reedSolomonGenerator(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], gfExp[i]);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly.slice(1);
}

function reedSolomonRemainder(data, degree) {
  const generator = reedSolomonGenerator(degree);
  const result = new Array(degree).fill(0);
  for (const value of data) {
    const factor = value ^ result.shift();
    result.push(0);
    for (let i = 0; i < degree; i++) {
      result[i] ^= gfMul(generator[i], factor);
    }
  }
  return result;
}

function appendBits(bits, value, length) {
  for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
}

function encodePayload(payload) {
  const bytes = [...new TextEncoder().encode(payload)];
  if (bytes.length > 78) {
    throw new Error(`QR payload is too long: ${payload}`);
  }

  const bits = [];
  appendBits(bits, 0b0100, 4);
  appendBits(bits, bytes.length, 8);
  for (const byte of bytes) appendBits(bits, byte, 8);
  appendBits(bits, 0, Math.min(4, DATA_CODEWORDS * 8 - bits.length));
  while (bits.length % 8) bits.push(0);

  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    data.push(Number.parseInt(bits.slice(i, i + 8).join(""), 2));
  }
  for (let pad = 0; data.length < DATA_CODEWORDS; pad ^= 1) {
    data.push(pad ? 0x11 : 0xec);
  }

  return data.concat(reedSolomonRemainder(data, ECC_CODEWORDS));
}

function makeMatrix() {
  return {
    modules: Array.from({ length: QR_SIZE }, () => Array(QR_SIZE).fill(false)),
    reserved: Array.from({ length: QR_SIZE }, () => Array(QR_SIZE).fill(false)),
  };
}

function setModule(matrix, x, y, dark, reserve = true) {
  if (x < 0 || y < 0 || x >= QR_SIZE || y >= QR_SIZE) return;
  matrix.modules[y][x] = dark;
  if (reserve) matrix.reserved[y][x] = true;
}

function drawFinder(matrix, x, y) {
  for (let dy = -1; dy <= 7; dy++) {
    for (let dx = -1; dx <= 7; dx++) {
      const xx = x + dx;
      const yy = y + dy;
      const inCore = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
      const dark =
        inCore &&
        (dx === 0 ||
          dx === 6 ||
          dy === 0 ||
          dy === 6 ||
          (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
      setModule(matrix, xx, yy, dark);
    }
  }
}

function drawAlignment(matrix, cx, cy) {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const dist = Math.max(Math.abs(dx), Math.abs(dy));
      setModule(matrix, cx + dx, cy + dy, dist !== 1);
    }
  }
}

function reserveFormat(matrix) {
  for (let i = 0; i < 9; i++) {
    setModule(matrix, 8, i, false);
    setModule(matrix, i, 8, false);
  }
  for (let i = 0; i < 8; i++) {
    setModule(matrix, QR_SIZE - 1 - i, 8, false);
    setModule(matrix, 8, QR_SIZE - 1 - i, false);
  }
}

function drawFunctionPatterns(matrix) {
  drawFinder(matrix, 0, 0);
  drawFinder(matrix, QR_SIZE - 7, 0);
  drawFinder(matrix, 0, QR_SIZE - 7);
  for (let i = 8; i < QR_SIZE - 8; i++) {
    setModule(matrix, i, 6, i % 2 === 0);
    setModule(matrix, 6, i, i % 2 === 0);
  }
  drawAlignment(matrix, 26, 26);
  setModule(matrix, 8, QR_VERSION * 4 + 9, true);
  reserveFormat(matrix);
}

function maskBit(mask, x, y) {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
  }
}

function drawCodewords(matrix, codewords, mask) {
  const bits = codewords.flatMap((byte) => {
    const out = [];
    appendBits(out, byte, 8);
    return out;
  });
  let bitIndex = 0;
  let upward = true;

  for (let right = QR_SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right--;
    for (let vert = 0; vert < QR_SIZE; vert++) {
      const y = upward ? QR_SIZE - 1 - vert : vert;
      for (let dx = 0; dx < 2; dx++) {
        const xx = right - dx;
        if (matrix.reserved[y][xx]) continue;
        const bit = bits[bitIndex++] === 1;
        matrix.modules[y][xx] = bit !== maskBit(mask, xx, y);
      }
    }
    upward = !upward;
  }
}

function formatBits(mask) {
  let data = (0b01 << 3) | mask;
  let value = data << 10;
  const generator = 0b10100110111;
  for (let i = 14; i >= 10; i--) {
    if ((value >>> i) & 1) value ^= generator << (i - 10);
  }
  return ((data << 10) | value) ^ 0b101010000010010;
}

function drawFormatBits(matrix, mask) {
  const bits = formatBits(mask);
  const bit = (i) => ((bits >>> i) & 1) === 1;
  for (let i = 0; i <= 5; i++) setModule(matrix, 8, i, bit(i));
  setModule(matrix, 8, 7, bit(6));
  setModule(matrix, 8, 8, bit(7));
  setModule(matrix, 7, 8, bit(8));
  for (let i = 9; i < 15; i++) setModule(matrix, 14 - i, 8, bit(i));
  for (let i = 0; i < 8; i++) setModule(matrix, QR_SIZE - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) setModule(matrix, 8, QR_SIZE - 15 + i, bit(i));
}

function penaltyScore(modules) {
  let score = 0;
  for (let y = 0; y < QR_SIZE; y++) {
    let runColor = modules[y][0];
    let runLen = 1;
    for (let x = 1; x < QR_SIZE; x++) {
      if (modules[y][x] === runColor) {
        runLen++;
      } else {
        if (runLen >= 5) score += runLen - 2;
        runColor = modules[y][x];
        runLen = 1;
      }
    }
    if (runLen >= 5) score += runLen - 2;
  }
  for (let x = 0; x < QR_SIZE; x++) {
    let runColor = modules[0][x];
    let runLen = 1;
    for (let y = 1; y < QR_SIZE; y++) {
      if (modules[y][x] === runColor) {
        runLen++;
      } else {
        if (runLen >= 5) score += runLen - 2;
        runColor = modules[y][x];
        runLen = 1;
      }
    }
    if (runLen >= 5) score += runLen - 2;
  }
  for (let y = 0; y < QR_SIZE - 1; y++) {
    for (let x = 0; x < QR_SIZE - 1; x++) {
      const c = modules[y][x];
      if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) {
        score += 3;
      }
    }
  }
  const dark = modules.flat().filter(Boolean).length;
  score += Math.floor(Math.abs((dark * 20) / (QR_SIZE * QR_SIZE) - 10)) * 10;
  return score;
}

function buildQr(payload) {
  const codewords = encodePayload(payload);
  let best = null;
  for (let mask = 0; mask < 8; mask++) {
    const matrix = makeMatrix();
    drawFunctionPatterns(matrix);
    drawCodewords(matrix, codewords, mask);
    drawFormatBits(matrix, mask);
    const score = penaltyScore(matrix.modules);
    if (!best || score < best.score) best = { modules: matrix.modules, score };
  }
  return best.modules;
}

function toSvg(modules, label) {
  const quiet = 4;
  const size = QR_SIZE + quiet * 2;
  const rects = [];
  modules.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) rects.push(`<rect x="${x + quiet}" y="${y + quiet}" width="1" height="1"/>`);
    });
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 ${size} ${size}" role="img" aria-label="${escapeXml(label)} QR code">
  <rect width="100%" height="100%" fill="#fff"/>
  <g fill="#111">
    ${rects.join("\n    ")}
  </g>
</svg>
`;
}

async function toPng(payload) {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toBuffer(payload, {
    type: "png",
    width: 256,
    margin: 1,
    errorCorrectionLevel: "M",
  });
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const { state } = createMuseumStore();
await mkdir(outputDir, { recursive: true });

const manifest = state.artifacts.map((artifact) => ({
  id: artifact.id,
  name: artifact.name,
  modelGlb: artifact.modelGlb,
  qrPayload: `storylens:artifact:${artifact.id}`,
  qrPath: `/artifact-qrcodes/${slugify(artifact.id)}.png`,
}));

for (const item of manifest) {
  const png = await toPng(item.qrPayload);
  await writeFile(resolve(root, "public", item.qrPath.slice(1)), png);
}

await writeFile(
  resolve(outputDir, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(`Generated ${manifest.length} artifact QR codes in ${outputDir}`);
