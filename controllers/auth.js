require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

async function create(req, res) {
  try {
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(req.body.password, salt);
    await User.create({ ...req.body, password: hashed });
    res.status(201).json({ msg: "User created" });
  } catch (err) {
    res.status(500).json({ err });
  }
}

async function show(req, res) {
  try {
    const user = await User.findByEmail(req.body.email);
    if (!user) {
      throw new Error("No user with this email");
    }
    const authed = await bcrypt.compare(req.body.password, user.passwordDigest);
    if (!!authed) {
      const payload = {
        username: user.username,
        email: user.email,
        userID: user.id
      };
      const sendToken = (err, token) => {
        if (err) {
          throw new Error("Error in token generation");
        }
        res.status(200).json({
          success: true,
          token: "Bearer " + token
        });
      };
      jwt.sign(payload, process.env.SECRET, { expiresIn: 3600 }, sendToken);
    } else {
      throw new Error("User could not be authenticated");
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({ err });
  }
}

module.exports = { show, create };
