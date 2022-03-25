const db = require("../dbConfig/init");

const findSubhighscores = (highscore_id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let subhighscoreData = await db.query(
        `SELECT name, complete FROM subhighscores WHERE highscore_id = $1;`,
        [highscore_id]
      );
      resolve(subhighscoreData.rows);
    } catch (err) {
      reject("Subhighscore not found");
    }
  });
};

const findFrequency = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let frequencyData = await db.query(
        `SELECT monday, tuesday, wednesday, thursday, friday, saturday, sunday
          FROM frequency
          WHERE id = $1;`,
        [id]
      );
      // getting just the days in one object
      let soloData = frequencyData.rows[0];
      // initialise an array for the bool ints
      const frequencyArr = [];
      for (day in soloData) {
        // if the day has a value of true push 1 to the arr else push 0
        if (soloData[day]) {
          frequencyArr.push(1);
        } else {
          frequencyArr.push(0);
        }
      }
      resolve(frequencyArr);
    } catch (err) {
      reject("frequency not found");
    }
  });
};

const frequencyDuplicates = async (frequencyCheck) => {
  // Check if frequency already exists to get its id
  let duplicate = false;
  let frequency_id;
  let previousFrequency = await db.query(`SELECT id FROM frequency`);
  for (let row of previousFrequency.rows) {
    const allFrequencyArr = await findFrequency(row.id);
    if (`${allFrequencyArr}` === `${frequencyCheck}`) {
      duplicate = true;
      frequency_id = row.id;
      break;
    }
  }
  // If that frequency doesn't already exist add it to the DB
  if (!duplicate) {
    const frequencyBool = frequencyCheck.map((m) => {
      if (m === 1) {
        return "TRUE";
      } else if (m === 0) {
        return "FALSE";
      } else {
        throw new Error("unexpected value in array");
      }
    });
    frequency_id = await db.query(
      `INSERT INTO frequency (monday, tuesday, wednesday, thursday, friday, saturday, sunday)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;`,
      frequencyBool
    );
    frequency_id = frequency_id.rows[0].id;
  }
  return frequency_id;
};

module.exports = { findSubhighscores, findFrequency, frequencyDuplicates };
