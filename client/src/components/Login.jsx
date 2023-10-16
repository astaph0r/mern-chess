// import PropTypes from 'prop-types'
import { Button, Form, Input, message } from "antd";
import illustration from "../assets/illustration.png";
import useHashLocation from "../hooks/useHashLocation";
import { useLogin } from "../hooks/useLogin";
import { useEffect } from "react";

function Login() {
	const [, hashNavigate] = useHashLocation();
	const [login, error, isLoading] = useLogin();
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
				const success = await login(values.username, values.password);
				if (success) {
					hashNavigate("/");
				}
			}
		} catch (error) {
			console.log(error);
		}
		// try {
		// 	console.log("Success:", values);
		// 	const response = await fetch("http://localhost:3000/api/login", {
		// 		method: "POST",
		// 		withCredentials: true,
		// 		credentials: "include",
		// 		headers: {
		// 			"Content-type": "application/json",
		// 		},
		// 		body: JSON.stringify({
		// 			username: values.username,
		// 			password: values.password,
		// 		}),
		// 	});
		// 	const data = await response.json();

		// 	// console.log(response);
		// 	if (response.ok) {
		// 		console.log("set user in context here", data);
		// 		return hashNavigate("/");
		// 	} else {
		// 		console.log("Error:", data);
		// 	}
		// } catch (error) {
		// 	console.log("Request failed", error);
		// }
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
					name="login-form"
					labelAlign="right"
					initialValues={{ remember: true }}
					onFinish={onFinish}
					onFinishFailed={onFinishFailed}
				>
					<p className="form-title">Welcome back</p>
					<p>Login to the Dashboard</p>
					<Form.Item
						name="username"
						hasFeedback
						rules={[
							{
								required: true,
								message: "Please input your username!",
							},
							() => ({
								validator(_, value) {
									if (
										value.match(
											/^[^\s@]+@[^\s@]+\.[^\s@]+$/ //email
										)
									) {
										return Promise.reject(
											new Error(
												"Username is required not email address."
											)
										);
									}
									return Promise.resolve();
								},
							}),
							() => ({
								validator(_, value) {
									if (
										!value ||
										value.match(/^[a-z0-9]+$/) || //lowercase alphanumeric
										value.match(
											/^[^\s@]+@[^\s@]+\.[^\s@]+$/ //email
										)
									) {
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

					<Form.Item>
						<Button
							disabled={isLoading}
							type="primary"
							htmlType="submit"
							className="login-form-button"
						>
							LOGIN
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

Login.propTypes = {};

export default Login;
