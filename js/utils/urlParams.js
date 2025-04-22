/**
 * URL参数处理工具
 * 用于处理URL查询参数，支持画廊页面的筛选功能
 */

// 创建全局命名空间对象
window.urlParamsUtils = {};

/**
 * 获取URL查询参数
 * @param {string} param - 参数名称
 * @returns {string|null} - 参数值，如果不存在则返回null
 */
window.urlParamsUtils.getUrlParam = function(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * 设置URL查询参数（不刷新页面）
 * @param {string} param - 参数名称
 * @param {string} value - 参数值
 */
window.urlParamsUtils.setUrlParam = function(param, value) {
  const url = new URL(window.location.href);
  if (value) {
    url.searchParams.set(param, value);
  } else {
    url.searchParams.delete(param);
  }
  window.history.pushState({}, '', url);
}

/**
 * 应用URL参数到筛选器
 * @param {Object} filters - 筛选器元素对象
 */
window.urlParamsUtils.applyUrlParamsToFilters = function(filters) {
  const urlParams = new URLSearchParams(window.location.search);
  
  // 遍历所有URL参数
  for (const [key, value] of urlParams.entries()) {
    // 检查是否有对应的筛选器
    if (filters[key] && value) {
      filters[key].value = value;
    }
  }
}

/**
 * 从筛选器更新URL参数
 * @param {Object} filters - 筛选器元素对象
 */
window.urlParamsUtils.updateUrlFromFilters = function(filters) {
  const url = new URL(window.location.href);
  
  // 遍历所有筛选器
  for (const key in filters) {
    const filter = filters[key];
    if (filter && filter.value) {
      url.searchParams.set(key, filter.value);
    } else {
      url.searchParams.delete(key);
    }
  }
  
  window.history.pushState({}, '', url);
}