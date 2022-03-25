const db = require("../dbConfig/init");
const {
  findSubhighscores,
  findFrequency,
  frequencyDuplicates,
} = require("./helpers");


const User = require("./User");

module.exports = class Highscore {
  constructor(data) {
    this.name = data.name;
    this.frequency = data.frequency;
    this.complete = data.complete;
    this.streak = data.streak;
    this.subhighscores = data.subhighscores;
    this.highscoreId = data.id;
    this.id = data.id;
    this.game = data.game;
    this.score = data.score;
    this.username = data.username;
  }

  // static get all() {
  //   return new Promise(async (res, rej) => {
  //     try {
  //       let result =
  //         await db.query(`SELECT highscores.*, users.username as username
  //                                                   FROM highscores 
  //                                                   JOIN users ON highscores.user_id = users.id;`);
  //       let highscores = result.rows.map((r) => new Highscore(r));
  //       res(highscores);
  //     } catch (err) {
  //       rej(`Error retrieving highscores: ${err}`);
  //     }
  //   });
  // }

  static findByUser(id) {
    return new Promise(async (resolve, reject) => {
      try {
        // get all highscore data matching that user id
        let highscoreData = await db.query(
          `SELECT * FROM highscores WHERE user_id = $1;`,
          [id]
        );
        highscoreData = highscoreData.rows;
        for (let data of highscoreData) {
          // get the subhighscores that match the highscore id
          const subData = await findSubhighscores(data.id);
          if (subData.length) data.subhighscores = subData;
          // get the frequency that match the highscore id
          const frequencyData = await findFrequency(data.frequency_id);
          if (frequencyData.length) data.frequency = frequencyData;
        }
        let highscores = highscoreData.map((h) => {
          return new Highscore(h);
        });
        resolve(highscores);
      } catch (err) {
        reject("User not found");
      }
    });
  }

  static findByHighscore(id) {
    return new Promise(async (resolve, reject) => {
      try {
        // get all highscore data matching that user id
        let highscoreData = await db.query(
          `SELECT * FROM highscores WHERE id = $1;`,
          [id]
        );
        highscoreData = highscoreData.rows[0];
        // get the subhighscores that match the highscore id
        const subData = await findSubhighscores(highscoreData.id);
        if (subData.length) highscoreData.subhighscores = subData;
        // get the frequency that match the highscore id
        const frequencyData = await findFrequency(highscoreData.frequency_id);
        if (frequencyData.length) highscoreData.frequency = frequencyData;
        const highscore = new Highscore(highscoreData);
        resolve(highscore);
      } catch (err) {
        reject("Highscore not found");
      }
    });
  }

  static async newHighscore(highscoreData) {
    return new Promise(async (resolve, reject) => {
      try {
        const { name, frequency, username, subhighscores } = highscoreData;
        // Check to see if a frequency matching the new highscore frequency exists
        const frequency_id = await frequencyDuplicates(frequency);
        // set complete and streak to false as its a new highscore
        const complete = 0;
        const streak = 0;
        // find the user id that matches the username
        let user_id = await db.query(
          `SELECT id FROM users WHERE username = $1;`,
          [username]
        );
        user_id = user_id.rows[0].id;
        // Store the new highscoret in the DB and return the id
        let highscore_id = await db.query(
          `INSERT INTO highscores (name, frequency_id, complete, streak, user_id)
           VALUES ($1, $2, $3, $4, $5) RETURNING id;`,
          [name, frequency_id, complete, streak, user_id]
        );
        highscore_id = highscore_id.rows[0].id;
        // If there are any subhighscores add them to the DB
        if (subhighscores) {
          for (let subhighscore of subhighscores) {
            await db.query(
              `INSERT INTO subhighscores (name, complete, highscore_id)
             VALUES ($1, $2, $3);`,
              [subhighscore.name, subhighscore.complete, highscore_id]
            );
          }
        }
        // Return all highscores for the user
        resolve(this.findByUser(user_id));
      } catch (err) {
        reject(err);
      }
    });
  }

  static destroyHighscore(id) {
    return new Promise(async (resolve, reject) => {
      try {
        await db.query("DELETE FROM highscores WHERE id = $1", [id]);
        resolve("Highscore was deleted");
      } catch (err) {
        reject("Highscore could not be deleted");
      }
    });
  }

  updateHighscore(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const { name, frequency, subhighscores, complete, streak } = data;
        if (name) this.name = name;
        if (streak || streak === 0) this.streak = streak;
        if (complete) this.complete = Date.now();
        if (complete === "100") this.complete = 0;
        if (frequency) this.frequency = frequency;

        const frequency_id = await frequencyDuplicates(this.frequency);
        // Delete any existing subhighscores then create new ones
        if (subhighscores) {
          await db.query(`DELETE FROM subhighscores WHERE highscore_id = $1;`, [
            this.highscoreId,
          ]);
          for (let subhighscore of subhighscores) {
            try {
              await db.query(
                `INSERT INTO subhighscores (name, complete, highscore_id)
             VALUES ($1, $2, $3);`,
                [subhighscore.name, subhighscore.complete, this.highscoreId]
              );
            } catch (err) {
              console.warn(err);
            }
          }
        }
        // update the highscores
        db.query(
          `UPDATE highscores
            SET name = $1,
                frequency_id = $2,
                complete = $3,
                streak = $4
            WHERE id = $5;`,
          [
            this.name,
            frequency_id,
            this.complete,
            this.streak,
            this.highscoreId,
          ]
        );

        resolve("Highscore updated");
      } catch (err) {
        reject("Highscore cannot be updated");
      }
    });
  }
};
