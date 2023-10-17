import { useEffect, useState } from "react";
import useHashLocation from "../hooks/useHashLocation";
import { useAuthContext } from "../hooks/useAuthContext";
import socket from "./socket-client";
import PropTypes from "prop-types";
import { Card, Row, Col, Space, Button, Typography, Divider } from "antd";
import { Chessboard } from "react-chessboard";
import { v4 } from "uuid";
import { Chess } from "chess.js";
import {
	// DeleteOutlined,
	// ArrowUpOutlined,
	// ArrowDownOutlined,
	// ShareAltOutlined,
	PlayCircleOutlined,
	EyeOutlined,
} from "@ant-design/icons";

function Home({
	firstPlayer,
	room,
	mongoSavedGames,
	// handleMongoSavesChange,
	handleRoomChange,
	handleOrientationChange,
	handlePlayersChange,
	handleFirstPlayerChange,
}) {
	const { user } = useAuthContext();
	const [, hashNavigate] = useHashLocation();
	const [liveGames, setLiveGames] = useState([]);
	const localGames = Object.keys(localStorage);
	useEffect(() => {
		if (firstPlayer) {
			hashNavigate(`/game/play/${room}`);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [room]);

	useEffect(() => {
		console.log("hi");
		socket.emit("getLiveGames", (liveGames) => {
			console.log(liveGames);
			setLiveGames(liveGames);
		});
	}, []);

	return (
		<Row align="middle" justify="center" gutter={[16, 16]}>
			<Col type="flex" align="middle" span={24}>
				<Space style={{ marginTop: 24 }} wrap>
					<Button
						type="primary"
						onClick={() => {
							socket.emit(
								"createRoom",
								{ username: user ? user.username : null },
								(room) => {
									console.log(room);
									handleRoomChange(room.roomId);
									handleOrientationChange("white");
									handlePlayersChange(room.players);
									handleFirstPlayerChange(true);
								}
							);
						}}
					>
						Start New Multiplayer
					</Button>
					<Button
						type="primary"
						onClick={() => {
							const newRoom = v4();
							hashNavigate(`/single/${newRoom}`);
						}}
					>
						Start New Single
					</Button>
					<Button
						type="primary"
						onClick={async () => {
							const response = await fetch(
								`${import.meta.env.VITE_BACKEND_API}/getuser`,
								{
									withCredentials: true,
									credentials: "include",
								}
							);
							// hashNavigate(`/single/${newRoom}`);
							const data = await response.json();
							console.log(data);
						}}
					>
						Get User
					</Button>
				</Space>
			</Col>
			<Col span={24}>
				<Typography.Title level={3}>Live Games</Typography.Title>
				<Divider style={{ margin: 0 }} />
				<div className="scrolling-wrapper-flexbox">
					{liveGames.map((room, idx) => (
						<Card
							className="card-scroll"
							key={idx}
							style={{ width: 240 }}
							cover={
								<Chessboard
									arePiecesDraggable={false}
									position={
										room.fen ? room.fen : new Chess().fen()
									}
									customBoardStyle={{
										borderRadius: "4px",
									}}
								/>
							}
							hoverable
						>
							<Card.Meta
								title={room.roomId}
								description={
									<Row justify="center">
										<Col>
											<Space.Compact block>
												<Button
													onClick={() => {
														hashNavigate(
															`/game/view/${room.roomId}`
														);
													}}
												>
													<EyeOutlined />
													View
												</Button>
												<Button
													disabled={
														room.players.length > 1
													}
													onClick={() => {
														hashNavigate(
															`/game/play/${room.roomId}`
														);
													}}
												>
													<PlayCircleOutlined />
													Play
												</Button>
											</Space.Compact>
										</Col>
									</Row>
								}
							/>
						</Card>
					))}
				</div>
				{liveGames.length !== 0 ? (
					""
				) : (
					<Typography.Title level={5} type="secondary">
						No Ongoing Games
					</Typography.Title>
				)}
			</Col>
			<Col span={24}>
				<Typography.Title level={3}>Local Saves</Typography.Title>
				<Divider style={{ margin: 0 }} />
				<div className="scrolling-wrapper-flexbox">
					{localGames.map((item, idx) => (
						<Card
							className="card-scroll"
							key={idx}
							style={{ width: 240 }}
							cover={
								<Chessboard
									arePiecesDraggable={false}
									position={localStorage.getItem(item)}
									customBoardStyle={{
										borderRadius: "4px",
									}}
								/>
							}
							// onClick={() => {
							// 	hashNavigate(`/single/${item}`);
							// }}
							hoverable
						>
							<Card.Meta
								title={item}
								description={
									<Row justify="center">
										<Col>
											<Space.Compact block>
												<Button
													onClick={() => {
														hashNavigate(
															`/single/${item}`
														);
													}}
												>
													<PlayCircleOutlined />
													Resume
												</Button>
											</Space.Compact>
										</Col>
									</Row>
								}
							/>
						</Card>
					))}
				</div>
				{localGames.length !== 0 ? (
					""
				) : (
					<Typography.Title level={5} type="secondary">
						No Local Saved Games
					</Typography.Title>
				)}
			</Col>

			<Col span={24}>
				<Typography.Title level={3}>MongoDB Saves</Typography.Title>
				<Divider style={{ margin: 0 }} />
				<div className="scrolling-wrapper-flexbox">
					{mongoSavedGames.map((item, idx) => (
						<Card
							className="card-scroll"
							key={idx}
							style={{ width: 240 }}
							cover={
								<Chessboard
									arePiecesDraggable={false}
									position={item.fen}
									customBoardStyle={{
										borderRadius: "4px",
									}}
								/>
							}
							onClick={() => {
								hashNavigate(`/single/${item.gameId}`);
							}}
							hoverable
						>
							<Card.Meta
								title={item.gameId}
								description={
									<Row justify="center">
										<Col>
											<Space.Compact block>
												<Button
													onClick={() => {
														hashNavigate(
															`/single/${item.gameId}`
														);
													}}
												>
													<PlayCircleOutlined />
													Resume
												</Button>
											</Space.Compact>
										</Col>
									</Row>
								}
							/>
						</Card>
					))}
				</div>

				{user ? (
					mongoSavedGames.length !== 0 ? (
						""
					) : (
						<Typography.Title level={5} type="secondary">
							No MongoDB Saved Games
						</Typography.Title>
					)
				) : (
					<Typography.Title level={5} type="secondary">
						Login to View MongoDB Saved Games
					</Typography.Title>
				)}
			</Col>
		</Row>
	);
}

Home.propTypes = {
	room: PropTypes.string,
	firstPlayer: PropTypes.bool,
	mongoSavedGames: PropTypes.array,
	handleMongoSavesChange: PropTypes.func,
	handleRoomChange: PropTypes.func,
	handlePlayersChange: PropTypes.func,
	handleOrientationChange: PropTypes.func,
	handleFirstPlayerChange: PropTypes.func,
};

export default Home;
