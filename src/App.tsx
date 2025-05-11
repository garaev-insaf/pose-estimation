import { CameraPage } from "@pages/camera";
import { CamerasListPage } from "@pages/cameras-list";
import { LogsPage } from "@pages/logs";
import { Layout } from "@shared/ui";
import React from "react";
import { Route, Routes } from "react-router-dom";

const App: React.FC = () => {
	return (
		<Routes>
			<Route element={<Layout />}>
				<Route path="/" element={<CamerasListPage />} />
				<Route path="/camera/:id" element={<CameraPage />} />
				<Route path="/logs" element={<LogsPage />} />
			</Route>
		</Routes>
	);
};

export default App;
