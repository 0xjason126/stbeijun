/**
 * 首页脚本
 * 实现精选画作点击弹出详情模态框功能
 */

document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const paintingCards = document.querySelectorAll('.painting-card');

    // 导入并加载精选画作数据
    let featuredPaintings = [];
    
    // 加载精选画作数据
    async function loadFeaturedPaintings() {
        const response = await fetch('./data/featured.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.featured;
    }

    // 初始化精选画作数据
    async function initFeaturedPaintings() {
        try {
            featuredPaintings = await loadFeaturedPaintings();
            // 更新画作卡片显示
            updatePaintingCards();
        } catch (error) {
            console.error('加载精选画作失败:', error);
        }
    }

    // 更新画作卡片显示
    function updatePaintingCards() {
        paintingCards.forEach((card, index) => {
            const painting = featuredPaintings[index];
            if (painting) {
                // 设置画作ID
                card.setAttribute('data-id', painting.id);
                // 更新卡片图片
                const cardImage = card.querySelector('img');
                if (cardImage) {
                    cardImage.src = painting.imageUrl;
                    cardImage.alt = painting.title;
                }
                // 更新卡片标题
                const cardTitle = card.querySelector('.painting-title');
                if (cardTitle) {
                    cardTitle.textContent = painting.title;
                }
                // 更新卡片状态
                const cardStatus = card.querySelector('.painting-status');
                if (cardStatus) {
                    cardStatus.textContent = painting.status;
                    // 根据状态更新样式
                    cardStatus.className = `px-2 py-1 text-xs rounded-full ${
                        painting.statusClass === 'green' ? 
                        'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    }`;
                }
                // 更新年份
                const cardYear = card.querySelector('.painting-year');
                if (cardYear) {
                    cardYear.textContent = `创作时间: ${painting.year}`;
                }
                // 更新描述
                const cardDescription = card.querySelector('.painting-description');
                if (cardDescription) {
                    cardDescription.textContent = painting.description;
                }
            }
        });
    }

    // 初始化精选画作
    initFeaturedPaintings();


        }
      ]
    }
  }
}
```
});