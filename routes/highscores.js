const express = require("express");
const router = express.Router();
const highscoresController = require("../controllers/highscores");

router.get("/:user_id", highscoresController.show);
router.post("/", highscoresController.create);
router.delete("/:highscore_id", highscoresController.destroy);
router.put("/:highscore_id", highscoresController.update);
router.patch("/:highscore_id", highscoresController.update);
router.get("/hab_id/:highscore_id", highscoresController.showHab);

module.exports = router;
