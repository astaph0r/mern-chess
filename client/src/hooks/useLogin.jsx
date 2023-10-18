import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

export const useLogin = () => {
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(null);
    const { dispatch } = useAuthContext();
	
    const login = async (username, password) => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/login`, {
				method: "POST",
				withCredentials: true,
				credentials: "include",
				headers: {
					"Content-type": "application/json",
				},
				body: JSON.stringify({
					username,
					password,
				}),
			});
			const data = await response.json();
			// console.log(response);
			if (response.ok) {
				setIsLoading(false);
				console.log("set user in context here");
				console.log(data);
                dispatch({type: 'LOGIN', payload: data})
				return true;
				// return hashNavigate("/");
			} else {
				setIsLoading(false);
				setError(data.error);
				// messageApi.info("Error:", data.error);
				console.log("Error:", data.error);
			}
		} catch (error) {
			console.log("Error:", error);
			return false;
		}
	};
	return [login, error, isLoading];
};
