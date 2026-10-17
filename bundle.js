const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const manifestPath = path.join(__dirname, 'manifest.json');
const outputPath = path.join(__dirname, 'update-data-latest.json');

// 1. Đọc manifest hiện tại để lấy số version
let manifest = {
  latestVersion: "2.1.0",
  publishedAt: new Date().toISOString(),
  title: "Cập nhật Điển Tịch Mới",
  description: "Bản tổng hợp dữ liệu toàn bộ điển tịch mới nhất.",
  packageUrl: "./update-data-latest.json",
  checksum: "custom"
};

if (fs.existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {}
}

// 2. Tự động tăng version (ví dụ: 2.1.0 -> 2.1.1)
const vParts = String(manifest.latestVersion || "2.1.0").split('.').map(Number);
vParts[vParts.length - 1] = (vParts[vParts.length - 1] || 0) + 1;
const newVersion = vParts.join('.');

// 3. Đọc tất cả các file điển tịch trong thư mục data/
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
const allRecords = [];

for (const file of files) {
  try {
    const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
    allRecords.push(content);
  } catch (err) {
    console.warn(`Lỗi đọc file ${file}:`, err.message);
  }
}

// 4. Ghi file gộp update-data-latest.json
fs.writeFileSync(outputPath, JSON.stringify(allRecords, null, 2), 'utf8');

// 5. Cập nhật lại manifest.json trỏ vào file gộp
manifest.latestVersion = newVersion;
manifest.publishedAt = new Date().toISOString();
manifest.packageUrl = "./update-data-latest.json";
manifest.description = `Bản tổng hợp toàn bộ ${allRecords.length} điển tịch thế giới.`;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

console.log(`✅ Đã gom ${allRecords.length} điển tịch vào update-data-latest.json (Phiên bản mới: v${newVersion})`);
