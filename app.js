const express = require("express");
const app = express();
const port = 3000;
const indexRouter = require("./routes/index.js");
const cookieParser = require("cookie-parser");
const { sequelize } = require('./models'); 

(async () => {
    try {
      await sequelize.sync();
      console.log({message:'싱크 성공'});
    } catch (error) {
      console.error('message:', "sync실패");
    }
  })()

app.use([express.json(),cookieParser()]);
app.use("/api",indexRouter);

app.listen(port, ()=>{
    console.log(port,'포트로 서버가 열렸어요')
})