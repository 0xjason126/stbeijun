/**
 * 七牛云API工具类
 * 提供七牛云文件上传和管理功能
 */
import * as qiniu from 'qiniu-js';

class ApiUtils {
    constructor() {
        this.baseUrl = 'gallery.stbeijun.art'; // 七牛云CDN域名
        this.accessKey = 'f4qaIediBtMi9d9Xb7qciOHq-IajW1cXdGyI2utz'; // 七牛云 AccessKey
        this.secretKey = 'CQWSYwmmAnJzBWT8rW4lpvzDET0W4ap4wWS8SNGO'; // 七牛云 SecretKey
        this.bucket = 'stbeijun'; // 存储空间名称
        this.config = new qiniu.Config();
        this.config.zone = qiniu.Zone.z0; // 华东机房

    /**
     * 设置七牛云配置
     * @param {string} url - 七牛云基础URL
     * @param {string} accessKey - 七牛云 AccessKey
     * @param {string} secretKey - 七牛云 SecretKey
     * @param {string} bucket - 存储空间名称
     */
    setConfig(url, accessKey, secretKey, bucket) {
        this.baseUrl = url;
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.bucket = bucket;
        
        // 初始化七牛云配置
        this.config = new qiniu.Config();
        this.config.zone = qiniu.Zone.z0; // 华东机房
    }

    /**
     * 解析七牛云目录JSON
     * @param {Object} dirData - 目录JSON数据
     * @returns {Array} 处理后的文件列表
     */
    parseDirJson(dirData) {
        if (!Array.isArray(dirData.items)) {
            throw new Error('无效的目录数据格式');
        }

        return dirData.items.map(item => ({
            key: item.key,
            hash: item.hash,
            size: item.fsize,
            mimeType: item.mimeType,
            putTime: new Date(item.putTime / 10000), // 转换时间戳
            url: this.generateFileUrl(item.key)
        }));
    }

    /**
     * 生成文件访问URL
     * @param {string} key - 文件键名
     * @returns {string} 完整的文件访问URL
     */
    generateFileUrl(key) {
        if (!this.baseUrl) {
            throw new Error('请先设置baseUrl');
        }
        return `https://${this.baseUrl}/${key}`;
    }

    /**
     * 生成上传凭证
     * @returns {string} 上传凭证
     */
    generateUploadToken() {
        const putPolicy = new qiniu.PutPolicy({
            scope: this.bucket
        });
        return putPolicy.uploadToken(this.accessKey, this.secretKey);
    }

    /**
     * 上传单个文件到七牛云
     * @param {File} file - 要上传的文件对象
     * @param {string} key - 文件在七牛云中的键名
     * @param {Function} onProgress - 上传进度回调函数
     * @returns {Promise} 上传结果Promise
     */
    async uploadFile(file, key, onProgress = null) {
        const token = this.generateUploadToken();
        const putExtra = {
            fname: file.name,
            params: {},
            mimeType: file.type
        };
        const observable = qiniu.upload(file, key, token, putExtra, this.config);

        return new Promise((resolve, reject) => {
            observable.subscribe({
                next: (response) => {
                    const percent = response.total.percent.toFixed(2);
                    if (onProgress) {
                        onProgress(percent);
                    }
                },
                error: (err) => {
                    console.error('上传失败:', err);
                    reject(new Error(`上传失败: ${err.message || '未知错误'}`));
                },
                complete: (res) => {
                    resolve({
                        key: res.key,
                        hash: res.hash,
                        url: this.generateFileUrl(res.key)
                    });
                }
            });
        });
    }

    /**
     * 批量上传图片到七牛云
     * @param {FileList|Array} files - 要上传的文件列表
     * @param {Object} options - 上传选项
     * @param {string} options.prefix - 文件在七牛云中的前缀路径
     * @param {number} options.year - 作品年份
     * @param {string} options.title - 作品标题
     * @param {string} options.size - 作品尺寸
     * @param {Function} options.onProgress - 单个文件上传进度回调
     * @param {Function} options.onFileComplete - 单个文件上传完成回调
     * @returns {Promise<Array>} 上传结果数组
     */
    async uploadImages(files, options = {}) {
        const {
            prefix = 'gallery/',
            year = new Date().getFullYear(),
            title = '',
            size = '',
            onProgress = null,
            onFileComplete = null
        } = options;

        if (!Array.from(files).length) {
            throw new Error('没有选择要上传的文件');
        }

        const uploadTasks = Array.from(files).map(async (file, index) => {
            const extension = file.name.split('.').pop().toLowerCase();
            if (!['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
                throw new Error(`不支持的文件格式: ${extension}`);
            }

            // 构建文件名：标题_尺寸_年份.扩展名
            const fileName = `${title}_${size}_${year}.${extension}`;
            const key = `${prefix}${year}/${fileName}`;

            try {
                const result = await this.uploadFile(file, key, 
                    percent => onProgress && onProgress(index, percent));
                if (onFileComplete) {
                    onFileComplete(index, result);
                }
                return result;
            } catch (error) {
                throw new Error(`文件 ${file.name} 上传失败: ${error.message}`);
            }
        });

        try {
            return await Promise.all(uploadTasks);
        } catch (error) {
            throw new Error(`批量上传失败: ${error.message}`);
        }
    }

    /**
     * 获取画作数据
     * @returns {Promise<Array>} 画作数据数组
     * @throws {Error} 当请求失败时抛出错误
     */
    async fetchPaintings() {
        try {
            const bucketManager = new qiniu.BucketManager(
                new qiniu.Auth(this.accessKey, this.secretKey),
                this.config
            );

            const options = {
                limit: 1000,
                prefix: 'gallery/',
                delimiter: '/'
            };

            const response = await bucketManager.listPrefix(this.bucket, options);

            if (!response) {
                throw new Error('获取数据失败：未收到响应');
            }
            
            if (response.error) {
                throw new Error(`获取数据失败：${response.error}`);
            }

            const [respBody, respInfo] = response;
            if (respInfo.statusCode !== 200) {
                throw new Error(`请求失败: ${respInfo.statusMessage}`);
            }

            return this.parseDirJson(respBody);
        } catch (error) {
            console.error('获取画作数据失败:', error);
            throw error;
        }
    }

    /**
     * 从本地目录递归上传图片到七牛云
     * @param {string} localDir - 本地目录路径
     * @param {Object} options - 上传选项
     * @param {string} options.prefix - 七牛云存储前缀
     * @param {Function} options.onProgress - 上传进度回调
     * @param {Function} options.onFileComplete - 文件上传完成回调
     * @returns {Promise<Array>} 上传结果数组
     */
    async uploadFromDirectory(localDir, options = {}) {
        const {
            prefix = 'gallery/',
            onProgress = null,
            onFileComplete = null
        } = options;

        const fs = require('fs');
        const path = require('path');
        const results = [];

        // 递归读取目录
        async function processDirectory(dir) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    // 递归处理子目录
                    await processDirectory(fullPath);
                } else if (entry.isFile()) {
                    // 检查是否为图片文件
                    const ext = path.extname(entry.name).toLowerCase();
                    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                        // 从文件名中提取信息
                        const fileName = path.basename(entry.name, ext);
                        const parts = fileName.split('_');
                        
                        // 获取年份（从目录名或文件名）
                        const yearMatch = fullPath.match(/\/(20\d{2})\//);
                        const year = yearMatch ? yearMatch[1] : new Date().getFullYear();
                        
                        // 构建七牛云存储路径
                        const relativePath = path.relative(localDir, fullPath);
                        const key = `${prefix}${relativePath}`;
                        
                        try {
                            // 读取文件
                            const fileData = fs.readFileSync(fullPath);
                            const file = new File([fileData], entry.name, {
                                type: `image/${ext.slice(1)}`
                            });
                            
                            // 上传文件
                            const result = await this.uploadFile(
                                file,
                                key,
                                percent => onProgress && onProgress(key, percent)
                            );
                            
                            results.push(result);
                            if (onFileComplete) {
                                onFileComplete(key, result);
                            }
                        } catch (error) {
                            console.error(`上传文件 ${fullPath} 失败:`, error);
                            throw error;
                        }
                    }
                }
            }
        }

        try {
            await processDirectory(localDir);
            return results;
        } catch (error) {
            throw new Error(`目录上传失败: ${error.message}`);
        }
    }
}

// 创建全局实例
window.apiUtils = new ApiUtils();