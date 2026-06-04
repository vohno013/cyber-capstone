const mongoDao = require("./mongo-dao.js");

async function findUserByUsername(username) {
  const db = mongoDao.getDb();
  if (!db) throw new Error("Database not connected");
  return db.collection("users").findOne({ username });
}

async function createUser(username, passwordHash, role = "user") {
  const db = mongoDao.getDb();
  if (!db) throw new Error("Database not connected");
  const result = await db.collection("users").insertOne({
    username,
    passwordHash,
    role,
    createdAt: new Date(),
  });
  return result.insertedId;
}

module.exports = { findUserByUsername, createUser };