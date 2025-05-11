// hls-server.js
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Параметры
const RTSP_URL = "rtsp://admin:1q2w3e%21%21%21@192.168.0.7:554/Streaming/Channels/102";
const OUTPUT_DIR = path.join(__dirname, "../public/hls");
const HLS_SEGMENT_DURATION = 10; // 10 секунд
const HLS_SEGMENT_COUNT = 6; // храним последние 6 сегментов (1 минута)
const MAX_SEGMENTS_TO_KEEP = 12; // буфер с запасом (удаляем всё, что старше 12)

// Создаём директорию при необходимости
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const segmentBuffer = [];

function cleanupOldSegments() {
    const files = fs.readdirSync(OUTPUT_DIR)
        .filter(f => f.endsWith(".ts"))
        .sort(); // сегменты сортируются по имени (segment_001.ts, segment_002.ts, ...)

    if (files.length > MAX_SEGMENTS_TO_KEEP) {
        const toDelete = files.slice(0, files.length - MAX_SEGMENTS_TO_KEEP);
        toDelete.forEach(file => {
            fs.unlinkSync(path.join(OUTPUT_DIR, file));
            console.log(`🗑 Удалён старый сегмент: ${file}`);
        });

        // Удаляем сегменты из буфера
        segmentBuffer.splice(0, toDelete.length);
    }
}

function startHLSServer() {
    // Очистка при старте
    fs.readdirSync(OUTPUT_DIR).forEach(file => fs.unlinkSync(path.join(OUTPUT_DIR, file)));

    // ffmpeg трансляция RTSP → HLS
    const ffmpeg = spawn("ffmpeg", [
        "-fflags", "nobuffer",
        "-rtsp_transport", "tcp",
        "-i", RTSP_URL,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-tune", "zerolatency",
        "-f", "hls",
        "-hls_time", HLS_SEGMENT_DURATION.toString(),
        "-hls_list_size", HLS_SEGMENT_COUNT.toString(),
        "-hls_flags", "delete_segments+append_list",
        "-hls_segment_filename", path.join(OUTPUT_DIR, "segment_%03d.ts"),
        path.join(OUTPUT_DIR, "stream.m3u8")
    ]);

    ffmpeg.stderr.on("data", (data) => {
        console.error("FFmpeg stderr:", data.toString());
    });

    ffmpeg.on("close", (code) => {
        if (code !== 0) {
            console.log(`FFmpeg process exited with code ${code}`);
        }
    });

    // Запускаем периодическую очистку старых .ts файлов
    setInterval(cleanupOldSegments, 10_000); // каждые 10 секунд

    console.log("📡 HLS сервер запущен, RTSP трансляция идёт...");
}

// Наблюдение за директорией для добавления сегментов в буфер
function watchHlsFolder() {
    fs.watch(OUTPUT_DIR, (eventType, filename) => {
        if (filename && filename.endsWith('.ts') && eventType === 'rename') {
            const fullPath = path.join(OUTPUT_DIR, filename);

            // Добавляем новый сегмент в буфер
            segmentBuffer.push({
                filename,
                timestamp: Date.now(),
                fullPath
            });

            // Храним только последние 20 сегментов (например, 200 секунд при 10с каждом)
            while (segmentBuffer.length > 20) {
                segmentBuffer.shift();
            }
        }
    });
}

watchHlsFolder();

module.exports = { startHLSServer, segmentBuffer };