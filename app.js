const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

const dbPath = path.join(__dirname, "userData.db");
const app = express();
app.use(express.json());

let db = null;

// const convertDbObjectToResponseObject = (dbObject) => {
//   return {
//     matchId: dbObject.match_id,
//     match: dbObject.match,
//     year: dbObject.year,
//   };
// };

// const convertResponseObject = (dbObject) => {
//   return {
//     playerId: dbObject.player_id,    //updated
//     playerName: dbObject.player_name,
//   };
// };

// const convertDbObjectToResponse = (dbObject) => {
//   return {
//     playerId: dbObject.player_id,    //updated
//     playerName: dbObject.player_name,
//     totalScore: dbObject.score,
//     totalFours: dbObject.fours,
//     totalSixes: dbObject.sixes,
//   };
// };

const initializeDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, (Request, Response) => {
      console.log("RUNNING SERVER");
    });
  } catch (error) {
    console.log(`error is ${error.message}`);
    process.exit(1);
  }
};

initializeDatabase();

// API 1

app.post("/register/", async (Request, Response) => {
  const { username, name, password, gender, location } = Request.body;
  //   console.log(Request.body);
  //   console.log(Request.body.password.length);
  let passwordLength = Request.body.password.length;
//   console.log(passwordLength);

  const hashedPassword = await bcrypt.hash(password, 10);

  const getUser = `select * from user where username = '${username}'`;
  const dbUser = await db.get(getUser);
  //   console.log(dbUser);
  if (dbUser === undefined) {
    // console.log(passwordLength);

    const addUser = `
        insert into user(username, name , password, gender , location)
        values(
            '${username}',
            '${name}',
            '${password}',
            '${gender}',
            '${location}');`;
    await db.run(addUser);
    Response.send("User created successfully");
  } else {
    if (passwordLength < 5) {
      //   console.log(passwordLength);

      Response.status(400);
      Response.send("Password is too short");
    } else {
      Response.status(400);
      Response.send("User already exists");
    }
  }
});

// API 2

app.post("/login/", async (Request, Response) => {
  const { username, password } = Request.body;
  const getUser = `select * from user where username = '${username}'`;
  const dbUser = await db.get(getUser);
  if (dbUser === undefined) {
    Response.status(400);
    Response.send("Invalid user");
  } else {
    const isPasswordMatch = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatch === true) {
      Response.status(200);
      Response.send("Login success!");
    } else {
      Response.status(400);
      Response.send("Invalid password");
    }
  }
});



// API 3

app.put("/change-password/", async (Request, Response) => {
  const { username, oldPassword, newPassword } = Request.body;
  //   console.log(Request.body);
  //   console.log(Request.body.password.length);
  let newPasswordLength = Request.body.newPassword.length;
  console.log(newPasswordLength);
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const getUser = `select * from user where username = '${username}'`;
  const dbUser = await db.get(getUser);
    const isPasswordMatch = await bcrypt.compare(oldPassword, dbUser.password);
    console.log(isPasswordMatch);
    if (isPasswordMatch === false) {
    Response.status(400);
    Response.send("Invalid current password");

//   const getUser = `select * from user where username = '${username}'`;
//   const dbUser = await db.get(getUser);
  //   console.log(dbUser);
  
  } else {
    if (passwordLength < 5) {
      //   console.log(passwordLength);

      Response.status(400);
      Response.send("Password is too short");
    } else {

        const updateUser =`
        update user set password =${hashedPassword}
        `;
        await db.run(updateUser);
      Response.status(200);
      Response.send("Password updated");
    }
  }
});

module.exports = app;
