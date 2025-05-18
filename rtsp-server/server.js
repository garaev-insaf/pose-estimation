const express = require("express");
const cors = require("cors");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { spawn } = require("child_process");


const { startHLSServer, segmentBuffer } = require("./hls/hls-server");
const { startDetectionWorker } = require("./analyzer/detector");
const { addClip, getClips, getCameras, addCamera, getCameraById } = require("./storage/database");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use("/clips", express.static(path.join(__dirname, "public/output_clips")));
app.use("/hls", express.static(path.join(__dirname, "public/hls")));
app.use("/hls/:id", express.static(path.join(__dirname, "public/hls/*")));

// Запуск HLS трансляции (ffmpeg -> HLS .m3u8)
// startHLSServer();

// 🔍 Получение всех сохранённых клипов
app.get('/api/clips', async (req, res) => {
    try {
        const clips = await getClips();
        res.json(clips);
    } catch (err) {
        console.error("Ошибка при получении клипов:", err);
        res.status(500).json({ error: 'Ошибка при получении клипов' });
    }
});

app.get('/api/cameras', async (req, res) => {
    try {
        const cameras = await getCameras();
        res.json(cameras);
    } catch (err) {
        console.error("Ошибка при получении камер:", err);
        res.status(500).json({ error: 'Ошибка при получении камер' });
    }
});

async function recordClip() {
    try {
        // Метка времени в момент вызова сохранения клипа
        const now = Date.now();

        if (!segmentBuffer || segmentBuffer.length === 0) {
            throw new Error("segmentBuffer пуст или не инициализирован.");
        }

        // Фильтрация сегментов за ±10 секунд относительно метки времени вызова
        const clipSegments = segmentBuffer.filter(seg => {
            const diff = (seg.timestamp - now) / 1000; // Разница в секундах
            return diff >= -10 && diff <= 10; // За 10 секунд до и после
        });

        if (clipSegments.length === 0) {
            throw new Error("Нет сегментов для создания клипа.");
        }

        const clipId = Date.now();
        const outputDir = path.join(__dirname, 'public/output_clips');
        const outputFile = `clip-${clipId}.mp4`;
        const outputPath = path.join(outputDir, outputFile);

        // Создаём список файлов для ffmpeg
        const fileListPath = path.join(os.tmpdir(), `clip-files-${clipId}.txt`);
        const fileListContent = clipSegments.map(seg => `file '${seg.fullPath}'`).join('\n');
        fs.writeFileSync(fileListPath, fileListContent);

        // Конвертация сегментов в mp4
        const ffmpeg = spawn("ffmpeg", [
            "-f", "concat",
            "-safe", "0",
            "-i", fileListPath,
            "-c", "copy",
            outputPath
        ]);

        ffmpeg.stderr.on("data", (data) => {
            console.error("FFmpeg stderr:", data.toString());
        });

        ffmpeg.on("close", async (code) => {
            fs.unlinkSync(fileListPath);

            if (code !== 0) {
                console.error(`❌ FFmpeg завершился с кодом ${code}`);
                return;
            }

            console.log(`✅ Клип сохранён: ${outputPath}`);

            const clipData = {
                id: clipId,
                camera_id: 1,
                camera_name: 'Camera 1',
                template_name: 'Loitering',
                created_at: new Date().toISOString(),
                score: 0.95,
                clip_url: `http://localhost:4000/clips/${outputFile}`
            };

            try {
                await addClip(clipData);
                console.log("📦 Данные о клипе добавлены в базу");
            } catch (err) {
                console.error("❌ Ошибка при добавлении в базу:", err);
            }
        });
    } catch (err) {
        console.error("❌ Ошибка в recordClip():", err);
        throw err;
    }
}

// ⚙️ Пункт проверки сервера
app.get("/", (req, res) => {
    res.send("HLS Pose Detection Backend Running.");
});

// 📡 Вызов записи клипа вручную
app.get("/api/record-clip", async (_, res) => {
    try {
        await recordClip();
        res.status(200).json({ message: 'Clip recording started' });
    } catch (err) {
        res.status(500).json({ error: 'Error recording clip' });
    }
});

// 📡 Вызов добавления камеры
app.post("/api/cameras", async (req, res) => {
    try {
        console.log(req.body.body)
        await addCamera(req.body.body);
        res.status(200).json({ message: 'Camera added' });
    } catch (err) {
        console.error('❌ Ошибка при добавлении камеры:', err);
        res.status(500).json({ error: 'Error adding camera', details: err.message });
    }
});


app.get("/api/stream/:cameraId", async (req, res) => {
    const { cameraId } = req.params;

    try {

        const camera = await getCameraById(cameraId);

        console.log(camera);

        if (!camera) {
            return res.status(404).json({ error: "Камера не найдена" });
        }

        const { source } = camera;

        const { streamUrl } = startHLSServer(cameraId, source);
        res.json(streamUrl); // например: /hls/1/stream.m3u8
    } catch (err) {
        console.error("Ошибка при запуске потока:", err);
        res.status(500).json({ error: "Ошибка при запуске потока" });
    }
});

// 🧠 Запуск анализатора (опционально)
// startDetectionWorker();

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});