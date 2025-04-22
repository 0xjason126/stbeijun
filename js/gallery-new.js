/**
 * 画廊页面主脚本 - 重构版
 * 使用简化的加载器实现画作展示、筛选和搜索功能
 */

// 导入画廊加载器函数
import {
  loadPaintings,
  getYears,
  filterPaintings,
  paginatePaintings,
  generatePaginationHTML,
  generateGalleryItemHTML
} from './galleryLoader.js';

// 全局变量
let allPaintings = []; // 存储所有画作数据
let currentPage = 1;
let itemsPerPage = 12; // 每页显示12个作品
let currentFilters = {
  year: '',
  status: '',
  search: ''
};

// DOM元素
const galleryContainer = document.getElementById('gallery-container');
const noResultsElement = document.getElementById('no-results');
const paginationContainer = document.getElementById('pagination-container');
const loadingIndicator = document.createElement('div');

// 筛选元素
const yearFilter = document.getElementById('year-filter');
const statusFilter = document.getElementById('status-filter');
const searchInput = document.getElementById('search-input');

// 模态框元素
const paintingModal = document.getElementById('painting-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const closeModalButton = document.getElementById('close-modal');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalArtist = document.getElementById('modal-artist');
const modalYear = document.getElementById('modal-year');
const modalDimensions = document.getElementById('modal-dimensions');
const modalDescription = document.getElementById('modal-description');
const modalStatus = document.getElementById('modal-status');

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', init);

/**
 * 初始化页面
 */
async function init() {
  setupLoadingIndicator();
  showLoading();
  
  try {
    // 加载所有画作数据
    allPaintings = await loadPaintings();
    
    // 填充年份筛选器
    populateYearFilter(allPaintings);
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 应用URL参数（如果有）
    applyUrlParams();
    
    // 渲染画廊
    renderGallery();
  } catch (error) {
    console.error('初始化失败:', error);
    showError('加载数据失败', '请检查网络连接后重试');
  } finally {
    hideLoading();
  }
}

/**
 * 设置加载指示器
 */
function setupLoadingIndicator() {
  loadingIndicator.className = 'fixed inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-30';
  loadingIndicator.innerHTML = `
    <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent-light dark:border-accent-dark border-t-transparent"></div>
    <p class="mt-4 text-gray-600 dark:text-gray-300">正在加载画作...</p>
  `;
}

/**
 * 显示加载指示器
 */
function showLoading() {
  galleryContainer.innerHTML = '';
  noResultsElement.classList.add('hidden');
  document.body.appendChild(loadingIndicator);
}

/**
 * 隐藏加载指示器
 */
function hideLoading() {
  if (loadingIndicator.parentNode) {
    loadingIndicator.parentNode.removeChild(loadingIndicator);
  }
}

/**
 * 显示错误信息
 * @param {string} title - 错误标题
 * @param {string} message - 错误信息
 */
function showError(title, message) {
  noResultsElement.innerHTML = `
    <i class="fas fa-exclamation-circle text-4xl text-red-500 dark:text-red-400 mb-4"></i>
    <h3 class="text-xl font-bold mb-2">${title}</h3>
    <p class="text-gray-500 dark:text-gray-400">${message}</p>
  `;
  noResultsElement.classList.remove('hidden');
  hideLoading();
}

/**
 * 填充年份筛选器
 * @param {Array} paintings - 画作数据
 */
function populateYearFilter(paintings) {
  const years = getYears(paintings);
  
  // 清空现有选项
  yearFilter.innerHTML = '<option value="">全部年份</option>';
  
  // 填充年份选项
  years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });
}

/**
 * 绑定事件监听器
 */
function bindEventListeners() {
  // 筛选器变化事件
  yearFilter.addEventListener('change', handleFilterChange);
  statusFilter.addEventListener('change', handleFilterChange);
  
  // 搜索输入事件
  searchInput.addEventListener('input', debounce(handleFilterChange, 300));
  
  // 模态框关闭事件
  closeModalButton.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  
  // 阻止模态框内容点击事件冒泡
  const modalContent = paintingModal.querySelector('.relative.bg-white, .relative.dark\\:bg-gray-900');
  if (modalContent) {
    modalContent.addEventListener('click', e => {
      e.stopPropagation();
    });
  }

  // 画廊项点击事件
  galleryContainer.addEventListener('click', handleGalleryItemClick);
  
  // 分页容器点击事件
  paginationContainer.addEventListener('click', handlePaginationClick);
}

/**
 * 处理筛选器变化
 */
function handleFilterChange() {
  // 更新筛选条件
  currentFilters = {
    year: yearFilter.value,
    status: statusFilter.value,
    search: searchInput.value.trim()
  };
  
  // 重置页码
  currentPage = 1;
  
  // 更新URL参数
  updateUrlParams();
  
  // 重新渲染画廊
  renderGallery();
}

/**
 * 处理分页点击
 * @param {Event} e - 点击事件
 */
function handlePaginationClick(e) {
  const button = e.target.closest('.pagination-button');
  if (!button || button.classList.contains('disabled') || button.classList.contains('active')) {
    return;
  }
  
  const page = parseInt(button.dataset.page, 10);
  if (isNaN(page)) {
    return;
  }
  
  currentPage = page;
  updateUrlParams();
  renderGallery();
  
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 处理画廊项点击
 * @param {Event} e - 点击事件
 */
function handleGalleryItemClick(e) {
  const galleryItem = e.target.closest('.gallery-item');
  if (!galleryItem) {
    return;
  }
  
  const paintingId = galleryItem.dataset.id;
  const painting = allPaintings.find(p => p.id === paintingId);
  
  if (painting) {
    openModal(painting);
  }
}

/**
 * 打开模态框
 * @param {Object} painting - 画作数据
 */
function openModal(painting) {
  // 设置模态框内容
  modalImage.src = painting.imageUrl || painting.images?.large || '';
  modalImage.alt = painting.title;
  modalTitle.textContent = painting.title;
  modalArtist.textContent = painting.artist;
  modalYear.textContent = painting.year;
  modalDimensions.textContent = painting.dimensions;
  modalDescription.textContent = painting.description;
  
  // 设置状态标签样式
  let statusClass;
  switch (painting.statusClass) {
    case 'green':
      statusClass = 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      break;
    case 'red':
      statusClass = 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      break;
    default:
      statusClass = 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
  }
  
  modalStatus.className = `px-2 py-1 text-xs rounded-full ${statusClass}`;
  modalStatus.textContent = painting.status;
  
  // 显示模态框
  paintingModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

/**
 * 关闭模态框
 */
function closeModal() {
  paintingModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
  
  // 清空图片源，避免内存泄漏
  setTimeout(() => {
    modalImage.src = '';
  }, 300);
}

/**
 * 渲染画廊
 */
function renderGallery() {
  showLoading();
  
  // 筛选画作
  const filtered = filterPaintings(allPaintings, currentFilters);
  
  // 如果没有结果，显示提示
  if (filtered.length === 0) {
    galleryContainer.innerHTML = '';
    noResultsElement.classList.remove('hidden');
    paginationContainer.innerHTML = '';
    hideLoading();
    return;
  }
  
  // 分页处理
  const { paintings, pagination } = paginatePaintings(filtered, currentPage, itemsPerPage);
  
  // 渲染画廊项
  let galleryHTML = '';
  paintings.forEach(painting => {
    galleryHTML += generateGalleryItemHTML(painting);
  });
  
  galleryContainer.innerHTML = galleryHTML;
  noResultsElement.classList.add('hidden');
  
  // 渲染分页
  paginationContainer.innerHTML = generatePaginationHTML(pagination);
  
  // 隐藏加载动画
  hideLoading();
}

/**
 * 应用URL参数
 */
function applyUrlParams() {
  const params = new URLSearchParams(window.location.search);
  
  // 应用筛选条件
  const year = params.get('year');
  const status = params.get('status');
  const search = params.get('search');
  const page = parseInt(params.get('page'), 10);
  
  if (year) {
    yearFilter.value = year;
    currentFilters.year = year;
  }
  
  if (status) {
    statusFilter.value = status;
    currentFilters.status = status;
  }
  
  if (search) {
    searchInput.value = search;
    currentFilters.search = search;
  }
  
  if (!isNaN(page) && page > 0) {
    currentPage = page;
  }
}

/**
 * 更新URL参数
 */
function updateUrlParams() {
  const params = new URLSearchParams();
  
  if (currentFilters.year) {
    params.set('year', currentFilters.year);
  }
  
  if (currentFilters.status) {
    params.set('status', currentFilters.status);
  }
  
  if (currentFilters.search) {
    params.set('search', currentFilters.search);
  }
  
  if (currentPage > 1) {
    params.set('page', currentPage.toString());
  }
  
  // 更新URL，不刷新页面
  const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  window.history.pushState({ path: newUrl }, '', newUrl);
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}