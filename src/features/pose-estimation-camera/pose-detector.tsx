import React, { useRef, useEffect, useState, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import Hls from "hls.js";

interface ICameraCanvasProps {
	drawCanvas: (poses: poseDetection.Pose[], canvas: HTMLVideoElement) => void;
	videoSource: string; // Новый пропс для источника видео
}

export const PoseDetector: React.FC<ICameraCanvasProps> = ({ drawCanvas, videoSource }) => {
	const [isCanPlayState, setIsCanPlayState] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null);

	// Initialize TensorFlow backend
	useEffect(() => {
		const initializeBackend = async () => {
			await tf.setBackend("webgl");
			await tf.ready();
		};

		initializeBackend();
	}, []);

	// Load Pose Detection Model
	useEffect(() => {
		const loadModel = async () => {
			const detectorConfig: poseDetection.MoveNetModelConfig = {
				modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
			};
			const loadedDetector = await poseDetection.createDetector(
				poseDetection.SupportedModels.MoveNet,
				detectorConfig
			);
			setDetector(loadedDetector);
		};

		loadModel();
	}, []);

	// Analyze video stream
	const detect = useCallback(async () => {
		console.log(videoRef.current?.readyState);

		if (videoRef.current && videoRef.current.readyState === 4 && detector) {
			const video = videoRef.current;
			const poses = await detector.estimatePoses(video);
			console.log(poses);
			drawCanvas(poses, video);
		}
	}, [detector, drawCanvas]);

	// Continuously detect poses
	useEffect(() => {
		if (!isCanPlayState) return;

		const interval = setInterval(() => {
			detect();
		}, 100);

		return () => clearInterval(interval);
	}, [detect, isCanPlayState]);

	React.useEffect(() => {
		if (!videoRef.current) return;

		if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(videoSource);
			hls.attachMedia(videoRef.current);
			hls.on(Hls.Events.MANIFEST_PARSED, function () {
				console.log("Manifest parsed, video is ready");
			});
			hls.on(Hls.Events.ERROR, function (_, data) {
				console.error("Error during playback:", data);
			});
		} else {
			console.error("HLS is not supported in this browser");
		}
	}, [videoSource]);

	return (
		<video
			ref={videoRef}
			autoPlay
			playsInline
			crossOrigin="anonymous"
			muted
			onCanPlay={() => setIsCanPlayState(true)}
			width="100%"
			src={videoSource}
			height="100%"
		/>
	);
};
