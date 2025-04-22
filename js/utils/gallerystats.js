/**
 * 画廊统计工具
 * 用于统计画廊图片数量和验证数据完整性
 */

import fs from 'fs';
import path from 'path';

/**
 * 统计画廊图片数量
 * @param {string} galleryPath - 画廊根目录路径
 * @returns {Object} 包含统计信息的对象
 */
async function getGalleryStats(galleryPath) {
    const stats = {
        totalImages: 0,
        yearStats: {},
        imageList: []
    };

    try {
        // 获取所有年份目录
        const years = await fs.promises.readdir(galleryPath);
        
        // 遍历每个年份目录
        for (const year of years) {
            // 跳过隐藏文件和非目录
            if (year.startsWith('.') || !fs.statSync(path.join(galleryPath, year)).isDirectory()) {
                continue;
            }

            const yearPath = path.join(galleryPath, year);
            const files = await fs.promises.readdir(yearPath);
            
            // 过滤出图片文件
            const images = files.filter(file => 
                /\.(jpg|jpeg|png|gif)$/i.test(file) && !file.startsWith('.')
            );

            // 记录统计信息
            stats.yearStats[year] = images.length;
            stats.totalImages += images.length;
            
            // 记录图片列表
            images.forEach(image => {
                stats.imageList.push(`/images/gallery/${year}/${image}`);
            });
        }

        return stats;
    } catch (error) {
        console.error('统计画廊图片失败:', error);
        return null;
    }
}

/**
 * 验证paintings.json数据完整性
 * @param {Object} stats - 画廊统计信息
 * @param {Array} paintings - paintings.json中的画作数据
 * @returns {Object} 验证结果
 */
function validatePaintingsData(stats, paintings) {
    const validation = {
        totalInJson: paintings.length,
        totalInGallery: stats.totalImages,
        missingInJson: [],
        missingInGallery: []
    };

    // 检查JSON中记录的图片是否存在于画廊中
    paintings.forEach(painting => {
        if (!stats.imageList.includes(painting.imageUrl)) {
            validation.missingInGallery.push(painting.imageUrl);
        }
    });

    // 检查画廊中的图片是否都记录在JSON中
    stats.imageList.forEach(imagePath => {
        if (!paintings.some(p => p.imageUrl === imagePath)) {
            validation.missingInJson.push(imagePath);
        }
    });

    return validation;
}

export {
    getGalleryStats,
    validatePaintingsData
};