// Draw a simple original vector-style lightning mark into local PNGs, without external assets.
const fs = require("fs"),
  zlib = require("zlib");
const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function chunk(type, data) {
  const t = Buffer.from(type),
    buf = Buffer.concat([t, data]);
  let crc = 0xffffffff;
  for (const b of buf) crc = crcTable[(crc ^ b) & 255] ^ (crc >>> 8);
  const l = Buffer.alloc(4),
    c = Buffer.alloc(4);
  l.writeUInt32BE(data.length);
  c.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([l, buf, c]);
}
function png(size, file) {
  const points = [
    [0.57, 0.15],
    [0.28, 0.55],
    [0.47, 0.55],
    [0.4, 0.85],
    [0.74, 0.42],
    [0.54, 0.42],
  ];
  const rows = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [xi, yi] = points[i],
          [xj, yj] = points[j];
        if (
          yi > y / size !== yj > y / size &&
          x / size < ((xj - xi) * (y / size - yi)) / (yj - yi) + xi
        )
          inside = !inside;
      }
      const n = y * (size * 4 + 1) + 1 + x * 4;
      const color = inside ? [73, 226, 175, 255] : [11, 25, 44, 255];
      for (let c = 0; c < 4; c++) rows[n + c] = color[c];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  fs.writeFileSync(
    file,
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", ihdr),
      chunk("IDAT", zlib.deflateSync(rows)),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  );
}
fs.mkdirSync("assets", { recursive: true });
png(1024, "assets/icon.png");
png(512, "assets/splash.png");
fs.writeFileSync(
  "assets/logo.svg",
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#0B192C"/><path d="M57 15 28 55h19l-7 30 34-43H54Z" fill="#49E2AF"/></svg>',
);
