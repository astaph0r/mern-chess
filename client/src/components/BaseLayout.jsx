import PropTypes from "prop-types";
import { Layout, Divider } from "antd";
const { Header, Content } = Layout;


function BaseLayout({ children, handleThemeChange }) {


	return (
		<>
			<Layout style={{ minHeight: "100vh", minWidth: "100vw" }}>
					<Header
						style={{
							padding: 0,
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<>
						<img
							src="/chess.svg"
							width={50}
							height={50}
							alt="Logo"
							onClick={handleThemeChange}
						/>
						</>
						
					</Header>
					<Divider style={{ margin: 0 }} />
					<Content
						style={{
							// margin: "16px 16px",
							padding: 16,
							minHeight: "100vw -64px",
							minWidth: "100vw -64px"
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
