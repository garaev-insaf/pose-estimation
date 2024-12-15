import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

const App: React.FC = () => {
	const webcamRef = useRef<Webcam>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
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
		if (
			webcamRef.current &&
			webcamRef.current.video &&
			webcamRef.current.video.readyState === 4 &&
			detector
		) {
			const video = webcamRef.current.video as HTMLVideoElement;
			const poses = await detector.estimatePoses(video);

			drawCanvas(poses, video);

			// Example: Log poses keypoints (use these for deviant behavior analysis)
			if (poses.length > 0) {
				console.log(poses);
			}
		}
	}, [detector]);

	// Draw poses on canvas
	const drawCanvas = (poses: poseDetection.Pose[], video: HTMLVideoElement) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw video frame on canvas
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

		poses.forEach((pose) => {
			pose.keypoints.forEach((keypoint) => {
				if (keypoint.score && keypoint.score > 0.5) {
					const { x, y } = keypoint;
					ctx.beginPath();
					ctx.arc(x, y, 5, 0, 2 * Math.PI);
					ctx.fillStyle = "red";
					ctx.fill();
				}
			});

			// Draw skeleton
			const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(
				poseDetection.SupportedModels.MoveNet
			);
			adjacentKeyPoints.forEach(([start, end]) => {
				const kp1 = pose.keypoints[start];
				const kp2 = pose.keypoints[end];

				if (kp1.score && kp1.score > 0.5 && kp2.score && kp2.score > 0.5) {
					ctx.beginPath();
					ctx.moveTo(kp1.x, kp1.y);
					ctx.lineTo(kp2.x, kp2.y);
					ctx.strokeStyle = "blue";
					ctx.lineWidth = 2;
					ctx.stroke();
				}
			});
		});
	};

	// Continuously detect poses
	useEffect(() => {
		const interval = setInterval(() => {
			detect();
		}, 100);

		return () => clearInterval(interval);
	}, [detect, detector]);

	return (
		<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
			<h1>Deviant Behavior Detection</h1>
			<Webcam
				ref={webcamRef}
				style={{
					position: "absolute",
					marginLeft: "auto",
					marginRight: "auto",
					left: 0,
					right: 0,
					textAlign: "center",
					zIndex: 9,
					width: 640,
					height: 480,
				}}
			/>
			<canvas
				ref={canvasRef}
				style={{
					position: "absolute",
					marginLeft: "auto",
					marginRight: "auto",
					left: 0,
					right: 0,
					textAlign: "center",
					zIndex: 9,
					width: 640,
					height: 480,
				}}
			/>
		</div>
	);
};

export default App;
