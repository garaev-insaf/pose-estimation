// videoPlayer.js (или компонента React)
import React from "react";

export const VideoPlayer = () => {
	const videoRef = React.useRef<HTMLVideoElement | null>(null);


	return <video ref={videoRef} controls></video>;
};
