// hls-server.js
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const activeStreams = new Map();

function startHLSServer(cameraId, rtspUrl) {
    if (!cameraId || !rtspUrl) {
        console.error("❌ Ошибка: cameraId или rtspUrl не переданы!", { cameraId, rtspUrl });
        return { streamUrl: null };
    }

    if (activeStreams.has(cameraId)) {
        return { streamUrl: `/hls/${cameraId}/stream.m3u8` };
    }

    const outputDir = path.join(__dirname, `../public/hls/${cameraId}`);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const segmentName = path.join(outputDir, 'segment_%03d.ts');
    const m3u8Path = path.join(outputDir, 'stream.m3u8');

    const ffmpeg = spawn("ffmpeg", [
        "-fflags", "nobuffer",
        "-rtsp_transport", "tcp",
        "-i", rtspUrl,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-tune", "zerolatency",
        "-f", "hls",
        "-hls_time", "10",
        "-hls_list_size", "6",
        "-hls_flags", "delete_segments+append_list",
        "-hls_segment_filename", segmentName,
        m3u8Path
    ]);

    ffmpeg.stderr.on("data", (data) => {
        console.error(`[FFmpeg camera ${cameraId}]:`, data.toString());
    });

    ffmpeg.on("close", (code) => {
        console.log(`[FFmpeg camera ${cameraId}] завершён с кодом ${code}`);
        activeStreams.delete(cameraId);
    });

    activeStreams.set(cameraId, ffmpeg);

    return { process: ffmpeg, streamUrl: `/hls/${cameraId}/stream.m3u8` };
}

module.exports = { startHLSServer };