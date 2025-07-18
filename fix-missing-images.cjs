const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Các đuôi file ảnh phổ biến
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];

// Hàm kiểm tra file tồn tại
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Hàm tạo file dummy (ảnh rỗng)
function createDummyImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  // Ảnh PNG rỗng
  const emptyPng = Buffer.from(
    '89504e470d0a1a0a0000000d4948445200000001000000010806000000' +
    '1f15c4890000000a49444154789c6360000002000100' +
    '0502a2e50000000049454e44ae426082', 'hex'
  );
  // Ảnh JPG rỗng
  const emptyJpg = Buffer.from(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLTAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==', 'base64'
  );
  let data = emptyPng;
  if (ext === '.jpg' || ext === '.jpeg') data = emptyJpg;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, data);
}

// Tìm tất cả các file code có thể chứa đường dẫn ảnh
const codeFiles = glob.sync('src/**/*.{js,jsx,ts,tsx,css,scss,html}', {});

let missingImages = [];

codeFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Regex tìm đường dẫn ảnh
  const regex = /(['"`])([^'"`]*\.(jpg|jpeg|png|gif|svg|webp))\1/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    let imgPath = match[2];
    // Bỏ qua link ngoài
    if (imgPath.startsWith('http')) continue;
    // Chuẩn hóa đường dẫn
    let absPath = imgPath.startsWith('.')
      ? path.resolve(path.dirname(file), imgPath)
      : path.resolve('src', imgPath.replace(/^src[\/\\]/, ''));
    // Nếu file không tồn tại thì thêm vào danh sách
    if (!fileExists(absPath)) {
      missingImages.push(absPath);
    }
  }
});

// Loại trùng lặp
missingImages = [...new Set(missingImages)];

if (missingImages.length === 0) {
  console.log('Không thiếu file ảnh nào!');
} else {
  console.log('Các file ảnh bị thiếu sẽ được tạo dummy:');
  missingImages.forEach(img => {
    // Chỉ tạo file dummy nếu file nằm trong thư mục dự án
    if (img.startsWith(path.resolve('src'))) {
      console.log(img);
      createDummyImage(img);
    } else {
      console.log('Bỏ qua file không hợp lệ:', img);
    }
  });
}
