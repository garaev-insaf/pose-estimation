const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors());

// Живой RTSP-поток в MP4 через FFmpeg
app.get('/stream.mp4', (req, res) => {
    const rtspUrl = 'rtsp://admin:1q2w3e%21%21%21@192.168.0.10:554/Streaming/Channels/102';

    const ffmpeg = spawn('ffmpeg', [
        '-fflags', 'nobuffer',
        '-rtsp_transport', 'tcp', // Лучше tcp, особенно в локальной сети
        '-i', rtspUrl,
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-tune', 'zerolatency',
        '-f', 'mp4',
        '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
        '-an',
        'pipe:1'
    ]);

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Cache-Control', 'no-cache');

    ffmpeg.stdout.pipe(res);

    ffmpeg.stderr.on('data', (data) => {
        console.error('FFmpeg stderr:', data.toString());
    });

    req.on('close', () => {
        ffmpeg.kill('SIGINT');
    });
});

app.listen(4000, () => {
    console.log('🚀 MP4 stream available at http://localhost:4000/stream.mp4');
});