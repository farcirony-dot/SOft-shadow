/**
 * Embeds physical 300 DPI resolution metadata into PNG and JPEG image blobs.
 * Complies with international standards:
 * - PNG: 'pHYs' chunk (Physical Pixel Dimensions) with 11811 pixels per meter (300 DPI).
 * - JPEG: 'APP0' JFIF marker with density unit = 1 (inches) and 300x300 density.
 */

// Standard CRC32 table for PNG chunk validation
const crcTable: number[] = (() => {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buffer: Uint8Array, offset: number, length: number): number {
  let crc = 0xffffffff;
  for (let i = 0; i < length; i++) {
    crc = crcTable[(crc ^ buffer[offset + i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Injects or updates the pHYs chunk in a PNG with target DPI (default 300).
 * 300 DPI = Math.round(300 / 0.0254) = 11811 pixels/meter.
 */
export function setPngDpi(buffer: ArrayBuffer, dpi = 300): Uint8Array {
  const ppm = Math.round(dpi / 0.0254); // Pixels per meter (11811 for 300 DPI)
  const bytes = new Uint8Array(buffer);

  // Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length < 33 ||
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47 ||
    bytes[4] !== 0x0d ||
    bytes[5] !== 0x0a ||
    bytes[6] !== 0x1a ||
    bytes[7] !== 0x0a
  ) {
    return bytes; // Return unmodified
  }

  // Construct pHYs chunk
  // Length: 9 bytes
  // Chunk type: "pHYs"
  // Data: 4 bytes X ppm, 4 bytes Y ppm, 1 byte unit (1 = meter)
  // CRC: 4 bytes
  const physChunk = new Uint8Array(21);
  const physView = new DataView(physChunk.buffer);

  physView.setUint32(0, 9, false); // Length = 9
  physChunk[4] = 0x70; // 'p'
  physChunk[5] = 0x48; // 'H'
  physChunk[6] = 0x59; // 'Y' (must be uppercase Y in standard PNG pHYs)
  physChunk[7] = 0x73; // 's'

  physView.setUint32(8, ppm, false); // X pixels per meter
  physView.setUint32(12, ppm, false); // Y pixels per meter
  physChunk[16] = 1; // Unit: 1 = meter

  const chunkCrc = crc32(physChunk, 4, 13);
  physView.setUint32(17, chunkCrc, false);

  // Scan chunks to locate IHDR and existing pHYs
  let pos = 8;
  let existingPhysOffset = -1;
  let existingPhysLength = 21;
  let ihdrEndOffset = 33; // Default PNG IHDR ends at byte 33

  const srcView = new DataView(buffer);

  try {
    while (pos < bytes.length - 8) {
      const chunkLen = srcView.getUint32(pos, false);
      const chunkType = String.fromCharCode(
        bytes[pos + 4],
        bytes[pos + 5],
        bytes[pos + 6],
        bytes[pos + 7]
      );

      if (chunkType === 'IHDR') {
        ihdrEndOffset = pos + 12 + chunkLen;
      } else if (chunkType === 'pHYs') {
        existingPhysOffset = pos;
        existingPhysLength = 12 + chunkLen;
        break;
      }

      pos += 12 + chunkLen;
      if (chunkLen < 0 || pos > bytes.length) break;
    }
  } catch (err) {
    console.warn('Error parsing PNG chunks:', err);
  }

  if (existingPhysOffset !== -1) {
    // Replace existing pHYs chunk
    const result = new Uint8Array(bytes.length - existingPhysLength + 21);
    result.set(bytes.subarray(0, existingPhysOffset), 0);
    result.set(physChunk, existingPhysOffset);
    result.set(
      bytes.subarray(existingPhysOffset + existingPhysLength),
      existingPhysOffset + 21
    );
    return result;
  } else {
    // Insert pHYs right after IHDR chunk
    const safeIhdrEnd = Math.min(ihdrEndOffset, bytes.length);
    const result = new Uint8Array(bytes.length + 21);
    result.set(bytes.subarray(0, safeIhdrEnd), 0);
    result.set(physChunk, safeIhdrEnd);
    result.set(bytes.subarray(safeIhdrEnd), safeIhdrEnd + 21);
    return result;
  }
}

/**
 * Injects or updates the APP0 JFIF segment in a JPEG with target DPI (default 300).
 */
export function setJpegDpi(buffer: ArrayBuffer, dpi = 300): Uint8Array {
  const bytes = new Uint8Array(buffer);

  // Check JPEG SOI: 0xFF 0xD8
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return bytes; // Return unmodified
  }

  // Create standard JFIF APP0 segment (18 bytes total)
  const app0 = new Uint8Array(18);
  const view = new DataView(app0.buffer);

  app0[0] = 0xff;
  app0[1] = 0xe0; // APP0 marker
  view.setUint16(2, 16, false); // Length = 16 (includes length bytes)
  app0[4] = 0x4a; // 'J'
  app0[5] = 0x46; // 'F'
  app0[6] = 0x49; // 'I'
  app0[7] = 0x46; // 'F'
  app0[8] = 0x00; // '\0'
  app0[9] = 1; // Major version 1
  app0[10] = 2; // Minor version 2
  app0[11] = 1; // Units: 1 = dots per inch (DPI)
  view.setUint16(12, dpi, false); // X density = 300
  view.setUint16(14, dpi, false); // Y density = 300
  app0[16] = 0; // Thumbnail X
  app0[17] = 0; // Thumbnail Y

  // Check if first marker is APP0 (0xFF 0xE0)
  if (bytes[2] === 0xff && bytes[3] === 0xe0) {
    const existingLength = (bytes[4] << 8) | bytes[5];
    // Check if it's JFIF
    if (
      bytes[6] === 0x4a &&
      bytes[7] === 0x46 &&
      bytes[8] === 0x49 &&
      bytes[9] === 0x46 &&
      bytes[10] === 0x00
    ) {
      // Overwrite units and DPI in place
      const result = new Uint8Array(bytes);
      result[13] = 1; // Units = 1 (DPI)
      result[14] = (dpi >> 8) & 0xff;
      result[15] = dpi & 0xff;
      result[16] = (dpi >> 8) & 0xff;
      result[17] = dpi & 0xff;
      return result;
    } else {
      // Replace non-JFIF APP0 with our standard JFIF APP0
      const result = new Uint8Array(bytes.length - existingLength + 16);
      result.set(bytes.subarray(0, 2), 0);
      result.set(app0, 2);
      result.set(bytes.subarray(2 + 2 + existingLength), 2 + 18);
      return result;
    }
  } else {
    // Insert JFIF APP0 right after SOI (byte 2)
    const result = new Uint8Array(bytes.length + 18);
    result.set(bytes.subarray(0, 2), 0);
    result.set(app0, 2);
    result.set(bytes.subarray(2), 20);
    return result;
  }
}

/**
 * Attaches 300 DPI metadata to an image Blob according to its MIME type.
 */
export async function injectDpiMetadata(blob: Blob, dpi = 300): Promise<Blob> {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    if (blob.type === 'image/png') {
      const withDpi = setPngDpi(arrayBuffer, dpi);
      const cleanBuffer = withDpi.buffer.slice(
        withDpi.byteOffset,
        withDpi.byteOffset + withDpi.byteLength
      );
      return new Blob([cleanBuffer as ArrayBuffer], { type: 'image/png' });
    } else if (blob.type === 'image/jpeg') {
      const withDpi = setJpegDpi(arrayBuffer, dpi);
      const cleanBuffer = withDpi.buffer.slice(
        withDpi.byteOffset,
        withDpi.byteOffset + withDpi.byteLength
      );
      return new Blob([cleanBuffer as ArrayBuffer], { type: 'image/jpeg' });
    }
    return blob;
  } catch (err) {
    console.warn('Failed to inject DPI metadata, returning original blob:', err);
    return blob;
  }
}
