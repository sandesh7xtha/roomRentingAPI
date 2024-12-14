const express = require("express");
const router = express.Router();
const mysqlconnection = require("../model/db");
const auth = require("../middlewares/checkAuth");

//add toDoList
router.post("/", auth, async (req, res) => {
  let { categoryName } = req.body;
  // console.log(req.body);
  var dateTime = new Date().toLocaleString();

  try {
    var sql =
      "INSERT INTO category SET categoryName = ? ,createdAt = ?, updatedAt = ?";
    mysqlconnection.query(
      sql,
      [categoryName, dateTime, dateTime],
      (err, rows, fields) => {
        if (!err) {
          return res.status(200).json({
            status: "ok",
            data: {
              categoryName: categoryName,
            },
          });
        } else console.log(err);
      }
    );
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
    return;
  }
  return;
});

//get by id
router.get("/:id", async (req, res) => {
  try {
    var sql = "SELECT * FROM category WHERE id = ?";
    mysqlconnection.query(sql, [req.params.id], (err, result) => {
      if (!err) {
        return res.status(200).json({
          status: "ok",
          data: result,
        });
      } else console.log(err);
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
});

//get by id
router.get("/", auth, async (req, res) => {
  try {
    var sql = "SELECT * FROM category ORDER BY id DESC";
    mysqlconnection.query(sql, [], (err, result) => {
      if (!err) {
        return res.status(200).json({
          status: "ok",
          data: result,
        });
      } else console.log(err);
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
});

//update tdoList
router.patch("/:id", auth, async (req, res) => {
  let { categoryName } = req.body;

  var dateTime = new Date().toLocaleString();
  try {
    var sql =
      "UPDATE category set categoryName = ?, updatedAt = ? WHERE id = ? ";
    mysqlconnection.query(
      sql,
      [categoryName, dateTime, req.params.id],
      (err, result) => {
        if (!err) {
          res.status(200).json({
            status: "ok",
            data: result,
          });
        } else {
          res.status(204).json({
            status: "error",
            message: "Invalid",
          });
        }
      }
    );
  } catch (err) {
    res.json({
      message: err,
    });
  }
});

//delete toDoList by id
router.delete("/:id", auth, async (req, res) => {
  try {
    var sql = "DELETE FROM category WHERE id = ? ";
    mysqlconnection.query(sql, [req.params.id], (err, result) => {
      if (!err) {
        res.status(200).json({
          status: "ok",
          data: result,
        });
      } else {
        res.status(200).json({
          status: "error",
          message: "Invalid",
        });
      }
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
});

module.exports = router;
