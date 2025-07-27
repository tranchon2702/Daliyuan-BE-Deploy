const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Định nghĩa các kích thước ảnh cần thiết
const imageSizes = {
  thumbnail: { width: 150, height: 150 },
  medium: { width: 600, height: 600 }
};

// Tạo thư mục cho từng loại ảnh nếu chưa tồn tại
const createDirectories = () => {
  const baseDir = path.join(__dirname, '../../uploads');
  
  // Tạo thư mục uploads nếu chưa tồn tại
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  
  // Tạo thư mục cho từng loại ảnh
  const directories = [
    'images/original',
    'images/webp',
    'images/thumbnail',
    'images/medium'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.join(baseDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

// Tạo tên file mới dựa trên kích thước và định dạng
const generateFilename = (originalFilename, size, format) => {
  const parsedPath = path.parse(originalFilename);
  return `${parsedPath.name}-${size}.${format}`;
};

// Middleware xử lý ảnh sau khi upload
const processImages = async (req, res, next) => {
  try {
    // Tạo thư mục nếu chưa tồn tại
    createDirectories();
    
    // Nếu không có file được upload, tiếp tục
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const processedImages = [];
    
    // Xử lý từng file đã upload
    for (const file of req.files) {
      const originalPath = file.path;
      const filename = path.basename(file.filename);
      const parsedFilename = path.parse(filename);
      
      // Đường dẫn lưu file gốc
      const originalDir = path.join(__dirname, '../../uploads/images/original');
      const originalFilePath = path.join(originalDir, filename);
      
      // Di chuyển file gốc vào thư mục original
      if (originalPath !== originalFilePath) {
        fs.renameSync(originalPath, originalFilePath);
      }
      
      // Đối tượng chứa thông tin về file đã xử lý
      const processedImage = {
        originalName: file.originalname,
        filename: parsedFilename.name,
        mimetype: file.mimetype,
        size: file.size,
        paths: {
          original: `/uploads/images/original/${filename}`
        }
      };
      
      // Tạo phiên bản WebP của ảnh gốc
      const webpFilename = `${parsedFilename.name}.webp`;
      const webpPath = path.join(__dirname, '../../uploads/images/webp', webpFilename);
      await sharp(originalFilePath)
        .webp({ quality: 80 })
        .toFile(webpPath);
      processedImage.paths.webp = `/uploads/images/webp/${webpFilename}`;
      
      // Chỉ tạo 2 phiên bản WebP với kích thước khác nhau: medium và thumbnail
      for (const [size, dimensions] of Object.entries(imageSizes)) {
        const webpSizeFilename = generateFilename(filename, size, 'webp');
        const webpSizePath = path.join(__dirname, `../../uploads/images/${size}`, webpSizeFilename);
        
        // Tạo phiên bản WebP với kích thước tương ứng
        await sharp(originalFilePath)
          .resize({
            width: dimensions.width,
            height: dimensions.height,
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 80 })
          .toFile(webpSizePath);
        
        processedImage.paths[`${size}Webp`] = `/uploads/images/${size}/${webpSizeFilename}`;
      }
      
      processedImages.push(processedImage);
    }
    
    // Lưu thông tin về các file đã xử lý vào request
    req.processedImages = processedImages;
    
    next();
  } catch (error) {
    console.error('Lỗi khi xử lý ảnh:', error);
    next(error);
  }
};

module.exports = {
  processImages
}; 