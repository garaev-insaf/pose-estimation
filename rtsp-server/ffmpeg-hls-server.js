const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const outputDir = path.join(__dirname, 'hls');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const rtspUrl = 'rtsp://admin:1q2w3e%21%21%21@192.168.0.10:554/Streaming/Channels/102';

const ffmpeg = spawn('ffmpeg', [
    '-rtsp_transport', 'tcp',
    '-i', rtspUrl,
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-tune', 'zerolatency',
    '-f', 'hls',
    '-hls_time', '2',
    '-hls_list_size', '20', // 20 * 2s = 40s буфера
    '-hls_flags', 'delete_segments+append_list',
    '-hls_segment_filename', path.join(outputDir, 'segment_%03d.ts'),
    path.join(outputDir, 'stream.m3u8')
]);

ffmpeg.stderr.on('data', (data) => {
    console.error(data.toString());
});