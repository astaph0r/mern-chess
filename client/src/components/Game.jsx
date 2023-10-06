import PropTypes from "prop-types";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useState, useMemo, useCallback, useEffect } from "react";
import socket from "./socket-client";
import { Space, Button, Typography } from "antd";
import useHashLocation from "../hooks/useHashLocation";
import { useRoute } from "wouter";


const boardWrapper = {
	width: "83vw",
	maxWidth: "70vh",
	margin: "1rem auto",
};

function Game({
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

	const [match, params] = useRoute("/game/:mode/:gameId");

	const [, hashNavigate] = useHashLocation();
	useEffect(() => {
		console.log(match, params);
	
		console.log(firstPlayer);
		if (!firstPlayer && params.mode === "play") {
			socket.emit("joinPlayRoom", { roomId: params.gameId }, (r) => {
				
				if (r.error) return console.log(r.message);
				console.log("response:", r);
				handleRoomChange(r?.roomId); 
				handlePlayersChange(r?.players); 
				handleOrientationChange("black");
			});
		}
		if (params.mode === "view") {
			socket.emit("joinViewRoom", { roomId: params.gameId }, (r) => {
				if (r.error) return console.log(r.message);
				console.log("response:", r);
				handleRoomChange(r?.roomId);
								handlePlayersChange(r?.players);
			});
		}
		handleFirstPlayerChange(false);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		

		socket.on("opponentJoined", (roomData) => {
			console.log("roomData", roomData);
			handlePlayersChange(roomData.players);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		socket.on("playerDisconnected", (player) => {
			console.log(player);
			setOver(`${player.id} has disconnected`);
		});
	}, []);

	useEffect(() => {
		socket.on("closeRoom", ({ roomId, player }) => {
			console.log("closeRoom", roomId, room);
			if (roomId === room) {
				setOver(`${player} has disconnected`)
				handleCleanup();
			}
		});
	}, [room, handleCleanup]);

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
		socket.on("move", (move) => {
			makeAMove(move);
		});
	}, [makeAMove]);

	const onSquareClick = (square) => {
		try {
			if (params.mode === "view") return false;
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
		<>
			<Typography.Title level={3}>
				{!over
					? params.mode === "play"
						? players.length === 2
							? `Play Mode: Started.\nYour Color: ${orientation} | Current Turn: ${
									game.turn() === "w" ? "white" : "black"
							}`
							: "Play Mode: Waiting for Opponent to join"
						: players.length === 2
						? `View Mode: Started.\nCurrent Turn: ${
								game.turn() === "w" ? "white" : "black"
						}`
						: "View Mode: Waiting for Opponent to join"
					: `Game Over! ${over}`}
			</Typography.Title>
			<div style={boardWrapper}>
				<Chessboard
					id="ClickToMove"
					animationDuration={200}
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
				<Space style={{ marginTop: 24 }} wrap>
							<Button
								type="primary"
								onClick={() => {
									socket.emit("closeRoom", { roomId: room });
									handleCleanup();
									hashNavigate("/");
								}}
							>
							{params.mode === "play" ? "Quit" : "Exit"}
							</Button>
				</Space>
			</div>
		</>
	);
}

Game.propTypes = {
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

export default Game;
