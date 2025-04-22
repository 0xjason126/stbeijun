// 加载首页精选画作数据
async function loadFeaturedPaintings() {
  try {
    const response = await fetch('../data/featured.json');
    const data = await response.json();
    return data.featured;
  } catch (error) {
    console.error('Error loading featured paintings:', error);
    return [];
  }
}

// 渲染画作卡片
function renderPaintingCard(painting) {
  return `
    <div class="group relative bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 painting-card" data-id="${painting.id}">
      <div class="aspect-[2/3] overflow-hidden">
        <img src="${painting.imageUrl}" 
             alt="${painting.title}" 
             class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500">
      </div>
      <div class="p-5">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-xl font-bold">${painting.title}</h3>
          <span class="px-2 py-1 bg-${painting.statusClass}-100 dark:bg-${painting.statusClass}-900/30 text-${painting.statusClass}-800 dark:text-${painting.statusClass}-300 text-xs rounded-full">${painting.status}</span>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">创作时间: ${painting.year}</p>
        <p class="text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-1">${painting.description}</p>
      </div>
    </div>
  `;
}

// 初始化首页画作展示
async function initFeaturedPaintings() {
  const paintings = await loadFeaturedPaintings();
  const container = document.querySelector('.grid.grid-cols-1');
  
  if (container && paintings.length > 0) {
    container.innerHTML = paintings.map(renderPaintingCard).join('');
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initFeaturedPaintings);