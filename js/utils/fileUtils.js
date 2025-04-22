/**
 * 文件工具函数
 * 用于解析文件名和路径，提取画作信息
 */

/**
 * 从文件路径中提取画作信息
 * @param {string} filePath - 文件路径，格式如: "2023/yangwang_70x138.jpg"
 * @returns {Object} 包含画作信息的对象
 */
function extractPaintingInfo(filePath) {
    try {
        // 移除文件扩展名
        const pathWithoutExt = filePath.replace(/\.[^/.]+$/, '');
        
        // 分割路径获取年份和文件名
        const parts = pathWithoutExt.split('/');
        const year = parts[parts.length - 2] || parts[0]; // 支持完整路径和相对路径
        const fileName = parts[parts.length - 1];
        
        // 分割文件名获取年份前缀、标题和尺寸
        const [yearPrefix, title, dimensions] = fileName.split('_');
        
        return {
            year: parseInt(year),
            title: title,
            dimensions: dimensions + ' cm' // 添加单位
        };
    } catch (error) {
        console.error('解析文件路径失败:', error);
        return null;
    }
}

/**
 * 生成文件路径
 * @param {Object} paintingInfo - 画作信息对象
 * @param {string} extension - 文件扩展名（默认为.jpg）
 * @returns {string} 格式化的文件路径
 */
function generateFilePath(paintingInfo, extension = '.jpg') {
    try {
        const { year, title, dimensions } = paintingInfo;
        return `${year}/${title}_${dimensions}${extension}`;
    } catch (error) {
        console.error('生成文件路径失败:', error);
        return null;
    }
}

export {
    extractPaintingInfo,
    generateFilePath
};