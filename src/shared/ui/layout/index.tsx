import React from "react";
import { Layout as AntdLayout, Menu, theme } from "antd";
import { Outlet, useNavigate } from "react-router-dom";

const { Content, Sider } = AntdLayout;

export const Layout: React.FC = () => {
	const navigate = useNavigate();
	const {
		token: { colorBgContainer, borderRadiusLG },
	} = theme.useToken();

	return (
		<AntdLayout style={{ height: "100%" }}>
			<Sider
				breakpoint="lg"
				collapsedWidth="0"
				onBreakpoint={(broken) => {
					console.log(broken);
				}}
				onCollapse={(collapsed, type) => {
					console.log(collapsed, type);
				}}>
				<div className="demo-logo-vertical" />
				<Menu
					theme="dark"
					style={{
						height: "100%",
						padding: "4px",
					}}
					mode="inline"
					defaultSelectedKeys={["camera"]}
					items={[
						{
							title: "Камеры",
							label: "Камеры",
							key: "camera",
							onClick: () => navigate("/"),
						},
						{
							title: "Логи",
							label: "Логи",
							key: "logs",
							onClick: (info) => navigate(info.key),
						},
					]}
				/>
			</Sider>
			<AntdLayout>
				<Content style={{ margin: "24px 16px 16px" }}>
					<div
						style={{
							padding: 24,
							height: "100%",
							background: colorBgContainer,
							borderRadius: borderRadiusLG,
						}}>
						<Outlet />
					</div>
				</Content>
			</AntdLayout>
		</AntdLayout>
	);
};
