import { HomePage } from "@pages/home";
import React from "react";
import { Route, Routes } from "react-router-dom";

const App: React.FC = () => {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
		</Routes>
	);
};

export default App;
