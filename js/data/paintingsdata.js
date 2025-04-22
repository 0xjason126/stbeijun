/**
 * 画作数据管理模块
 * 负责从JSON文件加载画作数据并提供数据访问接口
 */

class PaintingsDataManager {
    constructor() {
        this.paintings = [];
        this.lastUpdated = null;
    }

    /**
     * 从JSON文件加载画作数据
     * @returns {Promise<Array>} 画作数据数组
     */
    async loadPaintings() {
        try {
            const response = await fetch('/data/paintings.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.paintings = data.paintings;
            this.lastUpdated = data.lastUpdated;
            return this.paintings;
        } catch (error) {
            console.error('加载画作数据失败:', error);
            throw error;
        }
    }

    /**
     * 获取所有画作
     * @returns {Array} 画作数组
     */
    getAllPaintings() {
        return this.paintings;
    }

    /**
     * 根据状态筛选画作
     * @param {string} status - 画作状态
     * @returns {Array} 筛选后的画作数组
     */
    filterByStatus(status) {
        if (!status || status === '全部') return this.paintings;
        return this.paintings.filter(painting => painting.status === status);
    }

    /**
     * 根据标签筛选画作
     * @param {string} tag - 画作标签
     * @returns {Array} 筛选后的画作数组
     */
    filterByTag(tag) {
        if (!tag || tag === '全部') return this.paintings;
        return this.paintings.filter(painting => painting.tags.includes(tag));
    }

    /**
     * 搜索画作
     * @param {string} query - 搜索关键词
     * @returns {Array} 搜索结果数组
     */
    search(query) {
        if (!query) return this.paintings;
        const lowercaseQuery = query.toLowerCase();
        return this.paintings.filter(painting => {
            return painting.title.toLowerCase().includes(lowercaseQuery) ||
                   painting.description.toLowerCase().includes(lowercaseQuery) ||
                   painting.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery));
        });
    }

    /**
     * 获取最后更新时间
     * @returns {string} 最后更新时间
     */
    getLastUpdated() {
        return this.lastUpdated;
    }
}

// 创建全局实例
window.paintingsData = new PaintingsDataManager();