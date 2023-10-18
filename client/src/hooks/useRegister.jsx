import { useState } from "react";
// import { useAuthContext } from "./useAuthContext";
// import { useMessage } from "./useMessage";
// import { message } from "antd";

export const useRegister = () => {
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(null);
	// const [messageApi] = message.useMessage();
	// const [messageApi] = useMessage();

	const register = async (email, username, password) => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/register`, {
				method: "POST",
				headers: {
					"Content-type": "application/json",
				},
				body: JSON.stringify({
					username,
					email,
					password,
				}),
			});
			const data = await response.json();
			// console.log(response);
			if (response.ok) {
				setIsLoading(false);
				console.log("set user in context here");
				console.log(data);
				return true;
				// return hashNavigate("/");
			} else {
				setIsLoading(false);
				setError(data.error);
				// messageApi.info("Error:", data.error);
				console.log("Error:", data.error);
				return false;
			}
		} catch (error) {
			console.log("Error:", error);
			return false;
		}
	};
	return [register, error, isLoading];
};
