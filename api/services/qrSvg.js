/**
 * Zero-dependency ISO/IEC 18004 QR Code SVG & Data URL Generator (Error Correction Level L, Versions 1..10).
 * Used to render `otpauth://totp/...` URIs for Google Authenticator enrollment & Break-Glass 2FA Vault.
 */

// GF(256) arithmetic with primitive polynomial 0x11d
const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);
(() => {
  for (let i = 0; i < 8; i++) EXP_TABLE[i] = 1 << i;
  for (let i = 8; i < 256; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
  }
  for (let i = 0; i < 255; i++) LOG_TABLE[EXP_TABLE[i]] = i;
})();

function glog(n) {
  if (n < 1) throw new Error('glog(' + n + ')');
  return LOG_TABLE[n];
}
function gexp(n) {
  while (n < 0) n += 255;
  while (n >= 256) n -= 255;
  return EXP_TABLE[n];
}

class QRPolynomial {
  constructor(num, shift) {
    let offset = 0;
    while (offset < num.length && num[offset] === 0) offset++;
    this.num = new Array(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i++) this.num[i] = num[i + offset];
    for (let i = num.length - offset; i < this.num.length; i++) this.num[i] = 0;
  }
  get(index) { return this.num[index]; }
  getLength() { return this.num.length; }
  multiply(e) {
    const num = new Array(this.getLength() + e.getLength() - 1).fill(0);
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        if (this.get(i) !== 0 && e.get(j) !== 0) {
          num[i + j] ^= gexp(glog(this.get(i)) + glog(e.get(j)));
        }
      }
    }
    return new QRPolynomial(num, 0);
  }
  mod(e) {
    if (this.getLength() - e.getLength() < 0) return this;
    const ratio = glog(this.get(0)) - glog(e.get(0));
    const num = this.num.slice();
    for (let i = 0; i < e.getLength(); i++) {
      if (e.get(i) !== 0) num[i] ^= gexp(glog(e.get(i)) + ratio);
    }
    return new QRPolynomial(num, 0).mod(e);
  }
}

// RS Block table for Error Correction Level L (versions 1..10): [count, totalCount, dataCount]
const RS_BLOCK_TABLE_L = [
  null,
  [[1, 26, 19]],
  [[1, 44, 34]],
  [[1, 70, 55]],
  [[1, 100, 80]],
  [[1, 134, 108]],
  [[2, 86, 68]],
  [[2, 98, 78]],
  [[2, 121, 97]],
  [[2, 146, 116]],
  [[2, 86, 68], [2, 87, 69]],
];

const PATTERN_POSITION_TABLE = [
  [],
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
];

function getErrorCorrectPolynomial(errorCorrectLength) {
  let a = new QRPolynomial([1], 0);
  for (let i = 0; i < errorCorrectLength; i++) {
    a = a.multiply(new QRPolynomial([1, gexp(i)], 0));
  }
  return a;
}

function getBCHDigit(data) {
  let digit = 0;
  while (data !== 0) {
    digit++;
    data >>>= 1;
  }
  return digit;
}

function getBCHTypeInfo(data) {
  let d = data << 10;
  while (getBCHDigit(d) - getBCHDigit(0x537) >= 0) {
    d ^= 0x537 << (getBCHDigit(d) - getBCHDigit(0x537));
  }
  return ((data << 10) | d) ^ 0x5412;
}

function getBCHTypeNumber(data) {
  let d = data << 12;
  while (getBCHDigit(d) - getBCHDigit(0x1f25) >= 0) {
    d ^= 0x1f25 << (getBCHDigit(d) - getBCHDigit(0x1f25));
  }
  return (data << 12) | d;
}

function getMask(maskPattern, i, j) {
  switch (maskPattern) {
    case 0: return (i + j) % 2 === 0;
    case 1: return i % 2 === 0;
    case 2: return j % 3 === 0;
    case 3: return (i + j) % 3 === 0;
    case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
    case 5: return ((i * j) % 2) + ((i * j) % 3) === 0;
    case 6: return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
    case 7: return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
    default: return (i + j) % 2 === 0;
  }
}

function createBytes(text) {
  const bytes = Array.from(Buffer.from(String(text || ''), 'utf8'));
  // Find minimum version in 1..10 that fits bytes in Level L
  let typeNumber = 1;
  for (let v = 1; v <= 10; v++) {
    const blocks = RS_BLOCK_TABLE_L[v];
    let totalDataCount = 0;
    for (const [count, , dataCount] of blocks) totalDataCount += count * dataCount;
    const lengthBits = v < 10 ? 8 : 16;
    if (4 + lengthBits + bytes.length * 8 <= totalDataCount * 8) {
      typeNumber = v;
      break;
    }
    typeNumber = 10;
  }

  const rsBlocks = [];
  for (const [count, totalCount, dataCount] of RS_BLOCK_TABLE_L[typeNumber]) {
    for (let i = 0; i < count; i++) rsBlocks.push({ totalCount, dataCount });
  }

  let totalDataCount = 0;
  for (const b of rsBlocks) totalDataCount += b.dataCount;

  const bitBuffer = [];
  const put = (num, length) => {
    for (let i = 0; i < length; i++) {
      bitBuffer.push(((num >>> (length - i - 1)) & 1) === 1);
    }
  };

  // Mode: 8-bit byte (0100 = 4)
  put(4, 4);
  put(bytes.length, typeNumber < 10 ? 8 : 16);
  for (const b of bytes) put(b, 8);

  if (bitBuffer.length + 4 <= totalDataCount * 8) put(0, 4);
  while (bitBuffer.length % 8 !== 0) bitBuffer.push(false);

  const dataBytes = [];
  for (let i = 0; i < bitBuffer.length; i += 8) {
    let val = 0;
    for (let b = 0; b < 8; b++) if (bitBuffer[i + b]) val |= 0x80 >>> b;
    dataBytes.push(val);
  }
  const pads = [0xec, 0x11];
  let padIdx = 0;
  while (dataBytes.length < totalDataCount) {
    dataBytes.push(pads[padIdx % 2]);
    padIdx++;
  }

  let offset = 0;
  let maxDcCount = 0;
  let maxEcCount = 0;
  const dcdata = [];
  const ecdata = [];

  for (let r = 0; r < rsBlocks.length; r++) {
    const dcCount = rsBlocks[r].dataCount;
    const ecCount = rsBlocks[r].totalCount - dcCount;
    maxDcCount = Math.max(maxDcCount, dcCount);
    maxEcCount = Math.max(maxEcCount, ecCount);
    dcdata[r] = new Array(dcCount);
    for (let i = 0; i < dcCount; i++) dcdata[r][i] = 0xff & dataBytes[i + offset];
    offset += dcCount;

    const rsPoly = getErrorCorrectPolynomial(ecCount);
    const rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
    const modPoly = rawPoly.mod(rsPoly);
    ecdata[r] = new Array(rsPoly.getLength() - 1);
    for (let i = 0; i < ecdata[r].length; i++) {
      const modIndex = i + modPoly.getLength() - ecdata[r].length;
      ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
    }
  }

  const finalData = [];
  for (let i = 0; i < maxDcCount; i++) {
    for (let r = 0; r < rsBlocks.length; r++) {
      if (i < dcdata[r].length) finalData.push(dcdata[r][i]);
    }
  }
  for (let i = 0; i < maxEcCount; i++) {
    for (let r = 0; r < rsBlocks.length; r++) {
      if (i < ecdata[r].length) finalData.push(ecdata[r][i]);
    }
  }

  return { typeNumber, data: finalData };
}

function buildMatrix(text, maskPattern = 0) {
  const { typeNumber, data } = createBytes(text);
  const moduleCount = typeNumber * 4 + 17;
  const modules = Array.from({ length: moduleCount }, () => new Array(moduleCount).fill(null));

  const setupPositionProbePattern = (row, col) => {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || moduleCount <= col + c) continue;
        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          modules[row + r][col + c] = true;
        } else {
          modules[row + r][col + c] = false;
        }
      }
    }
  };

  setupPositionProbePattern(0, 0);
  setupPositionProbePattern(moduleCount - 7, 0);
  setupPositionProbePattern(0, moduleCount - 7);

  // Position adjust pattern
  const pos = PATTERN_POSITION_TABLE[typeNumber] || [];
  for (let i = 0; i < pos.length; i++) {
    for (let j = 0; j < pos.length; j++) {
      const row = pos[i];
      const col = pos[j];
      if (modules[row][col] !== null) continue;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          modules[row + r][col + c] = r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0);
        }
      }
    }
  }

  // Timing pattern
  for (let r = 8; r < moduleCount - 8; r++) {
    if (modules[r][6] === null) modules[r][6] = r % 2 === 0;
  }
  for (let c = 8; c < moduleCount - 8; c++) {
    if (modules[6][c] === null) modules[6][c] = c % 2 === 0;
  }

  // TypeNumber (for version >= 7)
  if (typeNumber >= 7) {
    const bits = getBCHTypeNumber(typeNumber);
    for (let i = 0; i < 18; i++) {
      const mod = ((bits >> i) & 1) === 1;
      modules[Math.floor(i / 3)][(i % 3) + moduleCount - 8 - 3] = mod;
      modules[(i % 3) + moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  }

  // TypeInfo (ErrorCorrectionLevel L = 1)
  const typeInfoData = (1 << 3) | maskPattern;
  const bits = getBCHTypeInfo(typeInfoData);
  for (let i = 0; i < 15; i++) {
    const mod = ((bits >> i) & 1) === 1;
    if (i < 6) modules[i][8] = mod;
    else if (i < 8) modules[i + 1][8] = mod;
    else modules[moduleCount - 15 + i][8] = mod;

    if (i < 8) modules[8][moduleCount - i - 1] = mod;
    else if (i < 9) modules[8][15 - i - 1 + 1] = mod;
    else modules[8][15 - i - 1] = mod;
  }
  modules[moduleCount - 8][8] = true;

  // Map data
  let inc = -1;
  let row = moduleCount - 1;
  let bitIndex = 7;
  let byteIndex = 0;

  for (let col = moduleCount - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    while (true) {
      for (let c = 0; c < 2; c++) {
        if (modules[row][col - c] === null) {
          let dark = false;
          if (byteIndex < data.length) {
            dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
          }
          if (getMask(maskPattern, row, col - c)) dark = !dark;
          modules[row][col - c] = dark;
          bitIndex--;
          if (bitIndex === -1) {
            byteIndex++;
            bitIndex = 7;
          }
        }
      }
      row += inc;
      if (row < 0 || moduleCount <= row) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
  }

  return { moduleCount, modules };
}

function generateQrDataUrl(text, size = 240) {
  const { moduleCount, modules } = buildMatrix(text, 2);
  const margin = 3;
  const total = moduleCount + margin * 2;
  let paths = '';
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (modules[r][c]) {
        paths += `M${c + margin},${r + margin}h1v1h-1z`;
      }
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#ffffff"/><path d="${paths}" fill="#0f172a"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}

module.exports = { generateQrDataUrl };
