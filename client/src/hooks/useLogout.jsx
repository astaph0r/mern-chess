import { useAuthContext } from "./useAuthContext";

export const useLogout = () => {
	// const [error, setError] = useState(null);
	// const [isLoading, setIsLoading] = useState(null);
    const { dispatch } = useAuthContext();
	
    const logout = async () => {
		try {
			// setIsLoading(true);
			// setError(null);
            // console.log("joii")

			const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/logout`, {
				method: "DELETE",
				withCredentials: true,
				credentials: "include",
				// headers: {
				// 	"Content-type": "application/json",
				// },
				// body: JSON.stringify({
				// 	username,
				// 	password,
				// }),
			});
			const data = await response.json();
			// console.log(response);
			if (response.ok) {
				// setIsLoading(false);
				console.log(data.message);
				// console.log(data);
                dispatch({type: 'LOGOUT'})
				return true;
				// return hashNavigate("/");
			} else {
				// setIsLoading(false);
				// setError(data.error);
				// messageApi.info("Error:", data.error);
				console.log("Error:", data.error);
                return false
			}
		} catch (error) {
			console.log("Error:", error);
			return false;
		}
	};
	return [logout];
};
