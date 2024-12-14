const express = require("express");
const router = express.Router();
const mysqlconnection = require("../model/db");
const auth = require("../middlewares/checkAuth");

//add toDoList
router.post("/", auth, async (req, res) => {
  let { subcategoryName, categoryId } = req.body;
  // console.log(req.body);
  var dateTime = new Date().toLocaleString();

  try {
    var sql =
      "INSERT INTO subcategory SET subcategoryName = ?, categoryId = ? ,createdAt = ?, updatedAt = ?";
    mysqlconnection.query(
      sql,
      [subcategoryName, categoryId, dateTime, dateTime],
      (err, rows, fields) => {
        if (!err) {
          return res.status(200).json({
            status: "ok",
            newData: {
              subcategoryName: subcategoryName,
              categoryId: categoryId,
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
    var sql = "SELECT * FROM subcategory WHERE id = ?";
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
    var sql =
      "SELECT subcategory.id , subcategory.subcategoryName, subcategory.createdAt, subcategory.updatedAt, subcategory.categoryId, category.categoryName FROM subcategory INNER JOIN category ON subcategory.categoryId=category.id ORDER BY id DESC";
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
  let { subcategoryName, categoryId } = req.body;

  var dateTime = new Date().toLocaleString();
  try {
    var sql =
      "UPDATE subcategory set subcategoryName = ?,categoryId=?, updatedAt = ? WHERE id = ? ";
    mysqlconnection.query(
      sql,
      [subcategoryName, categoryId, dateTime, req.params.id],
      (err, result) => {
        if (!err) {
          res.status(200).json({
            status: "ok",
            updatedData: {
              subcategoryName: subcategoryName,
              categoryId: categoryId,
            },
          });
        } else {
          res.status(204).json({
            status: "error",
            message: "Invalid",
          });
          console.log(err);
        }
      }
    );
  } catch (err) {
    res.status(204).json({
      message: err,
    });
  }
});

//delete toDoList by id
router.delete("/:id", auth, async (req, res) => {
  try {
    var sql = "DELETE FROM subcategory WHERE id = ? ";
    mysqlconnection.query(sql, [req.params.id], (err, result) => {
      if (!err) {
        res.status(200).json({
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

module.exports = router;
