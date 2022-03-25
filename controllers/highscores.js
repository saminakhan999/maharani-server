const Highscore = require("../models/Highscore");

async function show(req, res) {
  try {
    const highscores = await Highscore.findByUser(req.params.user_id);
    res.status(200).json(highscores);
  } catch (err) {
    res.status(404).json({ err });
  }
}

async function showHigh(req, res) {
  try {
    const highscore = await Highscore.findByHighscore(req.params.highscore_id);
    res.status(200).json(highscore);
  } catch (err) {
    res.status(404).json({ err });
  }
}

async function create(req, res) {
  try {
    const highscores = await Highscore.newHighscore(req.body);
    res.status(201).json(highscores);
  } catch (err) {
    res.status(422).json({ err });
  }
}

async function destroy(req, res) {
  try {
    await Highscore.destroyHighscore(req.params.highscore_id);
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ err });
  }
}

async function update(req, res) {
  try {
    const highscore = await Highscore.findByHighscore(req.params.highscore_id);
    highscore.updateHighscore(req.body);
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ err });
  }
}

module.exports = { show, create, destroy, update, showHigh };
