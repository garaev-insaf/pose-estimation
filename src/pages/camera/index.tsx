import { PoseEstimationCamera } from "@features/pose-estimation-camera";
import { Flex, Typography } from "antd";
import { useCallback, useState } from "react";

export const CameraPage = () => {
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
				width: "100%",
				maxHeight: "100%",
				height: "100%",
			}}>
			<PoseEstimationCamera addLog={addLog} />
			<Flex vertical style={{ marginLeft: 20, width: '30%', height: "100%" }} gap={8}>
				<Typography.Title>Логи</Typography.Title>
				<div
					style={{
						height: "100%",
						overflowY: "scroll",
						border: "1px solid #ccc",
						width: "100%",
						padding: 10,
					}}>
					{logsState.map((log, index) => (
						<div key={index}>{log}</div>
					))}
				</div>
			</Flex>
		</div>
	);
};
