import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./src/helper/databaseConnection.js";
import cors from "cors";
const PORT = process.env.PORT || 5932;
import path from "path";
const __dirname = path.resolve();
import router from "./routes.js";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

router(app);
connectDB();

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
