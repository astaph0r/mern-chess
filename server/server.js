// const { v4: uuidV4 } = require("uuid");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = {
	origin: "*",
	credentials: true, //access-control-allow-credentials:true
	optionSuccessStatus: 200,
};

const { createServer } = require("http");
const { socketServer } = require("./sockets/");
const session = require("express-session");
// const { Server } = require("socket.io");
const routes = require("./routes/");
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });
const passport = require("passport");
require("./config/passport");

const app = express();
const httpServer = createServer(app);
// const io = new Server(httpServer, {
// 	cors: {
// 		origin: "http://localhost:5173",
// 	},
// });

socketServer(httpServer);

const PORT = process.env.PORT || 3000;

mongoose
	.connect(
		process.env.DATABASE,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		{ useFindAndModify: false }
	)
	.then(() => console.log("Connected to MongoDB"))
	.catch("error", (err) => {
		console.log("Couldn't connect to MongoDB", err.message);
	});

app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true, //access-control-allow-credentials:true
		optionSuccessStatus: 200,
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: true,
		proxy: true
		// cookie: { secure: false }
	})
);
app.use(passport.initialize());
app.use(passport.session());

// router.use((req, res, next) => {
// 	// router middleware
// 	res.header("Access-Control-Allow-Origin", ORIGIN || "*");
// 	next();
// });

app.use("/api", routes);



if (process.env.NODE_ENV === "prod") {
	app.use(express.static(path.join(__dirname, "../client/build")));
  
	app.get("*", (req, res) => {
	  res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
	});
  }

// const rooms = new Map();

// io.on("connection", (socket) => {
// 	console.log(socket.id, "connected");

// 	socket.on("createRoom", async (callback) => {
// 		try {
// 			const roomId = uuidV4();
// 			const viewId = uuidV4();
// 			await socket.join(roomId);
// 			rooms.set(roomId, {
// 				roomId,
// 				viewId,
// 				players: [{ id: socket.id, username: socket.data?.username }],
// 			});
// 			callback(rooms.get(roomId));
// 		} catch (error) {
// 			console.log(error.message);
// 		}
// 	});

// 	socket.on("joinPlayRoom", async (args, callback) => {
// 		try {
// 			const room = rooms.get(args.roomId);
// 			let error, message;

// 			if (!room) {
// 				error = true;
// 				message = "room does not exist";
// 			} else if (
// 				room.players.filter((e) => e.id === socket.id).length > 0
// 			) {
// 				error = true;
// 				message = "already a player";
// 			} else if (room.players.length >= 2) {
// 				error = true;
// 				message = "room is full";
// 			}

// 			if (error) {
// 				if (callback) {
// 					callback({
// 						error,
// 						message,
// 					});
// 				}

// 				return;
// 			}

// 			await socket.join(args.roomId);

// 			const roomUpdate = {
// 				...room,
// 				players: [
// 					...room.players,
// 					{ id: socket.id, username: socket.data?.username },
// 				],
// 			};

// 			rooms.set(args.roomId, roomUpdate);

// 			callback(roomUpdate);
// 			socket.to(args.roomId).emit("opponentJoined", roomUpdate);
// 			socket.to(roomUpdate.viewId).emit("opponentJoined", roomUpdate);
// 		} catch (error) {
// 			console.log(error.message);
// 		}
// 	});

// 	socket.on("joinViewRoom", async (args, callback) => {
// 		try {
// 			const room = rooms.get(args.roomId);
// 			let error, message;

// 			if (!room) {
// 				error = true;
// 				message = "room does not exist";
// 			}

// 			if (error) {
// 				if (callback) {
// 					callback({
// 						error,
// 						message,
// 					});
// 				}

// 				return;
// 			}
// 			await socket.join(room.viewId);

// 			callback(room);
// 		} catch (error) {
// 			console.log(error.message);
// 		}
// 	});

// 	socket.on("move", (data) => {
// 		try {
// 			const room = rooms.get(data.room);
// 			socket.to(room.roomId).emit("move", data.move);
// 			socket.to(room.viewId).emit("move", data.move);
// 		} catch (error) {
// 			console.log(error.message);
// 		}
// 	});

// 	socket.on("disconnect", () => {
// 		try {
// 			const gameRooms = Array.from(rooms.values());
// 			console.log("gameRooms", gameRooms);
// 			gameRooms.forEach((room) => {
// 				const userInRoom = room.players.find(
// 					(player) => player.id === socket.id
// 				);
// 				if (userInRoom) {
// 					socket
// 						.to(room.roomId)
// 						.emit("playerDisconnected", userInRoom); // <- 4
// 					socket
// 						.to(room.viewId)
// 						.emit("playerDisconnected", userInRoom);
// 				}
// 			});
// 		} catch (error) {
// 			console.log(error.message);
// 		}
// 	});
// 	socket.on("closeRoom", async (data) => {
// 		try {
// 			const room = rooms.get(data.roomId);
// 			socket
// 				.to(data.roomId)
// 				.emit("closeRoom", { roomId: room.roomId, player: socket.id });
// 			socket
// 				.to(room.viewId)
// 				.emit("closeRoom", { roomId: room.viewId, player: socket.id });

// 			const playSockets = await io.in(room.roomId).fetchSockets();
// 			const viewSockets = await io.in(room.viewId).fetchSockets();

// 			playSockets.forEach((s) => {
// 				s.leave(data.roomId);
// 			});

// 			viewSockets.forEach((s) => {
// 				s.leave(viewId);
// 			});

// 			rooms.delete(data.roomId);
// 		} catch (error) {
// 			console.log(error.message);
// 		}
// 	});
// });

httpServer.listen(PORT, () => {
	console.log(
		`mern-chess server is listening.\nLocal: http://localhost:${PORT}`
	);
});
