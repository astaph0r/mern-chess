const router = require("express").Router();
const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const SavedGame = require("../model/SavedGame");
const User = require("../model/User");

router.post("/register", async (req, res) => {
	try {
		const { username, email, password } = req.body;
		const emailExists = await User.findOne({ email });
		if (emailExists) {
			return res
				.status(StatusCodes.CONFLICT)
				.json({ error: "email is already registered" });
		}
		const usernameExists = await User.findOne({ username });
		if (usernameExists) {
			return res
				.status(StatusCodes.CONFLICT)
				.json({ error: "username unavailable" });
		}

		bcrypt.genSalt(10, (err, salt) => {
			if (err) {
				return console.log(err);
			}

			bcrypt.hash(password, salt, async (err, hash) => {
				if (err) {
					return console.log(err);
				}
				const newUser = await new User({
					email,
					username,
					password: hash,
				}).save();
				return res
					.status(StatusCodes.CREATED)
					.json({ message: "Registered Successfully." });
			});
		});
	} catch (error) {
		console.log("Error:", error.message);
		return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ error: ReasonPhrases.INTERNAL_SERVER_ERROR });
	}
});

router.post(
	"/login",
	function (req, res, next) {
		passport.authenticate("local", function (err, user, info) {
			if (err) {
				return res
					.status(StatusCodes.INTERNAL_SERVER_ERROR)
					.json({ error: ReasonPhrases.INTERNAL_SERVER_ERROR });
			}
			if (!user) {
				return res
					.status(StatusCodes.UNAUTHORIZED)
					.json({ error: "username or password is incorrect" });
			}
			req.logIn(user, function (err) {
				if (err) {
					return res
						.status(StatusCodes.UNAUTHORIZED)
						.json({ error: "username or password is incorrect" });
				}
				return res.status(StatusCodes.OK).json({
					email: req.user.email,
					username: req.user.username,
				});
			});
		})(req, res, next);
	}
	// function (req, res) {
	// 	var temp = req.session.passport; // {user: 1}
	// 	console.log(temp)
	// 	req.session.regenerate(function (err) {
	// 		//req.session.passport is now undefined
	// 		req.session.passport = temp;
	// 		req.session.save(function (err) {
	// 			res.send(200);
	// 		});
	// 	});
	// }
	// passport.authenticate("local"),
	// (req, res, next) => {
	// 	// Handle success
	// 	if (req.user) {
	// 		return res.status(StatusCodes.OK).send({
	// 			email: req.user.email,
	// 			username: req.user.username,
	// 		});
	// 	}
	// 	console.log(req.authInfo);
	// 	return res
	// 		.status(StatusCodes.UNAUTHORIZED)
	// 		.send({ error: "username or password is incorrect" });
	// },
	// (err, req, res, next) => {
	// 	// Handle error
	// 	console.log(err)
	// 	return res
	// 		.status(StatusCodes.INTERNAL_SERVER_ERROR)
	// 		.send({ error: ReasonPhrases.INTERNAL_SERVER_ERROR });
	// }
	// (req, res) => {
	// 	try {
	// 		// do something with req.user
	// 		console.log(req.user);
	// 		if (req.user) {
	// 			console.log(req.user);
	// 			return res.status(StatusCodes.OK).send({
	// 				email: req.user.email,
	// 				username: req.user.username,
	// 			});
	// 		}
	// 		console.log("2");
	// 		return res
	// 			.status(StatusCodes.UNAUTHORIZED)
	// 			.json({ error: "username or password is incorrect" });
	// 	} catch (error) {
	// 		console.log("Error:", error.message);
	// 		return res
	// 			.status(StatusCodes.INTERNAL_SERVER_ERROR)
	// 			.json({ error: ReasonPhrases.INTERNAL_SERVER_ERROR });
	// 	}
	// }
);

router.delete("/logout", (req, res, next) => {
	try {
		console.log(req.isAuthenticated());
		console.log(req.user);
		if (!req.isAuthenticated()) {
			console.log("failed");
			return res
				.status(StatusCodes.UNAUTHORIZED)
				.json({ error: "logout failed." });
		}

		req.logout();
		req.session.destroy((err) => {
			res.clearCookie("connect.sid");
			// Don't redirect, just print text

			console.log("logout");
			return res.status(StatusCodes.OK).json({
				message: "Logout Successful.",
			});
		});
	} catch (error) {
		console.log("Error:", error.message);
		return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ error: ReasonPhrases.INTERNAL_SERVER_ERROR });
	}
});

router.get("/getUser", (req, res) => {
	try {
		if (!req.isAuthenticated()) {
			return res
				.status(StatusCodes.UNAUTHORIZED)
				.json({ error: "user not logged in" });
		}
		return res.status(StatusCodes.OK).json({
			email: req.user.email,
			username: req.user.username,
		});
	} catch (error) {
		console.log("Error:", error.message);
		return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ error: ReasonPhrases.INTERNAL_SERVER_ERROR });
	}
});

router.get("/savedgame/all", async (req, res) => {
	try {
		const savedGames = await SavedGame.find({})
			.limit(100)
			.sort({ createdAt: -1 });
		res.status(200).send({ savedGames });
	} catch (error) {
		console.log("Error:", error.message);
		return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ error: ReasonPhrases.INTERNAL_SERVER_ERROR });
	}
});

router.get("/savedgame/:gameId", async (req, res) => {
	try {
		const savedGame = await SavedGame.find({ gameId: req.params.gameId });

		res.status(200).send(savedGame);
	} catch (error) {
		console.log("Error:", error.message);
		return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ error: ReasonPhrases.INTERNAL_SERVER_ERROR });
	}
});

router.post("/savedgame/:gameId", async (req, res) => {
	try {
		const { gameId, fen } = req.body;
		const newSavedGame = new SavedGame({
			gameId,
			fen,
		});

		newSavedGame.save();

		res.status(200);
	} catch (error) {
		console.log("Error:", error.message);
		return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ error: ReasonPhrases.INTERNAL_SERVER_ERROR });
	}
});

module.exports = router;
