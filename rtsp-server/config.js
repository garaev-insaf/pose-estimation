
module.exports = {
    rtspUrl: 'rtsp://admin:1q2w3e%21%21%21@192.168.0.10:554/Streaming/Channels/102',
    hlsOutputDir: __dirname + '/public/hls',
    clipsDir: __dirname + '/public/output_clips',
    segmentTime: 2, // seconds
    bufferLengthSec: 20,
    databasePath: __dirname + '/storage/db.sqlite'
};