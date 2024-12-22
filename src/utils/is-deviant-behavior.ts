import * as poseDetection from "@tensorflow-models/pose-detection";

// Check for deviant behavior (e.g., raised hand above head level)
export const isDeviantBehavior = (pose: poseDetection.Pose) => {
	const keypoints = pose.keypoints;
	const leftWrist = keypoints.find((kp) => kp.name === "left_wrist");
	const rightWrist = keypoints.find((kp) => kp.name === "right_wrist");
	const nose = keypoints.find((kp) => kp.name === "nose");

	if (!leftWrist || !rightWrist || !nose) return false;

	const isLeftRaised = (leftWrist?.score ?? 0) > 0.5 && (leftWrist?.y ?? 0) < nose.y;
	const isRightRaised = (rightWrist?.score ?? 0) > 0.5 && (rightWrist?.y ?? 0) < nose.y;

	return isLeftRaised || isRightRaised;
};

// Check for deviant behavior (e.g., person falling quickly)
export const isFallingBehavior = (
	previousPose: poseDetection.Pose | null,
	currentPose: poseDetection.Pose,
	timeElapsed: number
) => {
	// Minimum score threshold for reliable keypoints
	const MIN_SCORE = 0.5;
	// Maximum vertical drop per second (adjust based on frame rate and sensitivity)
	const FALL_SPEED_THRESHOLD = 2; // pixels per second

	if (!previousPose) return false;

	const getKeypoint = (pose: poseDetection.Pose, name: string) =>
		pose.keypoints.find((kp) => kp.name === name);

	const prevHip = getKeypoint(previousPose, "left_hip") || getKeypoint(previousPose, "right_hip");
	const currHip = getKeypoint(currentPose, "left_hip") || getKeypoint(currentPose, "right_hip");

	// Check if keypoints are undefined or have insufficient confidence scores
	if (
		!prevHip ||
		!currHip ||
		prevHip.score === undefined ||
		currHip.score === undefined ||
		prevHip.score < MIN_SCORE ||
		currHip.score < MIN_SCORE
	) {
		return false;
	}

	// Calculate vertical speed (pixels per second)
	const verticalDrop = currHip.y - prevHip.y;
	const speed = verticalDrop / (timeElapsed / 1000);

	// Falling detected if speed exceeds threshold and is directed downward
	return speed > FALL_SPEED_THRESHOLD;
};
