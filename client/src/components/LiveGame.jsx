import PropTypes from "prop-types";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useState, useMemo, useCallback, useEffect } from "react";
import socket from "./socket-client";
import useHashLocation from "../hooks/useHashLocation";
import { useAuthContext } from "../hooks/useAuthContext";
import { useRoute } from "wouter";
import white from "../assets/white.png";
import black from "../assets/black.png";

import {
	Statistic,
	Card,
	// Tag,
	// Grid,
	Col,
	Row,
	List,
	// Space,
	Button,
	Typography,
	theme,
} from "antd";

import {
	// DeleteOutlined,
	// ArrowUpOutlined,
	// ArrowDownOutlined,
	ShareAltOutlined,
	EyeOutlined,
} from "@ant-design/icons";

const boardWrapper = {
	width: "83vw",
	maxWidth: "70vh",
	margin: "1rem auto",
};

function LiveGame({
	room,
	players,
	orientation,
	firstPlayer,
	handleRoomChange,
	handleOrientationChange,
	handlePlayersChange,
	handleFirstPlayerChange,
	handleCleanup,
}) {
	const game = useMemo(() => new Chess(), []);
	const [fen, setFen] = useState(game.fen());
	const [over, setOver] = useState("");
	const [moveFrom, setMoveFrom] = useState(null);
	const [moveTo, setMoveTo] = useState(null);
	const [showPromotionDialog, setShowPromotionDialog] = useState(false);
	// eslint-disable-next-line no-unused-vars
	const [moveSquares, setMoveSquares] = useState({});
	const [optionSquares, setOptionSquares] = useState({});
	const { token } = theme.useToken();

	const [playMatch, playParams] = useRoute("/game/play/:gameId");
	const [viewMatch, viewParams] = useRoute("/game/view/:gameId");
	const gameId = playMatch
		? playParams.gameId
		: viewMatch
		? viewParams.gameId
		: null;
	const { user } = useAuthContext();

	const [, hashNavigate] = useHashLocation();

	// useEffect(() => {
	// 	console.log(`room: ${room}, players ${players}, fen: ${fen}`);
	// }, [fen, room, players]);
	// useEffect(() => {
	// 	console.log("Something changed room state");
	// 	console.log(`room: ${room}`);
	// }, [room]);

	useEffect(() => {
		// console.log(match, params);

		// console.log(firstPlayer);
		if (!firstPlayer && playMatch) {
			console.log("check", room);
			if (!room && !over) {
				socket.emit(
					"joinPlayRoom",
					{
						roomId: gameId,
						username: user ? user.username : null,
					},
					(r) => {
						if (r.error) {
							setOver(r.message);
							return console.log(r.message);
						}
						console.log("response:", r);
						handleRoomChange(r.roomId);
						handlePlayersChange(r.players);
						handleOrientationChange("black");
					}
				);
			}
		}
		if (viewMatch && !room && !over) {
			// if (!room) {
			socket.emit(
				"joinViewRoom",
				{
					roomId: gameId,
					username: user ? user.username : null,
				},
				(r) => {
					if (r.error) {
						setOver(r.message);
						return console.log(r.message);
					}
					console.log("response:", r);
					if (r.fen) {
						console.log("hi2");
						game.load(r.fen);
						setFen(game.fen());
						// makeAMove(r.lastMove)
					}
					handleRoomChange(r.viewId);
					handlePlayersChange(r.players);
				}
			);
			// }
		}
		handleFirstPlayerChange(false);

		// return () => {
		// 	socket.off("new-chat-message");
		// };
	}, [
		firstPlayer,
		game,
		handleFirstPlayerChange,
		handleOrientationChange,
		handlePlayersChange,
		handleRoomChange,
		playMatch,
		room,
		user,
		viewMatch,
		gameId,
		over,
	]);

	useEffect(() => {
		socket.on("opponentJoined", ({ roomData }) => {
			console.log("roomData", roomData);
			handlePlayersChange(roomData.players);
		});
	}, [handlePlayersChange]);

	useEffect(() => {
		socket.on("playerDisconnected", ({ player }) => {
			console.log("playerDisconnected");
			setOver(
				`${
					player.username ? player.username : player.id
				} has disconnected.`
			);
			handleCleanup();
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		socket.on("closeRoom", ({ player }) => {
			console.log("closeRoom");
			setOver(
				`${player.username ? player.username : player.id} has quit.`
			);
			handleCleanup();
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (playMatch) {
			if (room) {
				socket.emit("updateFen", {
					// move,
					roomId: room,
					fen,
				});
			}
		}
	}, [fen, playMatch, room]);

	const getMoveOptions = (square) => {
		try {
			const moves = game.moves({
				square,
				verbose: true,
			});
			if (moves.length === 0) {
				setOptionSquares({});
				return false;
			}

			const newSquares = {};
			moves.map((move) => {
				newSquares[move.to] = {
					background:
						game.get(move.to) &&
						game.get(move.to).color !== game.get(square).color
							? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
							: "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
					borderRadius: "50%",
				};
				return move;
			});
			newSquares[square] = {
				background: "rgba(255, 255, 0, 0.4)",
			};
			setOptionSquares(newSquares);
			return true;
		} catch (error) {
			console.log(error);
		}
	};

	const makeAMove = useCallback(
		(move) => {
			try {
				const result = game.move(move);
				setFen(game.fen());

				// console.log(
				// 	"over, checkmate",
				// 	game.isGameOver(),
				// 	game.isCheckmate()
				// );

				if (game.isGameOver()) {
					if (game.isCheckmate()) {
						setOver(
							`Checkmate! ${
								game.turn() === "w" ? "black" : "white"
							} wins!`
						);
					} else if (game.isDraw()) {
						setOver("Draw");
					} else {
						setOver("Game over");
					}
				}

				return result;
			} catch (e) {
				return null;
			}
		},
		[game]
	);

	useEffect(() => {
		// if (viewMatch && fen === new Chess().fen()) {
		// 	socket.on("move", ({ fen }) => {
		// 		setFen(fen);
		// 	});
		// }
		socket.on("move", ({ move }) => {
			makeAMove(move);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [makeAMove]);

	const onSquareClick = (square) => {
		try {
			if (viewMatch) return false;
			if (game.turn() !== orientation[0]) return false;

			if (players.length < 2) return false;

			if (!moveFrom) {
				const hasMoveOptions = getMoveOptions(square);
				if (hasMoveOptions) setMoveFrom(square);
				return;
			} else {
				const moves = game.moves({
					moveFrom,
					verbose: true,
				});
				const foundMove = moves.find(
					(m) => m.from === moveFrom && m.to === square
				);

				if (!foundMove) {
					const hasMoveOptions = getMoveOptions(square);
					setMoveFrom(hasMoveOptions ? square : null);
					return;
				}

				setMoveTo(() => square);
				if (
					(foundMove.color === "w" &&
						foundMove.piece === "p" &&
						square[1] === "8") ||
					(foundMove.color === "b" &&
						foundMove.piece === "p" &&
						square[1] === "1")
				) {
					setShowPromotionDialog(true);
					return;
				}

				const moveData = {
					from: moveFrom,
					to: square,
					color: game.turn(),
					promotion: "q",
				};
				const move = makeAMove(moveData);

				if (move === null) {
					const hasMoveOptions = getMoveOptions(square);
					if (hasMoveOptions) setMoveFrom(square);
					return;
				}

				socket.emit("move", {
					move,
					room,
					// fen,
				});

				setMoveFrom(null);
				setMoveTo(null);
				setOptionSquares({});
				return;
			}
		} catch (error) {
			console.log(error);
		}
	};

	function onPromotionPieceSelect(piece) {
		try {
			if (piece) {
				const moveData = {
					from: moveFrom,
					to: moveTo,
					color: game.turn(),
					promotion: piece[1].toLowerCase() ?? "q",
				};
				makeAMove(moveData);
			}

			setMoveFrom(null);
			setMoveTo(null);
			setShowPromotionDialog(false);
			setOptionSquares({});
			return true;
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<Row gutter={[16, 16]}>
			<Col
				xs={{
					span: 24,
					offset: 0,
					// order: 2,
				}}
				md={{
					span: 24,
					offset: 0,
				}}
				xl={{
					span: 6,
					offset: 0,
					order: 3,
				}}
			>
				<>
					<Row gutter={[16, 16]}>
						<Col
							xs={{
								span: 24,
								order: 3,
							}}
							sm={{
								span: 24,
								order: 1,
							}}
						>
							<Card bordered={false}>
								<Statistic
									title={`Game Status [Multiplayer]: ${
										playMatch ? "Play Mode" : "View Mode"
									}`}
									value={
										// over
										// 	? over
										// 	: game.inCheck()
										// 	? "Check"
										// 	: "Active"

										!over
											? players.length === 2
												? game.inCheck()
													? "Check"
													: "Active"
												: "Waiting for Opponent to join"
											: over
									}
									// precision={2}
									valueStyle={{
										color: over
											? "#cf1322"
											: players.length !== 2 ||
											game.inCheck()
											? token.colorWarningText
											: "#3f8600",
									}}
								/>
							</Card>
						</Col>
						<Col
							xs={{
								span: 12,
								order: 4,
							}}
							sm={{
								span: 12,
								order: 2,
							}}
						>
							<Card bordered={false}>
								<Statistic
									title="Status"
									value={
										over
											? "Game Over"
											: players.length === 2
											? game.inCheck()
												? "Check"
												: "Active"
											: "Waiting"
									}
									valueStyle={{
										color: over
											? "#cf1322"
											: players.length !== 2 ||
											game.inCheck()
											? token.colorWarningText
											: "#3f8600",
									}}
									// prefix={<ArrowUpOutlined />}
								/>
							</Card>
						</Col>
						<Col
							xs={{
								span: 12,
								order: 5,
							}}
							sm={{
								span: 12,
								order: 3,
							}}
						>
							<Card bordered={false}>
								<Statistic
									title="Current Turn"
									value={
										game.turn() === "w" ? "White" : "Black"
									}
									valueStyle={{
										color: token.colorPrimaryText,
									}}
									prefix={
										game.turn() === "w" ? (
											<img src={white} height={24} />
										) : (
											<img src={black} height={24} />
										)
									}
								/>
							</Card>
						</Col>
						<Col
							xs={{
								span: 24,
								order: 1,
							}}
							sm={{
								span: 24,
								order: 4,
							}}
						>
							<Row>
								<Col span={12} type="flex" align="middle">
									<Button
										size="large"
										onClick={() =>
											navigator.clipboard.writeText(
												location.href
											)
										}
									>
										<ShareAltOutlined />
										Game Link
									</Button>
								</Col>
								<Col span={12} type="flex" align="middle">
									<Button
										size="large"
										onClick={() => {
											const link = location.href;
											let linkArray = link.split("/");
											linkArray[5] = "view";
											console.log(linkArray);
											navigator.clipboard.writeText(
												linkArray.join("/")
											);
										}}
									>
										<EyeOutlined />
										View Link
									</Button>
								</Col>
							</Row>
						</Col>
						<Col
							xs={{
								span: 24,
								order: 2,
							}}
							sm={{
								span: 24,
								order: 5,
							}}
							type="flex"
							align="middle"
						>
							{/* <Space wrap> */}
							<Row justify="space-around" wrap>
								<Col type="flex" align="middle">
									<Button
										type="primary"
										onClick={() => {
											if (playMatch && !over) {
												socket.emit("closeRoom", {
													roomId: room,
												});
											}
											handleCleanup();
											hashNavigate("/");
										}}
									>
										{playMatch && !over ? "Quit" : "Exit"}
									</Button>
								</Col>
							</Row>
						</Col>
					</Row>
				</>
			</Col>
			<Col
				xs={{
					span: 24,
					offset: 0,
					// order: 1,
				}}
				md={{
					span: 24,
					offset: 0,
				}}
				xl={{
					span: 12,
					offset: 0,
					order: 2,
				}}
			>
				<>
					<div style={boardWrapper}>
						{room && (
							<Chessboard
								id="ClickToMove"
								animationDuration={200}
								boardOrientation={orientation}
								arePiecesDraggable={false}
								position={fen}
								onSquareClick={onSquareClick}
								onPromotionPieceSelect={onPromotionPieceSelect}
								customBoardStyle={{
									borderRadius: "4px",
									boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
								}}
								customSquareStyles={{
									...moveSquares,
									...optionSquares,
								}}
								promotionToSquare={moveTo}
								showPromotionDialog={showPromotionDialog}
							/>
						)}
					</div>
				</>
			</Col>
			<Col
				xs={{
					span: 24,
					offset: 0,
					// order: 3,
				}}
				md={{
					span: 24,
					offset: 0,
				}}
				xl={{
					span: 6,
					offset: 0,
					order: 1,
				}}
			>
				{/* <Card bordered={false}> */}
				<Row gutter={[16, 16]}>
					<Col
						xs={{
							span: 24,
							offset: 0,
						}}
						md={{
							span: 12,
							offset: 0,
						}}
						xl={{
							span: 24,
							offset: 0,
						}}
					>
						<List
							header={
								<Typography.Title
									style={{ marginTop: 12 }}
									level={5}
								>
									Players
								</Typography.Title>
							}
							// pagination={{
							// 	pageSize: 2,
							// 	size: "small",
							// }}
							bordered
							dataSource={players}
							renderItem={(player) => (
								<List.Item>
									<Typography.Text
										target="_blank"
										// onClick={() => {
										// 	hashNavigate(`/single/${item}`);
										// 	loadLocalGame(item);
										// }}
									>
										{player.username
											? player.username
											: player.id}
									</Typography.Text>
									{/* 
									<Button
										size="small"
										onClick={() => {
											localStorage.removeItem(item);
											setLocalSavedGames(
												Object.keys(localStorage)
											);
										}}
									> */}
									{/* <DeleteOutlined /> */}
									{/* </Button> */}
								</List.Item>
							)}
						/>
					</Col>
					<Col
						xs={{
							span: 24,
							offset: 0,
						}}
						md={{
							span: 12,
							offset: 0,
						}}
						xl={{
							span: 24,
							offset: 0,
						}}
					>
						<List
							header={
								<Typography.Title
									style={{ marginTop: 12 }}
									level={5}
								>
									Viewers
								</Typography.Title>
							}
							pagination={{
								pageSize: 4,
								size: "small",
							}}
							bordered
							// dataSource={localSavedGames}
							renderItem={(item) => (
								<List.Item>
									<Typography.Text
										target="_blank"
										// onClick={() => {
										// 	hashNavigate(`/single/${item}`);
										// 	loadLocalGame(item);
										// }}
									>
										{item}
									</Typography.Text>
								</List.Item>
							)}
						/>
					</Col>
				</Row>
			</Col>
		</Row>

		// <>
		// 	<Typography.Title level={3}>
		// 		{!over
		// 			? params.mode === "play"
		// 				? players.length === 2
		// 					? `Play Mode: Started.\nYour Color: ${orientation} | Current Turn: ${
		// 							game.turn() === "w" ? "white" : "black"
		// 					}`
		// 					: "Play Mode: Waiting for Opponent to join"
		// 				: players.length === 2
		// 				? `View Mode: Started.\nCurrent Turn: ${
		// 						game.turn() === "w" ? "white" : "black"
		// 				}`
		// 				: "View Mode: Waiting for Opponent to join"
		// 			: `Game Over! ${over}`}
		// 	</Typography.Title>
		// 	<div style={boardWrapper}>
		// 		<Chessboard
		// 			id="ClickToMove"
		// 			animationDuration={200}
		// 			boardOrientation={orientation}
		// 			arePiecesDraggable={false}
		// 			position={fen}
		// 			onSquareClick={onSquareClick}
		// 			onPromotionPieceSelect={onPromotionPieceSelect}
		// 			customBoardStyle={{
		// 				borderRadius: "4px",
		// 				boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
		// 			}}
		// 			customSquareStyles={{
		// 				...moveSquares,
		// 				...optionSquares,
		// 			}}
		// 			promotionToSquare={moveTo}
		// 			showPromotionDialog={showPromotionDialog}
		// 		/>
		// 		<Space style={{ marginTop: 24 }} wrap>
		// 			<Button
		// 				type="primary"
		// 				onClick={() => {
		// 					if (params.mode === "play") {
		// 						socket.emit("closeRoom", { roomId: room });
		// 					}
		// 					handleCleanup();
		// 					hashNavigate("/");
		// 				}}
		// 			>
		// 				{params.mode === "play" ? "Quit" : "Exit"}
		// 			</Button>
		// 		</Space>
		// 	</div>
		// </>
	);
}

LiveGame.propTypes = {
	room: PropTypes.string,
	players: PropTypes.array,
	orientation: PropTypes.string,
	firstPlayer: PropTypes.bool,
	handleRoomChange: PropTypes.func,
	handlePlayersChange: PropTypes.func,
	handleOrientationChange: PropTypes.func,
	handleFirstPlayerChange: PropTypes.func,
	handleCleanup: PropTypes.func,
};

export default LiveGame;
