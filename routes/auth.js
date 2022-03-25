const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");


router.post("/login", authController.show);
router.post("/register", authController.create);


module.exports = router;
