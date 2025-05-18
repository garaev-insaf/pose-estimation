const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { addClip } = require('./database');

async function saveClipFromSegments({ cameraId, cameraName, templateName, startTimestamp, endTimestamp, segmentBuffer }) {
    const clipId = Date.now();
    const outputDir = path.join(__dirname, '../public/output_clips', `${clipId}`);
    const tempDir = path.join(outputDir, 'tmp');
    const concatFile = path.join(tempDir, 'concat.txt');
    const outputFilePath = path.join(outputDir, 'clip.mp4');

    fs.mkdirSync(tempDir, { recursive: true });

    const selectedSegments = segmentBuffer.filter(seg =>
        seg.timestamp >= startTimestamp && seg.timestamp <= endTimestamp
    );

    if (selectedSegments.length === 0) {
        console.error('❌ Нет подходящих сегментов для записи клипа.');
        return;
    }

    // Копируем .ts файлы и создаем concat.txt
    const concatLines = [];
    for (let i = 0; i < selectedSegments.length; i++) {
        const seg = selectedSegments[i];
        const dest = path.join(tempDir, `seg_${i}.ts`);
        fs.copyFileSync(seg.fullPath, dest);
        concatLines.push(`file '${dest}'`);
    }
    fs.writeFileSync(concatFile, concatLines.join('\n'));

    // FFmpeg склеивание
    const ffmpeg = spawn('ffmpeg', [
        '-f', 'concat',
        '-safe', '0',
        '-i', concatFile,
        '-c', 'copy',
        outputFilePath
    ]);

    ffmpeg.stderr.on('data', data => {
        console.error('[FFmpeg]', data.toString());
    });

    ffmpeg.on('close', async (code) => {
        if (code === 0) {
            console.log(`✅ Клип сохранён: ${outputFilePath}`);
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
                console.log(`✅ Данные о клипе добавлены в базу.`);
            } catch (err) {
                console.error('❌ Ошибка при добавлении в базу:', err);
            }
        } else {
            console.error(`❌ FFmpeg завершился с кодом ${code}`);
        }
    });
}

module.exports = { saveClipFromSegments };