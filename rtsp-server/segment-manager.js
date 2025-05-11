// segmentManager.js
const fs = require('fs');
const os = require('os');
const path = require('path');

const MAX_SEGMENTS = 30;  // Максимальное количество сегментов для хранения
const MAX_SEGMENT_AGE = 3600000;  // Максимальный возраст сегмента в миллисекундах (например, 1 час)
let segmentBuffer = [];  // Буфер для хранения сегментов

// Функция для добавления нового сегмента в буфер
function addSegmentToBuffer(segment) {
    segmentBuffer.push(segment);

    // Если количество сегментов в буфере превышает MAX_SEGMENTS, удаляем старый
    if (segmentBuffer.length > MAX_SEGMENTS) {
        const oldestSegment = segmentBuffer.shift();  // Удаляем первый элемент (старый сегмент)
        deleteSegmentFile(oldestSegment);  // Удаляем старый сегмент с диска
    }
}

// Функция для удаления сегмента с диска
function deleteSegmentFile(segment) {
    const segmentPath = segment.fullPath;

    fs.unlink(segmentPath, (err) => {
        if (err) {
            console.error(`Ошибка при удалении сегмента ${segmentPath}:`, err);
        } else {
            console.log(`Сегмент ${segmentPath} был удален.`);
        }
    });
}

// Функция для очистки старых сегментов по времени
function cleanOldSegments() {
    const currentTime = Date.now();

    segmentBuffer.forEach(segment => {
        if (currentTime - segment.timestamp > MAX_SEGMENT_AGE) {
            deleteSegmentFile(segment);  // Удаляем старый сегмент с диска
        }
    });

    // Очищаем сегменты, которые были удалены
    segmentBuffer = segmentBuffer.filter(segment => currentTime - segment.timestamp <= MAX_SEGMENT_AGE);
}

// Вызов очистки старых сегментов через интервал (например, каждую минуту)
setInterval(cleanOldSegments, 60000);  // Удаление старых сегментов каждую минуту

module.exports = {
    addSegmentToBuffer,
    cleanOldSegments,
    segmentBuffer
};