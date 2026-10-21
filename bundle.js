const fs = require('fs');
const path = require('path');

const manifestPath = 'manifest.json';
let currentVersion = '2.1.0';

if (fs.existsSync(manifestPath)) {
  try {
    const oldManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    currentVersion = String(oldManifest.latestVersion || '2.1.0').trim();
  } catch (e) {
    console.log('Không đọc được manifest cũ, dùng mặc định 2.1.0');
  }
}

const parts = currentVersion.split('.');
while (parts.length < 3) parts.push('0');
parts[2] = parseInt(parts[2] || 0, 10) + 1;
const newVersion = parts.join('.');
const releasedAt = new Date().toISOString();
const packageId = `wu_github_v${newVersion}_${Date.now()}`;

const dataDir = path.join(__dirname, 'data');
let allRecords = [];

if (fs.existsSync(dataDir)) {
  const files = fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith('.json'))
    .sort();

  files.forEach((file) => {
    try {
      const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        allRecords = allRecords.concat(parsed);
      } else if (parsed && typeof parsed === 'object') {
        allRecords.push({
          ...parsed,
          operation: parsed.operation || 'update',
        });
      }
    } catch (err) {
      console.error(`Lỗi đọc file ${file}:`, err.message);
    }
  });
}

const updatePackage = {
  format: 'lingervox-world-update',
  packageId: packageId,
  toVersion: newVersion,
  title: `Bản Cập Nhật Điển Tịch v${newVersion}`,
  description: 'Cập nhật dữ liệu Điển tịch từ GitHub',
  createdAt: releasedAt,
  signature: 'LVX-AUTO-GEN-SIG',
  checksum: 'auto',
  changes: allRecords,
};

fs.writeFileSync('update-data-latest.json', JSON.stringify(updatePackage, null, 2));

const newManifest = {
  format: 'lingervox-world-manifest',
  packageId: packageId,
  latestVersion: newVersion,
  title: `Bản Cập Nhật Điển Tịch Tự Động v${newVersion}`,
  description: 'Cập nhật từ GitHub',
  packageUrl: `./update-data-latest.json?v=${newVersion}`,
  releasedAt: releasedAt,
  changeCount: allRecords.length,
};

fs.writeFileSync(manifestPath, JSON.stringify(newManifest, null, 2));
console.log(`Đã đóng gói thành công ${allRecords.length} mục lên phiên bản ${newVersion}!`);