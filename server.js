const express = require("express")
const cors = require ("cors");
const router  = require("./api/routes/Sys_Company.js")
const routers = require ("./api/routes/ImageUpload.js");
const Auth  = require("./api/routes/Authentication.js");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use("/api",router,routers,Auth)


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
