import "./App.css";
import LiveGame from "./components/LiveGame";
import Home from "./components/Home";
import BaseLayout from "./components/BaseLayout";
import { Router, Route } from "wouter";
import useHashLocation from "./hooks/useHashLocation";
import { ConfigProvider, theme } from "antd";
import { useState, useCallback } from "react";
import SingleGame from "./components/SingleGame";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
	const [firstPlayer, setFirstPlayer] = useState(false);
	const [room, setRoom] = useState("");
	const [orientation, setOrientation] = useState("");
	const [players, setPlayers] = useState([]);

	const handleCleanup = useCallback(() => {
		setRoom("");
		setOrientation("");
		setPlayers([]);
	}, []);

	const handleRoomChange = (room) => {
		setRoom(room);
	};
	const handlePlayersChange = (players) => {
		setPlayers(players);
	};
	const handleOrientationChange = (orientation) => {
		setOrientation(orientation);
	};

	const handleFirstPlayerChange = (firstPlayer) => {
		setFirstPlayer(firstPlayer);
	};

	// useEffect(() => {
	// 	handleRoomChange("8278723");
	// }, []);

	const [isDarkMode, setIsDarkMode] = useState(false);

	const handleThemeChange = () => {
		setIsDarkMode((previousValue) => !previousValue);
	};
	const { defaultAlgorithm, darkAlgorithm } = theme;

	const baseColors = {
		colorTextBase: isDarkMode ? "#f8f9fa" : "#212529",
		colorBgBase: isDarkMode ? "#212529" : "#f8f9fa",
		customDarkSquareStyle: isDarkMode ? "#16679a" : "#0582ca",
		customLightSquareStyle: isDarkMode ? "#a3bac3" : "#add7f6",
	};

	return (
		<ConfigProvider
			theme={{
				algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
				token: {
					colorBgBase: baseColors.colorBgBase,
					colorTextBase: baseColors.colorTextBase,
					customDarkSquareStyle: baseColors.customDarkSquareStyle,
					customLightSquareStyle: baseColors.customLightSquareStyle,
				},
			}}
		>
			<div className="App">
				<Router hook={useHashLocation}>
					<Route path="/register">
						<Register />
					</Route>
					<Route path="/login">
						<Login />
					</Route>
					<Route path="/">
						<BaseLayout handleThemeChange={handleThemeChange}>
							<Home
								room={room}
								players={players}
								orientation={orientation}
								firstPlayer={firstPlayer}
								handleRoomChange={handleRoomChange}
								handlePlayersChange={handlePlayersChange}
								handleOrientationChange={
									handleOrientationChange
								}
								handleFirstPlayerChange={
									handleFirstPlayerChange
								}
								handleCleanup={handleCleanup}
							/>
						</BaseLayout>
					</Route>
					<Route path="/single/:gameId">
						<BaseLayout handleThemeChange={handleThemeChange}>
							<SingleGame />
						</BaseLayout>
					</Route>
					<Route path="/game/:mode/:gameId">
						<BaseLayout handleThemeChange={handleThemeChange}>
							<LiveGame
								room={room}
								players={players}
								orientation={orientation}
								firstPlayer={firstPlayer}
								handleRoomChange={handleRoomChange}
								handlePlayersChange={handlePlayersChange}
								handleOrientationChange={
									handleOrientationChange
								}
								handleFirstPlayerChange={
									handleFirstPlayerChange
								}
								handleCleanup={handleCleanup}
							/>
						</BaseLayout>
					</Route>
				</Router>
			</div>
		</ConfigProvider>
	);
}

export default App;
