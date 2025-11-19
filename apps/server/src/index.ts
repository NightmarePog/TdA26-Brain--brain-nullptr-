import "dotenv/config";
import cors from "cors";
import express from "express";
import { initDatabase } from "./db/init.js";
import { userRoutes } from "./routes/users.js";
import { courseRoutes } from "./routes/courses.js";

const app = express();

app.use(cors());
app.use(express.json());

const apiRoutes = express.Router();
apiRoutes.get("/", (_req, res) => {
	res.status(200).send("OK");
});
apiRoutes.use("/users", userRoutes);
apiRoutes.use("/courses", courseRoutes);
app.use("/api", apiRoutes);

const port = process.env.PORT || 3000;
async function start() {
	await initDatabase();
	app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
}

start();
