import "./App.css";
import Game from "./components/Game";
import Home from "./components/Home";
import BaseLayout from "./components/BaseLayout";
import { Router, Route } from "wouter";
import useHashLocation from "./hooks/useHashLocation";
import { ConfigProvider, theme } from "antd";
import { useState, useCallback } from "react";
import SingleGame from "./components/SingleGame";

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

	return (
		<ConfigProvider
			theme={{
				algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
			}}
		>
			<div className="App">
				<Router hook={useHashLocation}>
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
							<Game
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
