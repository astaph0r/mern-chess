import { createContext, useReducer } from "react";
import PropTypes from "prop-types";

export const AuthContext = createContext();

const authReducer = (state, action) => {
	switch (action.type) {
		case "LOGIN":
			return { user: action.payload };
		case "LOGOUT":
			return { user: null };
		default:
			return state;
	}
};

function AuthContextProvider({ children }) {
	const [state, dispatch] = useReducer(authReducer, {
		user: null,
	});
	console.log("AuthContext: ", state);
	return (
		<AuthContext.Provider value={{ ...state, dispatch }}>
			{children}
		</AuthContext.Provider>
	);
}

AuthContextProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export { AuthContextProvider };
