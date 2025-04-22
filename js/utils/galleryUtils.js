/**
 * 画廊工具函数
 * 用于处理画廊相关的文件系统操作
 */

import { extractPaintingInfo } from './fileUtils.js';

/**
 * 获取指定年份的画作列表
 * @param {string} year - 年份，如果为空则获取所有年份的画作
 * @returns {Promise<Array>} 画作信息数组
 */
async function getPaintings(year = '', countOnly = false, startIndex = 0, endIndex = Infinity) {
    try {
        // 从paintings.json获取数据
        const response = await fetch('/data/paintings.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        let paintings = data.paintings || [];
        
        // 如果有年份筛选，应用筛选
        if (year) {
            paintings = paintings.filter(p => p.year === year);
        }
        
        // 如果只需要计数，返回总数
        if (countOnly) {
            return paintings.length;
        }
        
        // 应用分页
        paintings = paintings.slice(startIndex, endIndex);
        
        // 按年份倒序排序
        return paintings.sort((a, b) => b.year - a.year);
        
    } catch (error) {
        console.error('获取画作列表失败:', error);
        return [];
    }
}

/**
 * 获取所有年份目录
 * @returns {Promise<Array>} 年份数组
 */
async function getYears() {
    try {
        const galleryPath = '/images/gallery';
        const items = await readDirectory(galleryPath);
        return items
            .filter(item => /^\d{4}$/.test(item)) // 只保留四位数字的目录名
            .sort((a, b) => b - a); // 倒序排序
    } catch (error) {
        console.error('获取年份列表失败:', error);
        return [];
    }
}

/**
 * 读取指定目录下的文件列表
 * @param {string} path - 目录路径
 * @returns {Promise<Array>} 文件名数组
 */
async function readDirectory(path) {
    try {
        // 直接从paintings.json获取数据
        const response = await fetch('../data/paintings.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.paintings.map(p => p.imageUrl.split('/').pop())
                    .filter(line => line.trim());
        } catch (fetchError) {
            console.warn('使用fetch获取目录列表失败，尝试备用方法:', fetchError);
        }
        
        // 备用方法：使用预定义的年份和图片列表
        if (path.includes('/images/gallery/')) {
            const year = path.split('/').pop();
            // 根据年份返回预定义的图片列表
            return getDefaultImagesForYear(year);
        }
        
        // 如果是获取年份目录
        if (path === '/images/gallery') {
            return ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
        }
        
        return [];
    } catch (error) {
        console.error('读取目录失败:', error);
        return [];
    }
}

/**
 * 获取指定年份的默认图片列表
 * @param {string} year - 年份
 * @returns {Array} 图片文件名数组
 */
function getDefaultImagesForYear(year) {
    // 为每个年份返回一些默认图片名称
    const defaultImages = {
        '2018': ['2018_香港地图_100x150.jpg', '2018_山水_70x138.jpg'],
        '2019': ['2019_仕女图_70x138.jpg', '2019_山水_100x150.jpg'],
        '2020': ['2020_松下高士_70x138.jpg', '2020_山水_100x150.jpg'],
        '2021': ['2021_仕女图_70x138.jpg', '2021_山水_100x150.jpg'],
        '2022': ['2022_仰望_100x150.jpg', '2022_第一课_100x150.jpg'],
        '2023': ['2023_家乡线条_100x150.jpg', '2023_山水_70x138.jpg'],
        '2024': ['2024_福到甲辰_100x150.jpg', '2024_山水_70x138.jpg'],
        '2025': ['2025_东进_100x150.jpg', '2025_山水_70x138.jpg']
    };
    
    return defaultImages[year] || [];
}

export {
    getPaintings,
    getYears
};