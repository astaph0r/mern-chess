const router = require("express").Router();
const mongoose = require("mongoose");
const SavedGame =require("../model/SavedGame");

router.get("/savedgame/all", async (req, res) => {
	try {
        const savedGames = await SavedGame.find({}).limit(100)
        .sort({ createdAt: -1 });
		res.status(200).send({ savedGames });
	} catch (error) {
		console.log("Error:", error.message);
        res.status(500)
	}
});

router.get("/savedgame/:gameId", async (req, res) => {
	try {
		const savedGame = await SavedGame.find({ gameId: req.params.gameId });

		res.status(200).send(savedGame);
	} catch (error) {
		console.log("Error:", error.message);
        res.status(500)
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
        res.status(500)
	}
});



module.exports = router;