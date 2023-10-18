// import React from 'react'
// import PropTypes from 'prop-types'
import { Button, Result } from "antd";
import useHashLocation from "../hooks/useHashLocation";

const NotFound = () => {
	const [, hashNavigate] = useHashLocation();
	return (
		<Result
			status="404"
			title="404"
			subTitle="Sorry, the page you visited does not exist."
			extra={
				<Button
					type="primary"
					onClick={() => {
						hashNavigate("/");
					}}
				>
					Back Home
				</Button>
			}
		/>
	);
};

NotFound.propTypes = {};

export default NotFound;
