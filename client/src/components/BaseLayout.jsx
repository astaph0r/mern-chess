import PropTypes from "prop-types";
import {
	Layout,
	Divider,
	Menu,
	Button,
	Grid,
	Row,
	Col,
	Space,
	// theme
} from "antd";
import {
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	LogoutOutlined,
	// TeamOutlined,
	EditOutlined,
	ProfileOutlined,
	// SendOutlined,
} from "@ant-design/icons";
const { Header, Content } = Layout;
import { useState, useRef } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import useHashLocation from "../hooks/useHashLocation";
import { useLogout } from "../hooks/useLogout";

function BaseLayout({ children, handleThemeChange }) {
	// const {token} = theme.useToken();
	const [, hashNavigate] = useHashLocation();
	const [collapsed, setCollapsed] = useState(true);
	const [logout] = useLogout();
	const screens = Grid.useBreakpoint();
	const { user } = useAuthContext();
	const handleMenuCollapseOnClick = () => {
		if (screens.xs === true) {
			setCollapsed(!collapsed);
		} else {
			setCollapsed(collapsed);
		}
	};

	const activePage = useRef([]);
	const handleActivePage = (key) => {
		activePage.current = key;
	};

	const handleOnTabClick = (e) => {
		if (e.key == "1") {
			handleActivePage([e.key]);
			hashNavigate("/register");
			handleMenuCollapseOnClick();
		}
		if (e.key == "2") {
			handleActivePage([e.key]);
			hashNavigate("/login");
			handleMenuCollapseOnClick();
		}
	};
	return (
		<>
			<Layout
				style={{
					minHeight: "100vh",
					minWidth: "100vw",
					// maxWidth: "100vw"
				}}
			>
				<Header
					style={{
						padding: "0",
						// display: "flex",
						// justifyContent: screens.xs ? "center" : "space-between",
						// alignItems: "end",
					}}
				>
					<Row>
						<Col type="flex" align="left" span={9}>
							<Button
								type="text"
								icon={
									collapsed ? (
										<MenuUnfoldOutlined />
									) : (
										<MenuFoldOutlined />
									)
								}
								onClick={() => setCollapsed(!collapsed)}
								style={{
									color: "#f8f9fa",
									display: !screens.xs || user ? "none" : "",
									padding: "7px 0",
									// fontSize: "16px",
									width: 64,
									height: 64,
								}}
							/>
						</Col>

						<Col type="flex" align="middle" span={6}>
							<Button
								type="text"
								icon={
									<img
										src="/chess.svg"
										width={50}
										height={50}
										alt="Logo"
									/>
								}
								style={{
									// fontSize: "16px",
									width: 64,
									height: 64,
									// display
								}}
								onClick={handleThemeChange}
							/>
						</Col>
						<Col type="flex" align="right" span={9}>
							<Button
								type="text"
								icon={<LogoutOutlined />}
								// ghost
								style={{
									color: "#f8f9fa",
									display: !user ? "none" : "",
									width: 64,
									height: 64,
									// display
								}}
								onClick={logout}
							/>
							<Space
								style={{
									display: screens.xs || user ? "none" : "",
									paddingRight: "16px",
								}}
							>
								<Button
									type="primary"
									// icon={<LogoutOutlined />}
									style={{
										boxShadow: "none",
										// width: 64,
										// height: 64,
										// display
									}}
									onClick={() => {
										hashNavigate("/login");
									}}
								>
									Login
								</Button>
								<Button
									// icon={<LogoutOutlined />}
									// style={{
									// display:
									// !screens.xs || !user ? "none" : "",
									// width: 64,
									// height: 64,
									// display
									// }}
									onClick={() => {
										hashNavigate("/register");
									}}
								>
									Register
								</Button>
							</Space>
						</Col>
					</Row>
				</Header>
				<Divider style={{ margin: 0 }} />
				<Menu
					theme="light"
					mode={screens.xs ? "vertical" : "horizontal"}
					style={collapsed || !screens.xs ? { display: "none" } : {}}
					onClick={handleOnTabClick}
					selectedKeys={activePage.current}
					items={[
						{
							key: "1",
							icon: <ProfileOutlined />,
							label: "Register",
						},
						{
							key: "2",
							icon: <EditOutlined />,
							label: "Login",
						},
					]}
				/>
				<Content
					style={{
						// margin: "16px 16px",
						padding: 16,
						minHeight: "100vw -64px",
						// minWidth: "100vw -64px"
					}}
				>
					{children}
				</Content>
			</Layout>
		</>
	);
}

BaseLayout.propTypes = {
	children: PropTypes.node.isRequired,
	handleThemeChange: PropTypes.func,
};

export default BaseLayout;
