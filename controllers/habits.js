const Habit = require("../models/Habit");

async function show(req, res) {
  try {
    const habits = await Habit.findByUser(req.params.user_id);
    res.status(200).json(habits);
  } catch (err) {
    res.status(404).json({ err });
  }
}

async function showHab(req, res) {
  try {
    const habit = await Habit.findByHabit(req.params.habit_id);
    res.status(200).json(habit);
  } catch (err) {
    res.status(404).json({ err });
  }
}

async function create(req, res) {
  try {
    const habits = await Habit.newHabit(req.body);
    res.status(201).json(habits);
  } catch (err) {
    res.status(422).json({ err });
  }
}

async function destroy(req, res) {
  try {
    await Habit.destroyHabit(req.params.habit_id);
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ err });
  }
}

async function update(req, res) {
  try {
    const habit = await Habit.findByHabit(req.params.habit_id);
    habit.updateHabit(req.body);
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ err });
  }
}

module.exports = { show, create, destroy, update, showHab };
