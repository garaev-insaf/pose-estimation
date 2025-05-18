import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

import { isDeviantBehavior, isFallingBehavior } from "../../utils/is-deviant-behavior";
import { PoseDetector } from "./pose-detector";
import "./pose-estimation-camera.scss";
import { Flex, Typography } from "antd";
import { useParams } from "react-router-dom";
import { useGetCameraStream } from "@shared/api/cameras";

const COEF_SCORE = 0.4;

interface IPoseEstimationCameraProps {
	addLog: (message: string) => void;
	behaviorCheckers?: { check: (pose: poseDetection.Pose) => boolean; message: string }[];
}

export const PoseEstimationCamera: React.FC<IPoseEstimationCameraProps> = ({ addLog }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const params = useParams();
	const { data: streamUrl = "" } = useGetCameraStream(params.id as unknown as number, {
		enabled: !!params.id,
	});
	const [previousPose, setPreviousPose] = useState<poseDetection.Pose | null>(null);
	const [lastFrameTime, setLastFrameTime] = useState<number | null>(null);

	// Initialize TensorFlow backend
	useEffect(() => {
		const initializeBackend = async () => {
			await tf.setBackend("webgl");
			await tf.ready();
		};

		initializeBackend();
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
			// Update previous pose and time for falling detection
			if (poses.length > 0) {
				setPreviousPose(poses[0]);
				setLastFrameTime(performance.now());
			}

			const canvas = canvasRef.current;
			if (!canvas) return;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw video frame on canvas
			ctx.save();
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
						const { x, y } = keypoint;
						ctx.beginPath();
						ctx.arc(x, y, 5, 0, 2 * Math.PI);
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
						ctx.beginPath();
						ctx.moveTo(kp1.x, kp1.y);
						ctx.lineTo(kp2.x, kp2.y);
						ctx.strokeStyle = skeletonColor;
						ctx.lineWidth = 2;
						ctx.stroke();
					}
				});
			});
		},
		[behaviorCheckers, addLog]
	);

	return (
		<Flex vertical gap={8} style={{ height: "100%", width: "70%" }}>
			<Typography.Title>Камера</Typography.Title>
			<div className="pose-estimation-camera-container">
				<PoseDetector drawCanvas={drawCanvas} videoSource={`http://localhost:4000${streamUrl}`} />
				{/* <PoseDetector drawCanvas={drawCanvas} videoSource="http://localhost:4000/hls/stream.m3u8" /> */}

				<canvas ref={canvasRef} className="canvas" />
			</div>
		</Flex>
	);
};
