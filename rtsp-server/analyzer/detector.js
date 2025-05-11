// analyzer/detector.js

const { spawn } = require("child_process");
const { writeClip } = require("../storage/clip-writer");
const { insertDetection } = require("../storage/database");
const tf = require("@tensorflow/tfjs");
const poseDetection = require("@tensorflow-models/pose-detection");
const fs = require("fs");
const path = require("path");

let detector;

// Инициализация TensorFlow и модели детекции поз
async function initializePoseDetector() {
    const model = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
        modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
    });
    detector = model;
}

// Функция для обработки видеопотока и определения девиантного поведения
async function analyzePose(frame) {
    const poses = await detector.estimatePoses(frame);
    // Проверка на девиантное поведение
    const isDeviant = poses.some(pose => checkForDeviantBehavior(pose));
    if (isDeviant) {
        // Запись клипа в случае обнаружения девиации
        const clipData = await writeClip();
        insertDetection(clipData); // Запись данных в базу
        console.log(`Deviant behavior detected! Clip saved at: ${clipData.clip_url}`);
    }
}

// Функция проверки на девиантное поведение (можно доработать)
function checkForDeviantBehavior(pose) {
    // Пример простой проверки
    return pose.keypoints.some(keypoint => keypoint.score > 0.5 && keypoint.part === "leftKnee");
}

// Функция для запуска фонового процесса
async function startDetectionWorker() {
    console.log("Starting Pose Detection Worker...");
    await initializePoseDetector();

    // Здесь должен быть ваш код для захвата видеопотока
    // Например, с использованием RTSP и ffmpeg, или загрузки кадров

    // Пример обработчика для каждого кадра
    setInterval(() => {
        // Здесь мы просто имитируем обработку кадра
        const dummyFrame = {}; // В реальности сюда передавать кадры с камеры
        analyzePose(dummyFrame);
    }, 1000); // Интервал в 1 секунду
}

module.exports = { startDetectionWorker };