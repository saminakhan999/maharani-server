const db = require("../dbConfig/init");
const {
  findSubhabits,
  findFrequency,
  frequencyDuplicates,
} = require("./helpers");

module.exports = class Habit {
  constructor(data) {
    this.name = data.name;
    this.frequency = data.frequency;
    this.complete = data.complete;
    this.streak = data.streak;
    this.subhabits = data.subhabits;
    this.habitId = data.id;
  }

  static findByUser(id) {
    return new Promise(async (resolve, reject) => {
      try {
        // get all habit data matching that user id
        let habitData = await db.query(
          `SELECT * FROM habits WHERE user_id = $1;`,
          [id]
        );
        habitData = habitData.rows;
        for (let data of habitData) {
          // get the subhabits that match the habit id
          const subData = await findSubhabits(data.id);
          if (subData.length) data.subhabits = subData;
          // get the frequency that match the habit id
          const frequencyData = await findFrequency(data.frequency_id);
          if (frequencyData.length) data.frequency = frequencyData;
        }
        let habits = habitData.map((h) => {
          return new Habit(h);
        });
        resolve(habits);
      } catch (err) {
        reject("User not found");
      }
    });
  }

  static findByHabit(id) {
    return new Promise(async (resolve, reject) => {
      try {
        // get all habit data matching that user id
        let habitData = await db.query(`SELECT * FROM habits WHERE id = $1;`, [
          id,
        ]);
        habitData = habitData.rows[0];
        // get the subhabits that match the habit id
        const subData = await findSubhabits(habitData.id);
        if (subData.length) habitData.subhabits = subData;
        // get the frequency that match the habit id
        const frequencyData = await findFrequency(habitData.frequency_id);
        if (frequencyData.length) habitData.frequency = frequencyData;
        const habit = new Habit(habitData);
        resolve(habit);
      } catch (err) {
        reject("Habit not found");
      }
    });
  }

  static async newHabit(habitData) {
    return new Promise(async (resolve, reject) => {
      try {
        const { name, frequency, username, subhabits } = habitData;
        // Check to see if a frequency matching the new habit frequency exists
        const frequency_id = await frequencyDuplicates(frequency);
        // set complete and streak to false as its a new habit
        const complete = 0;
        const streak = 0;
        // find the user id that matches the username
        let user_id = await db.query(
          `SELECT id FROM users WHERE username = $1;`,
          [username]
        );
        user_id = user_id.rows[0].id;
        // Store the new habit in the DB and return the id
        let habit_id = await db.query(
          `INSERT INTO habits (name, frequency_id, complete, streak, user_id)
           VALUES ($1, $2, $3, $4, $5) RETURNING id;`,
          [name, frequency_id, complete, streak, user_id]
        );
        habit_id = habit_id.rows[0].id;
        // If there are any subhabits add them to the DB
        if (subhabits) {
          for (let subhabit of subhabits) {
            await db.query(
              `INSERT INTO subhabits (name, complete, habit_id)
             VALUES ($1, $2, $3);`,
              [subhabit.name, subhabit.complete, habit_id]
            );
          }
        }
        // Return all habits for the user
        resolve(this.findByUser(user_id));
      } catch (err) {
        reject(err);
      }
    });
  }

  static destroyHabit(id) {
    return new Promise(async (resolve, reject) => {
      try {
        await db.query("DELETE FROM habits WHERE id = $1", [id]);
        resolve("Habit was deleted");
      } catch (err) {
        reject("Habit could not be deleted");
      }
    });
  }

  updateHabit(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const { name, frequency, subhabits, complete, streak } = data;
        if (name) this.name = name;
        if (streak || streak === 0) this.streak = streak;
        if (complete) this.complete = Date.now();
        if (complete === "100") this.complete = 0;
        if (frequency) this.frequency = frequency;

        const frequency_id = await frequencyDuplicates(this.frequency);
        // Delete any existing subhabits then create new ones
        if (subhabits) {
          await db.query(`DELETE FROM subhabits WHERE habit_id = $1;`, [
            this.habitId,
          ]);
          for (let subhabit of subhabits) {
            try {
              await db.query(
                `INSERT INTO subhabits (name, complete, habit_id)
             VALUES ($1, $2, $3);`,
                [subhabit.name, subhabit.complete, this.habitId]
              );
            } catch (err) {
              console.warn(err);
            }
          }
        }
        // update the habits
        db.query(
          `UPDATE habits
            SET name = $1,
                frequency_id = $2,
                complete = $3,
                streak = $4
            WHERE id = $5;`,
          [this.name, frequency_id, this.complete, this.streak, this.habitId]
        );

        resolve("Habit updated");
      } catch (err) {
        reject("Habit cannot be updated");
      }
    });
  }
};
