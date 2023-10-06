import { useEffect } from "react";
import useHashLocation from "../hooks/useHashLocation";
import socket from "./socket-client";
import PropTypes from "prop-types";
import { Space, Button } from "antd";
import { v4 } from 'uuid';

const boardWrapper = {
	width: `70vw`,
	maxWidth: "70vh",
	margin: "3rem auto",
};

function Home({
	firstPlayer,
	room,
	handleRoomChange,
	handleOrientationChange,
	handlePlayersChange,
	handleFirstPlayerChange,
}) {
	const [, hashNavigate] = useHashLocation();
	useEffect(() => {
		if (firstPlayer) {
			hashNavigate(`/game/play/${room}`);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [room]);

	return (
		<div style={boardWrapper}>
			<Space style={{ marginTop: 24 }} wrap>
			<Button
				type="primary"
				onClick={() => {
					socket.emit("createRoom", (room) => {
						console.log(room);
						handleRoomChange(room.roomId);
						handleOrientationChange("white");
						handlePlayersChange(room.players);
						handleFirstPlayerChange(true);
					});
				}}
			>
				Start New Multiplayer
			</Button>
			<Button
				type="primary"
				onClick={() => {
					const newRoom = v4();
					hashNavigate(`/single/${newRoom}`)
				}}
			>
				Start New Single
			</Button>
			</Space>
			
		</div>
	);
}

Home.propTypes = {
	room: PropTypes.string,
	firstPlayer: PropTypes.bool,
	handleRoomChange: PropTypes.func,
	handlePlayersChange: PropTypes.func,
	handleOrientationChange: PropTypes.func,
	handleFirstPlayerChange: PropTypes.func,
};

export default Home;
