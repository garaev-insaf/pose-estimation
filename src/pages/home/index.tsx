import { PoseEstimationCamera } from "@features/pose-estimation-camera";
import { useCallback, useState } from "react";

export const HomePage = () => {
	const [logsState, setLogsState] = useState<string[]>([]);

	const addLog = useCallback(
		(message: string) => {
			const timestamp = new Date().toLocaleTimeString();
			setLogsState((prevLogs) => [...prevLogs, `[${timestamp}] ${message}`]);
		},
		[setLogsState]
	);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "flex-start",
				width: "100vw",
				height: "100vh",
			}}>
			{/* <RSTPCameraViewer /> */}
			<PoseEstimationCamera addLog={addLog} />
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
					{logsState.map((log, index) => (
						<div key={index}>{log}</div>
					))}
				</div>
			</div>
		</div>
	);
};
