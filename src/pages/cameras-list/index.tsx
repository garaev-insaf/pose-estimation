import { Flex, Image, Typography } from "antd";
import { mockendCamerasList } from "./mock-cameras-list";
import "./styles.scss";
import { useNavigate } from "react-router-dom";

export const CamerasListPage = () => {
	const navigate = useNavigate();
	return (
		<Flex wrap gap={16} className="camera-list-page">
			{mockendCamerasList.map(({ name, incident_count, preview }) => (
				<Flex
					vertical
					style={{ width: "calc(33% - 32px)" }}
					gap={8}
					className="item"
					onClick={() => navigate("/camera/1")}>
					<Image src={preview} preview={false} className="img" />
					<Flex vertical>
						<Typography.Paragraph>{name}</Typography.Paragraph>
						<Typography.Paragraph>Кол-во инцидентов: {incident_count}</Typography.Paragraph>
					</Flex>
				</Flex>
			))}
		</Flex>
	);
};
