// import PropTypes from 'prop-types'
import { Button, Form, Input } from "antd";
import illustration from "../assets/illustration.png";
import useHashLocation from "../hooks/useHashLocation";
import { useRegister } from "../hooks/useRegister";
import { message } from "antd";
import { useEffect } from "react";

function Register() {
	const [, hashNavigate] = useHashLocation();
	const [register, error, isLoading] = useRegister();
	const [messageApi, messageContextHolder] = message.useMessage();

	useEffect(() => {
		if (error) {
			messageApi.error(`Error: ${error}`, 2);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [error]);

	const onFinish = async (values) => {
		try {
			if (navigator.onLine !== true) {
				console.log("No connection!");
			} else {
				const success = await register(
					values.email,
					values.username,
					values.password
				);
				if (success) {
					hashNavigate("/login");
				}
			}
		} catch (error) {
			console.log(error);
		}
	};

	const onFinishFailed = (errorInfo) => {
		console.log("Failed:", errorInfo);
	};
	return (
		<div className="login-page">
			{messageContextHolder}
			<div className="login-box">
				<div className="illustration-wrapper">
					<img src={illustration} alt="Login" />
				</div>
				<Form
					name="register-form"
					labelAlign="right"
					initialValues={{ remember: true }}
					onFinish={onFinish}
					onFinishFailed={onFinishFailed}
					// scrollToFirstError
				>
					<p className="form-title">Welcome</p>
					<p>Register for mern-chess</p>
					<Form.Item
						name="email"
						hasFeedback
						rules={[
							{
								required: true,
								message: "Please input your email!",
							},
							{
								type: "email",
								message: "Invalid email!",
							},
						]}
					>
						<Input placeholder="Email" />
					</Form.Item>
					<Form.Item
						name="username"
						hasFeedback
						rules={[
							{
								required: true,
								message: "Please input your username!",
							},
							{
								max: 12,
								message: "Username cannot exceed 12 characters.",
							},
							{
								min: 4,
								message: "Username should be at least 4 characters.",
							},
							() => ({
								validator(_, value) {
									if (!value || value.match(/^[a-z0-9]+$/)) {
										return Promise.resolve();
									}
									return Promise.reject(
										new Error(
											"Only lowercase alphanumeric characters allowed."
										)
									);
								},
							}),
						]}
					>
						<Input placeholder="Username" />
					</Form.Item>

					<Form.Item
						name="password"
						hasFeedback
						rules={[
							{
								required: true,
								message: "Please input your password!",
							},
							{
								min: 8,
								message:
									"Password needs to be minimum 8 characters.",
							},
						]}
					>
						<Input.Password placeholder="Password" />
					</Form.Item>

					<Form.Item
						name="confirm"
						dependencies={["password"]}
						hasFeedback
						rules={[
							{
								required: true,
								message: "Please confirm your password!",
							},
							({ getFieldValue }) => ({
								validator(_, value) {
									if (
										!value ||
										getFieldValue("password") === value
									) {
										return Promise.resolve();
									}
									return Promise.reject(
										new Error(
											"Confirmed Password does not match!"
										)
									);
								},
							}),
						]}
					>
						<Input.Password placeholder="Confirm Password" />
					</Form.Item>

					<Form.Item>
						<Button
							disabled={isLoading}
							type="primary"
							htmlType="submit"
							className="login-form-button"
						>
							REGISTER
						</Button>
					</Form.Item>

					<Form.Item>
						<Button
							disabled={isLoading}
							danger
							// type="primary"
							// htmlType="submit"
							className="login-form-button"
							onClick={(e) => {
								e.preventDefault();
								hashNavigate("/");
							}}
						>
							GO BACK
						</Button>
					</Form.Item>
				</Form>
			</div>
		</div>
	);
}

Register.propTypes = {};

export default Register;
