const fs = require('fs');
const path = require('path');

// Generate a valid 32x32 ICO file with a red background and bright lightning bolt
function createVoltixIco() {
  const width = 32;
  const height = 32;
  const bpp = 32;
  const imageSize = width * height * 4;
  const headerSize = 40; // BITMAPINFOHEADER
  const totalImageSize = headerSize + imageSize;

  // ICONDIR (6 bytes)
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // reserved
  icoHeader.writeUInt16LE(1, 2); // type 1 = ICO
  icoHeader.writeUInt16LE(1, 4); // count of images = 1

  // ICONDIRENTRY (16 bytes)
  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(width, 0);
  dirEntry.writeUInt8(height, 1);
  dirEntry.writeUInt8(0, 2); // color palette
  dirEntry.writeUInt8(0, 3); // reserved
  dirEntry.writeUInt16LE(1, 4); // color planes
  dirEntry.writeUInt16LE(bpp, 6); // bits per pixel
  dirEntry.writeUInt32LE(totalImageSize, 8); // size of image data
  dirEntry.writeUInt32LE(22, 12); // offset of image data (6 + 16 = 22)

  // BITMAPINFOHEADER (40 bytes)
  const bmpHeader = Buffer.alloc(40);
  bmpHeader.writeUInt32LE(40, 0); // header size
  bmpHeader.writeInt32LE(width, 4); // width
  bmpHeader.writeInt32LE(height * 2, 8); // height (in ICO, double height for mask)
  bmpHeader.writeUInt16LE(1, 12); // planes
  bmpHeader.writeUInt16LE(bpp, 14); // bit count
  bmpHeader.writeUInt32LE(0, 16); // compression (BI_RGB)
  bmpHeader.writeUInt32LE(imageSize, 20); // image size
  bmpHeader.writeInt32LE(0, 24); // x ppm
  bmpHeader.writeInt32LE(0, 28); // y ppm
  bmpHeader.writeUInt32LE(0, 32); // clr used
  bmpHeader.writeUInt32LE(0, 36); // clr important

  // Pixel data (BGRA format, bottom-to-top)
  const pixelData = Buffer.alloc(imageSize);

  // Lightning bolt mask bitmap (32x32)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = ((height - 1 - y) * width + x) * 4;

      // Rounded border check (radius 6)
      const isCorner =
        (x < 4 && y < 4 && Math.hypot(4 - x, 4 - y) > 4) ||
        (x > 27 && y < 4 && Math.hypot(x - 27, 4 - y) > 4) ||
        (x < 4 && y > 27 && Math.hypot(4 - x, y - 27) > 4) ||
        (x > 27 && y > 27 && Math.hypot(x - 27, y - 27) > 4);

      if (isCorner) {
        pixelData[idx] = 0; // B
        pixelData[idx + 1] = 0; // G
        pixelData[idx + 2] = 0; // R
        pixelData[idx + 3] = 0; // A (Transparent)
        continue;
      }

      // Lightning Bolt Shape (normalized coordinate)
      const nx = x / 32;
      const ny = y / 32;

      let isBolt = false;
      // Top segment
      if (ny >= 0.15 && ny <= 0.55 && nx >= 0.35 + (0.55 - ny) * 0.4 && nx <= 0.65) {
        isBolt = true;
      }
      // Middle bar
      if (ny >= 0.45 && ny <= 0.58 && nx >= 0.25 && nx <= 0.70) {
        isBolt = true;
      }
      // Bottom segment
      if (ny >= 0.50 && ny <= 0.88 && nx >= 0.28 && nx <= 0.60 - (ny - 0.50) * 0.4) {
        isBolt = true;
      }

      if (isBolt) {
        // Bright Golden Yellow Bolt
        pixelData[idx] = 138; // B
        pixelData[idx + 1] = 240; // G
        pixelData[idx + 2] = 254; // R
        pixelData[idx + 3] = 255; // Alpha
      } else {
        // Vivid Red Gradient background
        const redAmount = Math.floor(220 - (y / height) * 20);
        pixelData[idx] = 38; // B
        pixelData[idx + 1] = 38; // G
        pixelData[idx + 2] = redAmount; // R
        pixelData[idx + 3] = 255; // Alpha
      }
    }
  }

  const icoBuffer = Buffer.concat([icoHeader, dirEntry, bmpHeader, pixelData]);

  const rootDir = path.resolve(__dirname, '..');
  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(rootDir, 'app', 'favicon.ico'), icoBuffer);
  console.log('Successfully created public/favicon.ico and app/favicon.ico');
}

createVoltixIco();
