import { getGalleryStats, validatePaintingsData } from './utils/galleryStats.js';
import fs from 'fs';
import path from 'path';

// 主函数
async function main() {
    try {
        // 读取paintings.json
        const paintingsData = JSON.parse(
            await fs.promises.readFile(
                path.join(process.cwd(), 'data', 'paintings.json'),
                'utf8'
            )
        );

        // 获取画廊统计信息
        const galleryPath = path.join(process.cwd(), 'images', 'gallery');
        const stats = await getGalleryStats(galleryPath);

        if (!stats) {
            console.error('获取画廊统计信息失败');
            return;
        }

        // 输出年度统计信息
        console.log('\n画廊年度统计:');
        Object.entries(stats.yearStats).sort().forEach(([year, count]) => {
            console.log(`${year}年: ${count}幅画作`);
        });
        console.log(`\n总计: ${stats.totalImages}幅画作`);

        // 验证数据完整性
        const validation = validatePaintingsData(stats, paintingsData.paintings);
        
        console.log('\n数据验证结果:');
        console.log(`paintings.json中记录: ${validation.totalInJson}幅`);
        console.log(`画廊目录中实际: ${validation.totalInGallery}幅`);

        if (validation.missingInGallery.length > 0) {
            console.log('\nJSON中记录但画廊中不存在的图片:');
            validation.missingInGallery.forEach(path => console.log(path));
        }

        if (validation.missingInJson.length > 0) {
            console.log('\n画廊中存在但未在JSON中记录的图片:');
            validation.missingInJson.forEach(path => console.log(path));
        }

    } catch (error) {
        console.error('程序执行失败:', error);
    }
}

// 执行主函数
main();