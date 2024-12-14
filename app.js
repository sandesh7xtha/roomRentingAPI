const express = require("express");
const app = express();
const morgan = require("morgan");
const mysql = require("mysql");
const dbConfig = require("./config/db.config");
const cors = require("cors");
const path = require("path");
const PORT = 4000;

//for path directory
global.appRoot = __dirname;
//for request parameter
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use("/public/assets", express.static("public/assets"));

//require all routes
const userRouter = require("./routes/userRouter");
const roomRouter = require("./routes/roomRouter");
const bookingRouter = require("./routes/bookingRouter");
const paymentRouter = require("./routes/paymentRouter");
// const subcategoryRouter = require("./routes/subCaegoryRouter");

//use all routes
app.use("/user", userRouter);
app.use("/room", roomRouter);
app.use("/booking", bookingRouter);
app.use("/payment", paymentRouter);
// app.use("/subCategory", subcategoryRouter);

app.listen(PORT, () => {
  console.log("Server start at port : " + PORT);
  //   console.log(dbConfig);
});
