import fs from 'fs';
import path from 'path';

/**
 * 从文件名中解析画作信息
 * @param {string} filename - 图片文件名
 * @returns {Object} 解析出的画作信息
 */
function parseImageInfo(filename) {
    // 移除文件扩展名
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    // 分割标题和尺寸
    const parts = nameWithoutExt.split('_');
    const title = parts[0];
    const dimensions = parts[1] ? parts[1].replace('x', 'x') + 'cm' : '';

    return {
        title,
        dimensions
    };
}

/**
 * 更新paintings.json文件
 */
async function updatePaintingsJson() {
    try {
        const galleryPath = path.join(process.cwd(), 'images', 'gallery');
        const paintingsJsonPath = path.join(process.cwd(), 'data', 'paintings.json');
        
        // 读取现有的paintings.json
        let paintingsData = { paintings: [] };
        try {
            const existingData = await fs.promises.readFile(paintingsJsonPath, 'utf8');
            paintingsData = JSON.parse(existingData);
        } catch (error) {
            console.log('未找到现有的paintings.json或解析失败，将创建新文件');
        }

        // 获取所有年份目录
        const years = await fs.promises.readdir(galleryPath);
        const newPaintings = [];
        let currentId = 1;

        // 遍历每个年份目录
        for (const year of years.sort()) {
            // 跳过隐藏文件和非目录
            if (year.startsWith('.') || !fs.statSync(path.join(galleryPath, year)).isDirectory()) {
                continue;
            }

            const yearPath = path.join(galleryPath, year);
            const files = await fs.promises.readdir(yearPath);
            
            // 过滤出图片文件
            const images = files.filter(file => 
                /\.(jpg|jpeg|png|gif)$/i.test(file) && !file.startsWith('.')
            );

            // 处理每个图片
            for (const image of images) {
                const imageInfo = parseImageInfo(image);
                const imageUrl = `/images/gallery/${year}/${image}`;

                // 检查是否已存在相同URL的记录
                const existingPainting = paintingsData.paintings.find(p => p.imageUrl === imageUrl);

                if (existingPainting) {
                    // 保留现有记录，但更新必要信息
                    newPaintings.push({
                        ...existingPainting,
                        year,
                        title: imageInfo.title,
                        dimensions: imageInfo.dimensions || existingPainting.dimensions
                    });
                } else {
                    // 创建新记录
                    newPaintings.push({
                        id: String(currentId++),
                        title: imageInfo.title,
                        imageUrl: imageUrl,
                        status: '可定制',
                        year: year,
                        dimensions: imageInfo.dimensions,
                        description: `${imageInfo.title}的故事...`,
                        artist: '贝军',
                        images: {
                            thumbnail: imageUrl,
                            large: imageUrl
                        },
                        statusClass: 'blue'
                    });
                }
            }
        }

        // 按年份降序和ID排序
        newPaintings.sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year;
            return b.id - a.id;
        });

        // 重新分配ID
        newPaintings.forEach((painting, index) => {
            painting.id = String(index + 1);
        });

        // 写入更新后的数据
        const updatedData = { paintings: newPaintings };
        await fs.promises.writeFile(
            paintingsJsonPath,
            JSON.stringify(updatedData, null, 2),
            'utf8'
        );

        console.log('paintings.json更新完成');
        console.log(`总计更新${newPaintings.length}幅画作`);

    } catch (error) {
        console.error('更新paintings.json失败:', error);
    }
}

// 执行更新
updatePaintingsJson();