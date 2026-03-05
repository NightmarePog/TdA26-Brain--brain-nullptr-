import "dotenv/config";
import cors from "cors";
import express from "express";
import { initDatabase } from "./db/init.js";
import { userRoutes } from "./routes/users.js";
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { seed } from "./utils/seed.js";
import { courseRoutes } from "./routes/courses.js";
import { moduleRoutes } from "./routes/modules.js";
import type { RowDataPacket } from "mysql2";
import { feedRoutes } from "./routes/feed.js";
import { materialRoutes } from "./routes/materials.js";
import multer from "multer";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(compression());

/** Declare more request variables */
declare global {
    namespace Express {
        interface Request {
            user?: RowDataPacket & {
				name: string;
			};
			course? : RowDataPacket & {
				uuid: string;
				name: string;
				description?: string;
				imageUrl?: string;
				state: string;
				theme?: string;
				openedAt?: string;
				closedAt?: string;
				createdAt: string;
				updatedAt: string;
				updateCount: number;
			};
			module? : RowDataPacket & {
				uuid: string;
				name: string;
				state: string;
				description?: string;
				idx: number;
				createdAt: string;
				updatedAt: string;
				updateCount: number;
			};
			feed? : RowDataPacket & {
				uuid: string;
				type: string;
				message: string;
				edited: boolean;
				author: string;
				createdAt: string;
				updatedAt: string;
			};
			material? : RowDataPacket & {
				uuid: string;
				createdAt: string;
				updatedAt: string;
				updateCount: number;
				name: string;
				type: string;
				url?: string;
				fileUrl?: string;
				description?: string;
				mimeType?: string;
				sizeBytes?: number;
				faviconUrl?: string;
			};
			materialUuid: string;
			name: string;

        }
    }
}

/** Common types */
export enum Types {
	MATERIAL_FILE = "file",
	MATERIAL_URL = "url",
	QUESTION_SINGLE_CHOICE = "singleChoice",
	QUESTION_MULTIPLE_CHOICE = "multipleChoice",
	FEED_MANUAL = "manual",
	FEED_SYSTEM = "system",
	COURSE_DRAFT = "draft",
	COURSE_LIFE = "life",
	COURSE_ARCHIVED = "archived",
	COURSE_SCHEDULED = "scheduled",
	COURSE_PAUSED = "paused",
	MODULE_OPEN = "open",
	MODULE_CLOSED = "closed",
};

/** File uploading */
const MAX_UPLOAD_SIZE = 30000000;	// 30 MB
const VALID_EXTENSIONS = ['pdf', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mp3'];
const storage = multer.diskStorage({
	destination: function (req : any, file : any, cb : any) {
		cb(null, '/app/tmp/');
	},
	filename: function (req : any, file : any, cb : any) {
		cb(null, req.params.uuid);
	}
});
export const upload = multer({
	storage: storage,
	limits: {
		fileSize: MAX_UPLOAD_SIZE
	},
	fileFilter: (req : any, file : any, callback : any) => {
		if (!(VALID_EXTENSIONS.includes(file.originalname.split(".").at(-1)))) {
			return callback(new Error('Unsupported file type'));
		}

		const fileSize = parseInt(req.headers['content-length']);
		if (fileSize > MAX_UPLOAD_SIZE) {
			return callback(new Error('Maximum file size exceeded'));
		}

		callback(null, true);
	}
}).single(Types.MATERIAL_FILE);

const apiRoutes = express.Router();
/** Initial api call */
apiRoutes.get("/", (_req, res) => {
	res.status(200).json({ organization: "Student Cyber Games" });
});
/** Teapot */
apiRoutes.get("/coffee", (_req, res) => {
	res.status(418).send("I'm a teapot");
});

app.use("/api", apiRoutes);
apiRoutes.use("/users", userRoutes);
apiRoutes.use("/courses", courseRoutes);
courseRoutes.use("/", moduleRoutes);
courseRoutes.use("/", feedRoutes);
moduleRoutes.use("", materialRoutes);

const port = process.env.PORT || 3000;
async function start() {
	await initDatabase();
	console.log("\nDatabase is connected");
	app.listen(port, () => {
		console.log("Server is running");
		console.log(`Server port: ${port}`);
	
		seed();
	});
}

start();
