// storage/clip-writer.js

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { addClip } = require('./database'); // Импорт функции напрямую

// Функция для записи клипа в папку и базу данных
async function saveClip(cameraId, cameraName, templateName, startTime, endTime, rtspUrl) {
    const clipId = Date.now(); // Используем метку времени как уникальный ID
    const outputDir = path.join(__dirname, '../public/output_clips', `${clipId}`);
    const outputFilePath = path.join(outputDir, 'clip.mp4');

    // Создание директории
    fs.mkdirSync(outputDir, { recursive: true });

    console.log(`[FFmpeg] Старт записи клипа: ${startTime} - ${endTime}`);

    const ffmpeg = spawn('ffmpeg', [
        '-i', rtspUrl,
        '-ss', startTime,
        '-to', endTime,
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-tune', 'zerolatency',
        '-f', 'mp4',
        outputFilePath
    ]);

    ffmpeg.stderr.on('data', (data) => {
        console.error('[FFmpeg]', data.toString());
    });

    ffmpeg.on('close', async (code) => {
        if (code === 0) {
            console.log(`✅ Клип сохранен: ${outputFilePath}`);

            const clipData = {
                id: clipId,
                camera_id: cameraId,
                camera_name: cameraName,
                template_name: templateName,
                created_at: new Date().toISOString(),
                score: 0.85,
                clip_url: `/output_clips/${clipId}/clip.mp4`
            };

            try {
                await addClip(clipData);
                console.log(`✅ Данные о клипе ${clipId} добавлены в базу.`);
            } catch (err) {
                console.error('❌ Ошибка при добавлении в базу:', err);
            }
        } else {
            console.error(`❌ FFmpeg завершился с кодом ${code}`);
        }
    });
}

module.exports = { saveClip };