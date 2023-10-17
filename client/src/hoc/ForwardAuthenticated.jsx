// import React from "react";
import PropTypes from "prop-types";
import { useAuthContext } from "../hooks/useAuthContext";
import { Redirect } from "wouter";
// import useHashLocation from "../hooks/useHashLocation";

const ForwardAuthenticated = ({ children }) => {
	const { user } = useAuthContext();
	// const [, hashNavigate] = useHashLocation();
	return !user ? children : <Redirect to="/" />;
};

ForwardAuthenticated.propTypes = {
	children: PropTypes.node.isRequired,
};

export default ForwardAuthenticated;
