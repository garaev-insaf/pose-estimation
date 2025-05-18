import { useGetCameraStream } from "@shared/api/cameras";
import Hls from "hls.js";
import React, { FC, useRef } from "react";

interface ICameraPreviewProps {
	id: number;
}

export const CameraPreview: FC<ICameraPreviewProps> = ({ id }) => {
	const { data } = useGetCameraStream(id);
	const videoRef = useRef<HTMLVideoElement>(null);

	React.useEffect(() => {
		if (!videoRef.current) return;

		if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(`http://localhost:4000${data}`);
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
	}, [data]);

	return (
		<video
			autoPlay
			className="img"
			ref={videoRef}
			playsInline
			crossOrigin="anonymous"
			muted
			width="100%"
			src={data ? `http://localhost:4000${data}` : ""}
			height="100%"
		/>
	);
};
