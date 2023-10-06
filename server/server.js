const { v4: uuidV4 } = require("uuid");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const routes = require('./routes/');
const mongoose = require("mongoose")
require('dotenv').config({ path: '.env.local' });
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:5173",
	},
});

const PORT = process.env.PORT || 3000;



mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useUnifiedTopology : true}, { useFindAndModify: false})
.then(() => console.log('Connected to MongoDB'))
.catch('error', (err) => {
  console.log("Couldn't connect to MongoDB", err.message);
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// router.use((req, res, next) => {
// 	// router middleware
// 	res.header("Access-Control-Allow-Origin", ORIGIN || "*");
// 	next();
// });


app.use("/api", routes);

const rooms = new Map();

io.on("connection", (socket) => {
	console.log(socket.id, "connected");

	socket.on("createRoom", async (callback) => {
		const roomId = uuidV4();
		const viewId = uuidV4();
		await socket.join(roomId);
		rooms.set(roomId, {
			roomId,
			viewId,
			players: [{ id: socket.id, username: socket.data?.username }],
		});
		callback(rooms.get(roomId));
	});

	socket.on("joinPlayRoom", async (args, callback) => {
		const room = rooms.get(args.roomId);
		let error, message;

		if (!room) {
			error = true;
			message = "room does not exist";
		} else if (room.players.filter((e) => e.id === socket.id).length > 0) {
			error = true;
			message = "already a player";
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
				{ id: socket.id, username: socket.data?.username },
			],
		};

		rooms.set(args.roomId, roomUpdate);

		callback(roomUpdate);
		socket.to(args.roomId).emit("opponentJoined", roomUpdate);
		socket.to(roomUpdate.viewId).emit("opponentJoined", roomUpdate);
	});

	socket.on("joinViewRoom", async (args, callback) => {
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



		callback(room);
	});

	socket.on("move", (data) => {
		const room = rooms.get(data.room);
		socket.to(room.roomId).emit("move", data.move);
		socket.to(room.viewId).emit("move", data.move);
	});

	socket.on("disconnect", () => {
		const gameRooms = Array.from(rooms.values());
		console.log("gameRooms", gameRooms);
		gameRooms.forEach((room) => {
			const userInRoom = room.players.find(
				(player) => player.id === socket.id
			);
			if (userInRoom) {
				socket.to(room.roomId).emit("playerDisconnected", userInRoom); // <- 4
				socket.to(room.viewId).emit("playerDisconnected", userInRoom);
			}
		});
	});
	socket.on("closeRoom", async (data) => {
		const viewId = rooms.get(data.roomId).viewId;
		socket.to(data.roomId).emit("closeRoom", {roomId: data.roomId, player: socket.id});
		socket.to(viewId).emit("closeRoom", { roomId: viewId });

		const playSockets = await io.in(data.roomId).fetchSockets();
		const viewSockets = await io.in(viewId).fetchSockets();

		playSockets.forEach((s) => {
			s.leave(data.roomId);
		});

		viewSockets.forEach((s) => {
			s.leave(viewId);
		});

		rooms.delete(data.roomId);
	});
});

httpServer.listen(PORT, () => {
	console.log(
		`mern-chess server is listening.\nLocal: http://localhost:${PORT}`
	);
});
