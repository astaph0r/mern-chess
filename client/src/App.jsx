import "./App.css";
import LiveGame from "./components/LiveGame";
import Home from "./components/Home";
import BaseLayout from "./components/BaseLayout";
import { Router, Route } from "wouter";
import useHashLocation from "./hooks/useHashLocation";
import { ConfigProvider, theme } from "antd";
import { useState, useCallback, useEffect } from "react";
import SingleGame from "./components/SingleGame";
import Login from "./components/Login";
import Register from "./components/Register";
import { useAuthContext } from "./hooks/useAuthContext";

function App() {
	const [firstPlayer, setFirstPlayer] = useState(false);
	const [room, setRoom] = useState("");
	const [orientation, setOrientation] = useState("");
	const [players, setPlayers] = useState([]);
	const { user } = useAuthContext();
	const [mongoSavedGames, setMongoSavedGames] = useState([]);

	useEffect(() => {
		console.log("Something changed room state");
		console.log(room);
	}, [room]);

	useEffect(() => {
		const fetchMongoGames = async () => {
			try {
				if (user) {
					const response = await fetch(
						"http://localhost:3000/api/savedgame/all",
						{
							withCredentials: true,
							credentials: "include",
						}
					);
					const data = await response.json();
					if (response.ok) {
						if (data.data) {
							setMongoSavedGames(data.data);
						}
						console.log(data.message);
						// return hashNavigate("/");
					} else {
						// setIsLoading(false);
						// setError(data.error);
						// messageApi.info("Error:", data.error);
						console.log("Error:", data.error);
					}
				} else {
					setMongoSavedGames([]);
				}
			} catch (error) {
				console.log("Error:", error);
			}
		};
		fetchMongoGames();
	}, [user]);

	const handleCleanup = useCallback(() => {
		setRoom("");
		setOrientation("");
		setPlayers([]);
	}, []);

	const handleMongoSavesChange = (games) => {
		setMongoSavedGames(games);
	};
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
								mongoSavedGames={mongoSavedGames}
								handleMongoSavesChange={handleMongoSavesChange}
							/>
						</BaseLayout>
					</Route>
					<Route path="/single/:gameId">
						<BaseLayout handleThemeChange={handleThemeChange}>
							<SingleGame
								mongoSavedGames={mongoSavedGames}
								handleMongoSavesChange={handleMongoSavesChange}
							/>
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
