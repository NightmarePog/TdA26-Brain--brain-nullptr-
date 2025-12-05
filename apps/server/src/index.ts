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
	res.status(200).json({ organization: "Student Cyber Games" });
});

app.use("/api", apiRoutes);

apiRoutes.use("/users", userRoutes);
apiRoutes.use("/courses", courseRoutes);

const port = process.env.PORT || 3000;
async function start() {
	await initDatabase();
	console.log("\nDatabase is connected");
	app.listen(port, () => {
		console.log("Server is running");
		console.log(`Server port: ${port}`);
	});
}

start();
