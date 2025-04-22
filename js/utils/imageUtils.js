/**
 * 图片工具类
 * 用于处理七牛云图片的动态调整尺寸和格式
 */

const imageUtils = {
    /**
     * 七牛云图片处理参数
     * 参考文档：https://developer.qiniu.com/dora/api/basic-processing-images-imageview2
     */
    QINIU_MODES: {
        SCALE_FIT: 1,  // 等比缩放，宽高都不超过指定值
        SCALE_FILL: 2, // 等比缩放，宽高都不小于指定值，居中裁剪
        WIDTH_FIT: 3,  // 指定宽度，高度等比缩放
        HEIGHT_FIT: 4, // 指定高度，宽度等比缩放
        FORCE_SIZE: 5  // 强制宽高，可能变形
    },
    
    /**
     * 图片格式
     */
    FORMATS: {
        ORIGINAL: '', // 原格式
        JPG: 'jpg',   // JPEG格式
        PNG: 'png',   // PNG格式
        WEBP: 'webp'  // WebP格式（体积更小，兼容性较差）
    },
    
    /**
     * 预设尺寸
     */
    SIZES: {
        THUMBNAIL: { width: 300, height: 400 },  // 缩略图尺寸
        MEDIUM: { width: 600, height: 800 },      // 中等尺寸
        LARGE: { width: 1080, height: 1440 },     // 大尺寸
        ORIGINAL: { width: 0, height: 0 }         // 原始尺寸
    },
    
    /**
     * 判断URL是否为七牛云链接
     * @param {string} url - 图片URL
     * @returns {boolean} - 是否为七牛云链接
     */
    isQiniuUrl(url) {
        if (!url) return false;
        // 检查是否包含七牛云域名
        return url.includes('clouddn.com') || url.includes('qiniucdn.com');
    },
    
    /**
     * 从URL中提取基础链接（去除参数）
     * @param {string} url - 完整的图片URL
     * @returns {string} - 不含参数的基础URL
     */
    getBaseUrl(url) {
        if (!url) return '';
        // 移除已有的图片处理参数和token
        const questionMarkIndex = url.indexOf('?');
        if (questionMarkIndex !== -1) {
            return url.substring(0, questionMarkIndex);
        }
        return url;
    },
    
    /**
     * 保留URL中的token参数
     * @param {string} url - 完整的图片URL
     * @returns {string} - token参数字符串，如果没有则返回空字符串
     */
    extractTokenParam(url) {
        if (!url) return '';
        const questionMarkIndex = url.indexOf('?');
        if (questionMarkIndex === -1) return '';
        
        const params = url.substring(questionMarkIndex + 1).split('&');
        for (const param of params) {
            if (param.startsWith('token=')) {
                return param;
            }
        }
        return '';
    },
    
    /**
     * 生成缩略图URL
     * @param {string} url - 原始图片URL
     * @param {Object} options - 配置选项
     * @param {number} options.mode - 缩放模式，默认为等比缩放
     * @param {number} options.width - 宽度
     * @param {number} options.height - 高度
     * @param {string} options.format - 输出格式
     * @param {number} options.quality - 图片质量(1-100)
     * @returns {string} - 处理后的URL
     */
    getResizedImageUrl(url, options = {}) {
        // 默认配置
        const defaultOptions = {
            mode: this.QINIU_MODES.SCALE_FIT,
            width: 0,
            height: 0,
            format: this.FORMATS.ORIGINAL,
            quality: 80
        };
        
        // 合并选项
        const config = { ...defaultOptions, ...options };
        
        // 如果不是七牛云链接，直接返回原URL
        if (!this.isQiniuUrl(url)) {
            return url;
        }
        
        // 提取基础URL和token
        const baseUrl = this.getBaseUrl(url);
        const tokenParam = this.extractTokenParam(url);
        
        // 构建图片处理参数
        let params = `imageView2/${config.mode}`;
        
        // 添加宽高参数（如果有）
        if (config.width > 0) params += `/w/${config.width}`;
        if (config.height > 0) params += `/h/${config.height}`;
        
        // 添加格式和质量参数（如果有）
        if (config.format) params += `/format/${config.format}`;
        params += `/q/${config.quality}`;
        
        // 组合最终URL
        let finalUrl = `${baseUrl}?${params}`;
        
        // 添加token参数（如果有）
        if (tokenParam) {
            finalUrl += `&${tokenParam}`;
        }
        
        return finalUrl;
    },
    
    /**
     * 获取缩略图URL
     * @param {string} url - 原始图片URL
     * @param {string} format - 输出格式，默认为原格式
     * @returns {string} - 缩略图URL
     */
    getThumbnailUrl(url, format = this.FORMATS.ORIGINAL) {
        return this.getResizedImageUrl(url, {
            ...this.SIZES.THUMBNAIL,
            format: format
        });
    },
    
    /**
     * 获取中等尺寸图片URL
     * @param {string} url - 原始图片URL
     * @param {string} format - 输出格式，默认为原格式
     * @returns {string} - 中等尺寸图片URL
     */
    getMediumUrl(url, format = this.FORMATS.ORIGINAL) {
        return this.getResizedImageUrl(url, {
            ...this.SIZES.MEDIUM,
            format: format
        });
    },
    
    /**
     * 获取大尺寸图片URL
     * @param {string} url - 原始图片URL
     * @param {string} format - 输出格式，默认为原格式
     * @returns {string} - 大尺寸图片URL
     */
    getLargeUrl(url, format = this.FORMATS.ORIGINAL) {
        return this.getResizedImageUrl(url, {
            ...this.SIZES.LARGE,
            format: format
        });
    },
    
    /**
     * 获取原始尺寸图片URL（可选择转换格式）
     * @param {string} url - 原始图片URL
     * @param {string} format - 输出格式，默认为原格式
     * @returns {string} - 原始尺寸图片URL
     */
    getOriginalUrl(url, format = this.FORMATS.ORIGINAL) {
        if (!format || format === this.FORMATS.ORIGINAL) {
            return this.getBaseUrl(url);
        }
        
        return this.getResizedImageUrl(url, {
            mode: this.QINIU_MODES.ORIGINAL,
            format: format
        });
    }
};

// 导出工具类
window.imageUtils = imageUtils;