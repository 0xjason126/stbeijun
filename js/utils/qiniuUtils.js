/**
 * 七牛云工具类
 * 用于处理画作数据的获取和图片处理
 */
import * as qiniu from 'qiniu-js';
import { extractPaintingInfo } from './fileUtils.js';
import { ApiUtils } from './apiUtils.js';

class QiniuUtils {
    constructor() {
        this.apiUtils = new ApiUtils();
        this.baseUrl = 'gallery.stbeijun.art';
        this.accessKey = 'f4qaIediBtMi9d9Xb7qciOHq-IajW1cXdGyI2utz';
        this.secretKey = 'CQWSYwmmAnJzBWT8rW4lpvzDET0W4ap4wWS8SNGO';
        this.bucket = 'stbeijun';
        this.initialized = false;
        this.cachedPaintings = [];
        this.cachedYears = [];
    }

    /**
     * 初始化七牛云工具类
     */
    init() {
        if (this.initialized) return;
        
        this.apiUtils.setConfig(
            this.baseUrl,
            this.accessKey,
            this.secretKey,
            this.bucket
        );
        
        this.initialized = true;
    }

    /**
     * 获取画作列表
     * @param {string} year - 年份筛选
     * @param {boolean} countOnly - 是否只返回数量
     * @param {number} startIndex - 起始索引
     * @param {number} endIndex - 结束索引
     * @returns {Promise<Array|number>} - 画作列表或数量
     */
    async getPaintings(year = '', countOnly = false, startIndex = 0, endIndex = Infinity) {
        this.init();
        
        try {
            // 如果缓存为空，从七牛云获取数据
            if (this.cachedPaintings.length === 0) {
                await this.fetchPaintingsFromQiniu();
            }
            
            // 根据年份筛选
            let filteredPaintings = this.cachedPaintings;
            if (year) {
                filteredPaintings = this.cachedPaintings.filter(painting => painting.year === parseInt(year));
            }
            
            // 如果只需要计数，返回数量
            if (countOnly) {
                return filteredPaintings.length;
            }
            
            // 分页处理
            return filteredPaintings
                .sort((a, b) => b.year - a.year) // 按年份倒序排序
                .slice(startIndex, endIndex);
                
        } catch (error) {
            console.error('获取画作列表失败:', error);
            // 失败时尝试从本地JSON获取
            return this.getPaintingsFromJson(year, countOnly, startIndex, endIndex);
        }
    }

    /**
     * 从七牛云获取画作数据
     * @returns {Promise<Array>} - 画作列表
     */
    async fetchPaintingsFromQiniu() {
        try {
            // 获取七牛云存储中的文件列表
            const files = await this.listFiles('gallery/');
            
            // 解析文件信息，提取画作数据
            this.cachedPaintings = files.map(file => {
                // 从文件路径中提取信息
                const key = file.key;
                const pathParts = key.split('/');
                
                // 跳过目录和非图片文件
                if (pathParts.length < 2 || !key.match(/\.(jpg|jpeg|png|webp)$/i)) {
                    return null;
                }
                
                // 提取年份目录和文件名
                const yearDir = pathParts[1];
                const fileName = pathParts[pathParts.length - 1];
                
                // 检查年份目录是否为4位数字
                if (!/^\d{4}$/.test(yearDir)) {
                    return null;
                }
                
                // 解析文件名获取标题和尺寸
                // 文件名格式：标题_尺寸.扩展名
                const fileNameParts = fileName.split('_');
                if (fileNameParts.length < 2) {
                    return null;
                }
                
                const title = fileNameParts[0];
                let dimensions = fileNameParts[1].replace(/\.[^/.]+$/, '');
                
                // 确保尺寸格式正确
                if (!dimensions.includes('x')) {
                    dimensions = '未知尺寸';
                } else if (!dimensions.includes('cm')) {
                    dimensions += ' cm';
                }
                
                // 生成唯一ID
                const id = `${yearDir}_${title}`;
                
                // 生成图片URL
                const imageUrl = `https://${this.baseUrl}/${key}`;
                
                // 生成缩略图和大图URL
                const thumbnailUrl = window.imageUtils ? 
                    window.imageUtils.getThumbnailUrl(imageUrl) : 
                    imageUrl;
                    
                const largeUrl = window.imageUtils ? 
                    window.imageUtils.getLargeUrl(imageUrl) : 
                    imageUrl;
                
                // 返回画作对象
                return {
                    id,
                    title,
                    year: parseInt(yearDir),
                    dimensions,
                    imageUrl,
                    artist: '贝军',
                    status: '售卖中', // 默认状态
                    description: `${title}，${yearDir}年作品，${dimensions}。`, // 默认描述
                    images: {
                        thumbnail: thumbnailUrl,
                        large: largeUrl
                    }
                };
            }).filter(Boolean); // 过滤掉null值
            
            // 提取所有年份
            this.cachedYears = [...new Set(this.cachedPaintings.map(p => p.year))]
                .sort((a, b) => b - a); // 按年份倒序排序
                
            return this.cachedPaintings;
        } catch (error) {
            console.error('从七牛云获取画作数据失败:', error);
            throw error;
        }
    }

    /**
     * 列出七牛云存储中的文件
     * @param {string} prefix - 前缀路径
     * @returns {Promise<Array>} - 文件列表
     */
    async listFiles(prefix = '') {
        try {
            // 使用apiUtils获取文件列表
            return await this.apiUtils.fetchFiles(prefix);
        } catch (error) {
            console.error('列出七牛云文件失败:', error);
            throw error;
        }
    }

    /**
     * 从本地JSON获取画作数据（备用方法）
     * @param {string} year - 年份筛选
     * @param {boolean} countOnly - 是否只返回数量
     * @param {number} startIndex - 起始索引
     * @param {number} endIndex - 结束索引
     * @returns {Promise<Array|number>} - 画作列表或数量
     */
    async getPaintingsFromJson(year = '', countOnly = false, startIndex = 0, endIndex = Infinity) {
        try {
            const response = await fetch('/data/paintings.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            let paintings = data.paintings || [];
            
            // 根据年份筛选
            if (year) {
                paintings = paintings.filter(p => p.year === year);
            }
            
            // 如果只需要计数，返回数量
            if (countOnly) {
                return paintings.length;
            }
            
            // 分页处理
            return paintings
                .sort((a, b) => b.year - a.year) // 按年份倒序排序
                .slice(startIndex, endIndex);
                
        } catch (error) {
            console.error('从JSON获取画作数据失败:', error);
            return countOnly ? 0 : [];
        }
    }

    /**
     * 获取所有年份
     * @returns {Promise<Array>} - 年份列表
     */
    async getYears() {
        this.init();
        
        try {
            // 如果缓存为空，从七牛云获取数据
            if (this.cachedYears.length === 0) {
                await this.fetchPaintingsFromQiniu();
            }
            
            return this.cachedYears;
        } catch (error) {
            console.error('获取年份列表失败:', error);
            // 失败时尝试从本地JSON获取
            return this.getYearsFromJson();
        }
    }

    /**
     * 从本地JSON获取年份列表（备用方法）
     * @returns {Promise<Array>} - 年份列表
     */
    async getYearsFromJson() {
        try {
            const response = await fetch('/data/paintings.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const paintings = data.paintings || [];
            
            // 提取所有年份并去重
            return [...new Set(paintings.map(p => p.year))]
                .sort((a, b) => b - a); // 按年份倒序排序
                
        } catch (error) {
            console.error('从JSON获取年份列表失败:', error);
            return [];
        }
    }
}

// 创建单例实例
const qiniuUtils = new QiniuUtils();

// 导出工具类和实例
export { QiniuUtils, qiniuUtils };