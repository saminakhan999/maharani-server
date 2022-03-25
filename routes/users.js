const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");
const { verifyToken } = require("../middleware/auth");
const User = require("../models/user");

router.get("/", verifyToken, usersController.index);
router.get("/:id", usersController.show);
router.get("/:id/highscores", async (req, res) => {
  try {
    const user = await User.findById(parseInt(req.params.id));
    const highscores = await user.highscores;
    res.json(highscores);
  } catch (err) {
    res.status(404).send({ err });
  }
});

module.exports = router;
