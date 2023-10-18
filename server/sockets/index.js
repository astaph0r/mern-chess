const { Server } = require("socket.io");
const { v4: uuidV4 } = require("uuid");

const socketServer = (server) => {
	const io = new Server(server, {
		cors: {
			origin: process.env.CORS,
		},
	});

	const rooms = new Map();

	io.on("connection", (socket) => {
		console.log(socket.id, "connected");

		io.emit("setLiveGames", { liveGames: Array.from(rooms.values()) });

		socket.on("createRoom", async (args, callback) => {
			try {
				const roomId = uuidV4();
				const viewId = uuidV4();
				await socket.join(roomId);
				rooms.set(roomId, {
					roomId,
					viewId,
					// fen: null,
					players: [{ id: socket.id, username: args?.username }],
				});
				io.emit("setLiveGames", {
					liveGames: Array.from(rooms.values()),
				});
				callback(rooms.get(roomId));
			} catch (error) {
				console.log(error);
			}
		});

		socket.on("joinPlayRoom", async (args, callback) => {
			try {
				// console.log("plaroomjoin");
				const room = rooms.get(args.roomId);
				let error, message;

				if (!room) {
					error = true;
					message = "room does not exist";
				} else if (
					room.players.filter((e) => e.id === socket.id).length > 0
				) {
					// console.log(room.players.filter((e) => e.id === socket.id))
					callback(room);
					return;
					// error = true;
					// message = "already a player";
				} else if (room.players.length >= 2) {
					error = true;
					message = "room is full";
				}

				if (error) {
					if (callback) {
						callback({
							error,
							message,
						});
					}

					return;
				}

				await socket.join(args.roomId);

				const roomUpdate = {
					...room,
					players: [
						...room.players,
						{ id: socket.id, username: args?.username },
					],
				};

				rooms.set(args.roomId, roomUpdate);

				// console.log(roomUpdate)
				callback(roomUpdate);
				io.emit("setLiveGames", {
					liveGames: Array.from(rooms.values()),
				});
				socket
					.to(room.roomId)
					.emit("opponentJoined", { roomData: roomUpdate });
				socket
					.to(room.viewId)
					.emit("opponentJoined", { roomData: roomUpdate });
			} catch (error) {
				console.log(error);
			}
		});

		socket.on("joinViewRoom", async (args, callback) => {
			try {
				// console.log("viewroomjoin");
				const room = rooms.get(args.roomId);
				let error, message;

				if (!room) {
					error = true;
					message = "room does not exist";
				}

				if (error) {
					if (callback) {
						callback({
							error,
							message,
						});
					}

					return;
				}
				await socket.join(room.viewId);
				// console.log(room);

				callback(room);
			} catch (error) {
				console.log(error);
			}
		});

		socket.on("getLiveGames", (callback) => {
			try {
				// console.log("getlivegames");
				// const gameRooms = Array.from(rooms.values());

				const liveGames = Array.from(rooms.values());
				// .filter((room) => {
				// 	if (room.players.length === 1) {
				// 		return room.roomId;
				// 	}
				// });
				// console.log(liveGames);
				callback({ liveGames });
				// socket.to(room.roomId).emit("move", { move: data.move });
				// socket
				// 	.to(room.viewId)
				// 	.emit("move", { move: data.move, fen: data.fen });
			} catch (error) {
				console.log(error);
			}
		});

		socket.on("updateFen", ({ roomId, fen }) => {
			try {
				// console.log("fenupdate");
				// console.log(roomId);
				const gameRooms = Array.from(rooms.values());

				const room = rooms.get(roomId);
				// console.log(room.players);
				const roomUpdate = {
					...room,
					fen,
					// lastMove: data.move
				};
				rooms.set(room.roomId, roomUpdate);
				// console.log(roomUpdate);
				// socket.to(room.roomId).emit("move", data.move);
				// socket
				// 	.to(room.viewId)
				// 	.emit("move", data.move);
			} catch (error) {
				console.log(error);
			}
		});

		socket.on("move", (data) => {
			try {
				// console.log("move");
				const room = rooms.get(data.room);

				// const roomUpdate = {
				// 	...room,
				// 	fen: data.fen,
				// 	lastMove: data.move
				// };
				// rooms.set(room.roomId, roomUpdate);
				// console.log(roomUpdate);
				socket.to(room.roomId).emit("move", { move: data.move });
				socket.to(room.viewId).emit("move", { move: data.move });
			} catch (error) {
				console.log(error);
			}
		});

		socket.on("closeRoom", async (data) => {
			try {
				// console.log("closeRoom");
				const room = rooms.get(data.roomId);
				if (room) {
					const player = room.players.find(
						(player) => player.id === socket.id
					);
					// console.log(room.roomId)
					socket.to(room.roomId).emit("closeRoom", {
						roomId: room.roomId,
						player: player,
					});
					socket.to(room.viewId).emit("closeRoom", {
						roomId: room.viewId,
						player: player,
					});

					const playSockets = await io.in(room.roomId).fetchSockets();
					const viewSockets = await io.in(room.viewId).fetchSockets();

					playSockets.forEach((s) => {
						s.leave(room.roomId);
					});

					viewSockets.forEach((s) => {
						s.leave(room.viewId);
					});

					rooms.delete(room.roomId);
					io.emit("setLiveGames", {
						liveGames: Array.from(rooms.values()),
					});
				}
			} catch (error) {
				console.log(error);
			}
		});

		socket.on("disconnect", () => {
			try {
				// console.log("disconnect");
				const gameRooms = Array.from(rooms.values());
				// console.log("gameRooms", gameRooms);
				gameRooms.forEach(async (room) => {
					const player = room.players.find(
						(player) => player.id === socket.id
					);
					if (player) {
						socket.to(room.roomId).emit("playerDisconnected", {
							roomId: room.viewId,
							player: player,
						}); // <- 4
						socket.to(room.viewId).emit("playerDisconnected", {
							roomId: room.viewId,
							player: player,
						});

						const playSockets = await io
							.in(room.roomId)
							.fetchSockets();
						const viewSockets = await io
							.in(room.viewId)
							.fetchSockets();

						playSockets.forEach((s) => {
							s.leave(room.roomId);
						});

						viewSockets.forEach((s) => {
							s.leave(room.viewId);
						});

						rooms.delete(room.roomId);
						io.emit("setLiveGames", {
							liveGames: Array.from(rooms.values()),
						});
					}
				});
			} catch (error) {
				console.log(error);
			}
		});
	});
};

module.exports = {
	socketServer,
};
