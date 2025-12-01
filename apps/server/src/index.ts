import "dotenv/config";
import cors from "cors";
import express, { Router } from "express";
import { initDatabase } from "./db/init.js";
import { userRoutes } from "./routes/users.js";
import { courseRoutes } from "./routes/courses.js";

const app = express();

app.use(cors());
app.use(express.json());

const apiRoutes = express.Router();
apiRoutes.get("/", (_req, res) => {
	res.status(200).json( {organization:"Think different academy"} );
});

app.use("/api", apiRoutes);

/** 
 *  This has to be String|any because apiRoutes.use needs
 *  type 'PathParams', which doesn't exist. stupid.
 */
const routes = new Map<String|any, Router> ([
	["/users", userRoutes],
	["/courses", courseRoutes],
]);
routes.forEach((value, key) => {
	apiRoutes.use(key, value);
});

const port = process.env.PORT || 3000;
async function start() {
	await initDatabase();
	console.log("\nDatabase is connected");
	app.listen(port, () => {
		console.log("Server is running");
		console.log(`Server port: ${port}`);
		console.log("Available routes:");
		routes.forEach((v,k) => {
			console.log("-- "+k);
		});
	});
}

start();
