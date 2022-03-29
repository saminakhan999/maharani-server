const db = require("../dbConfig/init");


const User = require('./user')

module.exports = class Highscore {
  constructor(data) {
    this.id = data.id;
    this.game = data.game;
    this.score = data.score;
    this.username = data.username;
  }

  static get all() {
    return new Promise(async (res, rej) => {
      try {
        let result =
          await db.query(`SELECT highscores.*, users.username as username
                                                    FROM highscores 
                                                    JOIN users ON highscores.user_id = users.id ORDER BY score DESC;`);
        let highscores = result.rows.map((r) => new Highscore(r));
        res(highscores);
      } catch (err) {
        rej(`Error retrieving highscores: ${err}`);
      }
    });
  }

  static findById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        let highscoreData = await db.query(
          `SELECT highscores.*, users.username AS username FROM highscores JOIN users ON highscores.user_id = users.id WHERE highscores.id= $1;`,
          [id]
        );
        let highscore = new Highscore(highscoreData.rows[0]);
        resolve(highscore);
      } catch (err) {
        reject("Highscore not found");
      }
    });
  }

  static findByUser(id) {
    return new Promise(async (resolve, reject) => {
      try {
        let highscoresData = await db.query(
          `SELECT highscores.*, users.username AS username FROM highscores JOIN users ON highscores.user_id = users.id WHERE userId = $1;`,
          [id]
        );
        const highscores = highscoresData.rows.map((d) => new Highscore(d));
        resolve(highscores);
      } catch (err) {
        reject("Error retrieving user's highscores");
      }
    });
  }

  static create(game, score, username) {
    return new Promise(async (resolve, reject) => {
      try {
        let user = await User.findOrCreateByName(username);
        let result = await db.query(
          `INSERT INTO highscores (game, score, user_id) VALUES ($1, $2, $3) RETURNING *;`,
          [game, score, user.id]
        );
        console.log(result.rows[0]);
        resolve(result.rows[0]);
      } catch (err) {
        reject("Error creating highscore");
      }
    });
  }

  static findByGame(game) {
    return new Promise(async (resolve, reject) => {
      try {
        let highscoreData = await db.query(
          `SELECT highscores.*, users.username AS username FROM highscores JOIN users ON highscores.user_id = users.id WHERE highscores.game= $1;`,
          [game]
        );
        let highscore = new Highscore(highscoreData.row);
        resolve(highscore);
      } catch (err) {
        reject("Highscores not found");
      }
    });
  }
};
