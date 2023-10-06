import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useRoute } from "wouter";
import useHashLocation from "../hooks/useHashLocation";
import { Col, Row, List, Space, Button, Typography } from "antd";

const boardWrapper = {
	width: "83vw",
	maxWidth: "70vh",
	margin: "1rem auto",
};

function SingleGame() {
	const game = useMemo(() => new Chess(), []); // <- 1
	const [fen, setFen] = useState(game.fen());
	const [over, setOver] = useState("");
	const [moveFrom, setMoveFrom] = useState(null);
	const [moveTo, setMoveTo] = useState(null);
	const [showPromotionDialog, setShowPromotionDialog] = useState(false);
	const [moveSquares, setMoveSquares] = useState({});
	const [optionSquares, setOptionSquares] = useState({});

	const [, params] = useRoute("/single/:gameId");

	const [, hashNavigate] = useHashLocation();
	const [localSavedGames, setLocalSavedGames] = useState([]);
	// const [cloudSavedGames, setCloudSavedGames] = useState([]);

	useEffect(() => {
		setLocalSavedGames(Object.keys(localStorage));
		if (Object.keys(localStorage).includes(params.gameId)) {
			loadLocalGame(params.gameId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadLocalGame = (key) => {
		game.load(localStorage.getItem(key));
		setFen(game.fen());
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

	function getMoveOptions(square) {
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
	}

	function onSquareClick(square) {
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
				console.log("8");
				const hasMoveOptions = getMoveOptions(square);
				if (hasMoveOptions) setMoveFrom(square);
				return;
			}
			setMoveFrom(null);
			setMoveTo(null);
			setOptionSquares({});
			return;
		}
	}

	function onPromotionPieceSelect(piece) {
		const moveData = {
			from: moveFrom,
			to: moveTo,
			color: game.turn(),
			promotion: piece[1].toLowerCase() ?? "q",
		};
		makeAMove(moveData);

		setMoveFrom(null);
		setMoveTo(null);
		setShowPromotionDialog(false);
		setOptionSquares({});
		return true;
	}

	return (
		<Row gutter={[16, 16]}>
			<Col span={6}>
				<Row>
					<List
						header={
							<Typography.Title
								style={{ marginTop: 12 }}
								level={5}
							>
								Saved Games (Local)
							</Typography.Title>
						}
						bordered
						dataSource={localSavedGames}
						renderItem={(item) => (
							<List.Item>
								<Typography.Link
									target="_blank"
									onClick={() => {
										hashNavigate(`/single/${item}`);
										loadLocalGame(item);
									}}
								>
									{item}
								</Typography.Link>
							</List.Item>
						)}
					/>
				</Row>
				<Row style={{ marginTop: 12 }}>
					<List
						header={
							<Typography.Title
								style={{ marginTop: 12 }}
								level={5}
							>
								Saved Games (mongoDB)
							</Typography.Title>
						}
						bordered
						dataSource={[]}
						renderItem={(item) => (
							<List.Item>
								<Typography.Link
									target="_blank"
									onClick={() => {
										hashNavigate(`/single/${item}`);
										loadLocalGame(item);
									}}
								>
									{item}
								</Typography.Link>
							</List.Item>
						)}
					/>
				</Row>
			</Col>
			<Col span={12}>
				<>
					<Typography.Title level={3}>
						{!over
							? `Single Player Game | Current Turn: ${
									game.turn() === "w" ? "white" : "black"
							}`
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
									hashNavigate("/");
								}}
							>
								Home
							</Button>
							<Button
								type="primary"
								onClick={() => {
									game.reset();
									setFen(game.fen());
									setMoveSquares({});
									setOptionSquares({});
								}}
							>
								Reset
							</Button>
							<Button
								type="primary"
								onClick={() => {
									localStorage.setItem(
										params.gameId,
										game.fen()
									);
									console.log("saved game to localStorage");
									setLocalSavedGames(
										Object.keys(localStorage)
									);
								}}
							>
								Save (Local)
							</Button>
						</Space>
					</div>
				</>
			</Col>
		</Row>
	);
}

export default SingleGame;
