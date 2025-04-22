/**
 * 画廊加载器 - 简化版
 * 直接从paintings.json加载数据，处理筛选、搜索和分页功能
 */

/**
 * 加载画作数据
 * @returns {Promise<Array>} 画作数据数组
 */
async function loadPaintings() {
  try {
    const response = await fetch('/data/paintings.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.paintings || [];
  } catch (error) {
    console.error('加载画作数据失败:', error);
    throw error;
  }
}

/**
 * 获取所有年份
 * @param {Array} paintings - 画作数据数组
 * @returns {Array} 年份数组
 */
function getYears(paintings) {
  const yearsSet = new Set(paintings.map(painting => painting.year));
  return [...yearsSet].sort((a, b) => b - a); // 倒序排序
}

/**
 * 筛选画作
 * @param {Array} paintings - 画作数据数组
 * @param {Object} filters - 筛选条件
 * @returns {Array} 筛选后的画作数组
 */
function filterPaintings(paintings, filters = {}) {
  const { year, status, search } = filters;
  
  return paintings.filter(painting => {
    // 年份筛选
    if (year && painting.year !== year) {
      return false;
    }
    
    // 状态筛选
    if (status && painting.status !== status) {
      return false;
    }
    
    // 搜索筛选
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        painting.title.toLowerCase().includes(searchLower) ||
        painting.description.toLowerCase().includes(searchLower) ||
        painting.artist.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
}

/**
 * 分页处理
 * @param {Array} paintings - 画作数据数组
 * @param {number} page - 当前页码
 * @param {number} itemsPerPage - 每页显示数量
 * @returns {Object} 分页结果
 */
function paginatePaintings(paintings, page = 1, itemsPerPage = 12) {
  const totalItems = paintings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  return {
    paintings: paintings.slice(startIndex, endIndex),
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    }
  };
}

/**
 * 生成分页HTML
 * @param {Object} pagination - 分页信息
 * @param {Function} onClick - 点击页码的回调函数
 * @returns {string} 分页HTML
 */
function generatePaginationHTML(pagination, onClick) {
  const { currentPage, totalPages } = pagination;
  
  if (totalPages <= 1) {
    return '';
  }
  
  let html = '<div class="flex justify-center space-x-2">';
  
  // 上一页按钮
  const prevDisabled = currentPage === 1 ? 'disabled' : '';
  html += `<button class="pagination-button ${prevDisabled}" data-page="${currentPage - 1}" ${prevDisabled}><i class="fas fa-chevron-left"></i></button>`;
  
  // 页码按钮
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  // 第一页
  if (startPage > 1) {
    html += `<button class="pagination-button" data-page="1">1</button>`;
    if (startPage > 2) {
      html += `<span class="pagination-ellipsis">...</span>`;
    }
  }
  
  // 页码
  for (let i = startPage; i <= endPage; i++) {
    const isActive = i === currentPage ? 'active' : '';
    html += `<button class="pagination-button ${isActive}" data-page="${i}">${i}</button>`;
  }
  
  // 最后一页
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      html += `<span class="pagination-ellipsis">...</span>`;
    }
    html += `<button class="pagination-button" data-page="${totalPages}">${totalPages}</button>`;
  }
  
  // 下一页按钮
  const nextDisabled = currentPage === totalPages ? 'disabled' : '';
  html += `<button class="pagination-button ${nextDisabled}" data-page="${currentPage + 1}" ${nextDisabled}><i class="fas fa-chevron-right"></i></button>`;
  
  html += '</div>';
  
  return html;
}

/**
 * 生成画廊项HTML
 * @param {Object} painting - 画作数据
 * @returns {string} 画廊项HTML
 */
function generateGalleryItemHTML(painting) {
  // 状态样式类
  let statusClass = '';
  switch (painting.status) {
    case '售卖中':
      statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      break;
    case '可定制':
      statusClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      break;
    case '已售出':
      statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      break;
    default:
      statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
  
  return `
    <div class="gallery-item group" data-id="${painting.id}">
      <div class="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
        <!-- 画作图片 -->
        <div class="aspect-[2/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img 
            src="${painting.imageUrl || painting.images?.thumbnail || ''}" 
            alt="${painting.title}" 
            class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          >
        </div>
        
        <!-- 画作信息 -->
        <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
          <h3 class="text-lg font-bold truncate">${painting.title}</h3>
          <p class="text-sm opacity-90">${painting.artist} · ${painting.year}</p>
        </div>
        
        <!-- 状态标签 -->
        <div class="absolute top-3 right-3">
          <span class="px-2 py-1 text-xs rounded-full ${statusClass}">${painting.status}</span>
        </div>
      </div>
    </div>
  `;
}

// 导出函数
export {
  loadPaintings,
  getYears,
  filterPaintings,
  paginatePaintings,
  generatePaginationHTML,
  generateGalleryItemHTML
};