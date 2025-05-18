import { Button, Flex, Input, Modal, Typography } from "antd";
import "./styles.scss";
import { useNavigate } from "react-router-dom";
import { useCreateCamera, useGetCameras } from "@shared/api/cameras";
import { useState } from "react";
import { CameraPreview } from "./camera-preview";

export const CamerasListPage = () => {
	const [addCameraModalState, setAddCameraModalState] = useState(false);
	const [newCameraState, setNewCameraState] = useState({
		source: "",
		name: "",
	});
	const navigate = useNavigate();
	const { data } = useGetCameras();

	console.log(data);
	const { mutate } = useCreateCamera({
		keysOnSuccess: ["get-cameras"],
	});

	const handleCancelAddCameraClick = () => {
		setAddCameraModalState(false);
		setNewCameraState({
			source: "",
			name: "",
		});
	};

	const handleSaveClick = () => {
		mutate(newCameraState);
		setAddCameraModalState(false);
		setNewCameraState({
			source: "",
			name: "",
		});
	};

	return (
		<Flex vertical gap={16}>
			<Flex justify="end">
				<Button onClick={() => setAddCameraModalState(true)}>Добавить камеру</Button>
			</Flex>
			<Flex wrap gap={16} className="camera-list-page">
				{data &&
					data.map(({ name, id }) => (
						<Flex
							vertical
							style={{ width: "calc(100% / 3 - 16px)" }}
							gap={8}
							className="item"
							onClick={() => navigate(`/camera/${id}`)}>
							<CameraPreview id={id} />
							<Flex vertical>
								<Typography.Paragraph>{name}</Typography.Paragraph>
								<Typography.Paragraph>Кол-во инцидентов: {1}</Typography.Paragraph>
							</Flex>
						</Flex>
					))}
				<Modal
					width={500}
					height={800}
					title="Добавить камеру"
					closable
					cancelText="Отмена"
					onCancel={handleCancelAddCameraClick}
					open={addCameraModalState}
					okText="Добавить"
					onOk={handleSaveClick}>
					<Flex
						vertical
						gap={16}
						style={{
							marginTop: "20px",
						}}>
						<Flex vertical gap={8}>
							<label>Название камеры</label>
							<Input
								value={newCameraState.name}
								onChange={(e) => setNewCameraState({ ...newCameraState, name: e.target.value })}
							/>
						</Flex>
						<Flex vertical gap={8}>
							<label>RTCP-ссылка</label>
							<Input
								value={newCameraState.source}
								onChange={(e) => setNewCameraState({ ...newCameraState, source: e.target.value })}
							/>
						</Flex>
					</Flex>
				</Modal>
			</Flex>
		</Flex>
	);
};
