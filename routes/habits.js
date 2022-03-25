const express = require("express");
const router = express.Router();
const habitsController = require("../controllers/habits");

router.get("/:user_id", habitsController.show);
router.post("/", habitsController.create);
router.delete("/:habit_id", habitsController.destroy);
router.put("/:habit_id", habitsController.update);
router.patch("/:habit_id", habitsController.update);
router.get("/hab_id/:habit_id", habitsController.showHab);

module.exports = router;
