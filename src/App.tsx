import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import { isDeviantBehavior, isFallingBehavior } from "./utils/is-deviant-behavior";

const COEF_SCORE = 0.4;

const App: React.FC = () => {
	const webcamRef = useRef<Webcam>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null);
	const [previousPose, setPreviousPose] = useState<poseDetection.Pose | null>(null);
	const [lastFrameTime, setLastFrameTime] = useState<number | null>(null);
	const [logs, setLogs] = useState<string[]>([]); // State to store logs

	// Initialize TensorFlow backend
	useEffect(() => {
		const initializeBackend = async () => {
			await tf.setBackend("webgl");
			await tf.ready();
		};

		initializeBackend();
	}, []);

	// Add log entry
	const addLog = useCallback((message: string) => {
		const timestamp = new Date().toLocaleTimeString();
		setLogs((prevLogs) => [...prevLogs, `[${timestamp}] ${message}`]);
	}, []);

	// List of behavior checkers
	const behaviorCheckers = useMemo(
		() => [
			{
				check: isDeviantBehavior,
				message: "Обнаружено девиатное поведение",
			},
			{
				check: (currentPose: poseDetection.Pose) =>
					previousPose && lastFrameTime
						? isFallingBehavior(previousPose, currentPose, performance.now() - lastFrameTime)
						: false,
				message: "Обнаружено девиантное поведение",
			},
		],
		[previousPose, lastFrameTime]
	);

	// Draw poses on canvas
	const drawCanvas = useCallback(
		(poses: poseDetection.Pose[], video: HTMLVideoElement) => {
			const canvas = canvasRef.current;
			if (!canvas) return;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw video frame on canvas
			ctx.save();
			ctx.scale(-1, 1); // Mirror the video horizontally
			ctx.translate(-canvas.width, 0);
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			ctx.restore();

			poses.forEach((pose) => {
				let isDeviant = false;

				// Check all behavior patterns
				behaviorCheckers.forEach(({ check, message }) => {
					if (check(pose)) {
						isDeviant = true;
						addLog(message);
					}
				});

				// Set color based on deviant behavior
				const skeletonColor = isDeviant ? "red" : "blue";

				pose.keypoints.forEach((keypoint) => {
					if (keypoint.score && keypoint.score > COEF_SCORE) {
						// Mirror the x-coordinate of the keypoint
						const mirroredX = canvas.width - keypoint.x;
						const { y } = keypoint;
						ctx.beginPath();
						ctx.arc(mirroredX, y, 5, 0, 2 * Math.PI);
						ctx.fillStyle = skeletonColor;
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

					if (kp1.score && kp1.score > COEF_SCORE && kp2.score && kp2.score > COEF_SCORE) {
						const mirroredX1 = canvas.width - kp1.x;
						const mirroredX2 = canvas.width - kp2.x;
						ctx.beginPath();
						ctx.moveTo(mirroredX1, kp1.y);
						ctx.lineTo(mirroredX2, kp2.y);
						ctx.strokeStyle = skeletonColor;
						ctx.lineWidth = 2;
						ctx.stroke();
					}
				});
			});
		},
		[behaviorCheckers, addLog]
	);

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

			// Draw poses on canvas
			drawCanvas(poses, video);

			// Update previous pose and time for falling detection
			if (poses.length > 0) {
				setPreviousPose(poses[0]);
				setLastFrameTime(performance.now());
			}
		}
	}, [detector, drawCanvas]);

	// Continuously detect poses
	useEffect(() => {
		const interval = setInterval(() => {
			detect();
		}, 100);

		return () => clearInterval(interval);
	}, [detect]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "flex-start",
				width: "100vw",
				height: "100vh",
			}}>
			<div style={{ position: "relative", width: '640px', height: '480px' }}>
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
			<div style={{ marginLeft: 20, width: 300 }}>
				<h2>Логи</h2>
				<div
					style={{
						height: 480,
						overflowY: "scroll",
						border: "1px solid #ccc",
						padding: 10,
						backgroundColor: "#f9f9f9",
					}}>
					{logs.map((log, index) => (
						<div key={index}>{log}</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default App;
