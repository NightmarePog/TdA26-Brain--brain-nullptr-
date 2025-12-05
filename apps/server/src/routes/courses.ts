import express from "express";
import multer from 'multer';
import { pool } from "@/db";
import { randomUUID } from "crypto";
import { createDirectory, deleteFile, fileOrDirectoryExists, moveFile } from "@/utils/filesystem";

const MAX_UPLOAD_SIZE = 30000000;

const acceptableExtensions = ['pdf', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mp3'];

const storage = multer.diskStorage({
    destination: function (req : any, file : any, cb : any) {
		cb(null, '/app/tmp/');
    },
	filename: function (req : any, file : any, cb : any) {
		cb(null, req.params.uuid);
	}
});

const upload = multer({
	storage: storage,
	limits: {
        fileSize: MAX_UPLOAD_SIZE // 30 MB
    },
	fileFilter: (req : any, file : any, callback : any) => {
		if (!(acceptableExtensions.includes(file.originalname.split(".").at(-1)))) {
			return callback(new Error('Unsupported file type'));
		}

		const fileSize = parseInt(req.headers['content-length']);
		if (fileSize > MAX_UPLOAD_SIZE) {
			return callback(new Error('Maximum file size exceeded'));
		}

		callback(null, true);
    }
}).single('file');

export const courseRoutes = express.Router();

/** GET/POST on /courses/ */
courseRoutes.get("/", async (_req, res) => {
	try {
		const [rows] = await pool.execute("SELECT * FROM courses ORDER BY created_at DESC");
		res.status(200).json(rows);
	} catch (error) {
		console.error("Error fetching course summaries:", error);
		res.status(500).json({ error: "Failed to fetch course summaries" });
	}
});

courseRoutes.post("/", async (req, res) => {
  	try {
		const uuid: string = randomUUID();
		const name: string = req.body.name;
		const desc: string = req.body.description || "";

		if (!name) {
			res.status(404).json({ message: "Invalid data" });
			return;
		}

		await pool.execute(`
			INSERT INTO courses (uuid, name, description)
			VALUES (?, ?, ?)
		`,[uuid, name, desc]);

		const course = await findCourseByUUID(uuid);
		res.status(201).json(course);
	} catch (error) {
		console.error("Error creating course:", error);
		res.status(500).json({ error: "Failed to create course" });
	}
});

/** GET/DELETE/PUT on /courses/:uuid/ */
courseRoutes.get("/:uuid", async (req, res) => {
	try {
		const uuid : string = req.params.uuid;
		const course = await getCourseDetailsByUUID(uuid);
		course ? res.status(200).json(course) : res.status(404).json({ message: "Invalid course uuid" });
	} catch (error) {
		console.error("Error getting course details:", error);
		res.status(500).json({ error: "Failed to get course details" });
	}
});

courseRoutes.delete("/:uuid", async (req, res) => {
	try {
		const uuid : string = req.params.uuid;
		const course = await findCourseByUUID(uuid);
		if (!course) {
			res.status(404).json({ message: "Invalid course uuid" });
			return;
		}
		await pool.execute(`
			DELETE FROM courses WHERE uuid = ?
		`,[uuid]);

		// This somehow returns nothing, so it works as intended
		res.status(204).json(course);
	} catch (error) {
		console.error("Error deleting course:", error);
		res.status(500).json({ error: "Failed to delete course" });
	}
});

courseRoutes.put("/:uuid", async (req, res) => {
	try {
		const uuid: string = req.params.uuid;

		const course = await findCourseByUUID(uuid);
		if (!course) {
			res.status(404).json({ message: "Invalid course uuid" });
			return;
		}

		if (req.body) {
			const name: string = req.body.name != null ? req.body.name : course.name;
			const desc: string = req.body.description != null ? req.body.description : course.description;

			await pool.execute(`
				UPDATE courses
				SET name = ?, description = ?
				WHERE uuid = ?
			`, [name, desc, uuid]);
		}

		res.status(200).json(await findCourseByUUID(uuid));
			
	} catch (error) {
		console.error("Error updating course:", error);
		res.status(500).json({ error: "Failed to update course" });
	}
});

/** GET/POST on /courses/:uuid/materials/ */
courseRoutes.get("/:uuid/materials", async (req, res) => {
	try {
		const uuid : string = req.params.uuid;
		const materials = await getMaterialsByCourseUUID(uuid);
		materials ? res.status(200).json(materials) : res.status(404).json({ message: "Invalid course uuid" });
	} catch (error) {
		console.error("Error fetching materials:", error);
		res.status(500).json({ error: "Failed to fetch materials" });
	}
});

courseRoutes.post("/:uuid/materials", async (req, res, next) => {
	const course_uuid : string = req.params.uuid;
	const uuid : string = randomUUID();

	const course = await findCourseByUUID(course_uuid);
    if (!course) {
      res.status(404).json({ message: "Invalid course uuid" });
      return;
    }
	
	try {
		if (req.is('application/json')) {
			/** URL */
			const name : string = req.body.name;
			const desc : string = req.body.description || '';
			const type : string = "url";
			const url : string = req.body.url;
			const faviconUrl : string = `${url}/favicon.ico`;

			if (!type || !name || !url) {
				res.status(404).json({ message: "Invalid data" });
				return;
			}

			await pool.execute(`
				INSERT INTO materials (uuid, course_uuid)
				VALUES (?, ?)
			`,[uuid, course_uuid]);

			await pool.execute(`
				INSERT INTO urls (uuid, name, type, url, faviconUrl, description)
				VALUES (?, ?, ?, ?, ?, ?)
			`, [uuid, name, type, url, faviconUrl, desc]);
			
			await updateCourseByUUID(course_uuid);

			const [materials] = await pool.execute(`
				SELECT * FROM materials WHERE uuid = ?
			`,[uuid]);

			res.status(201).json(await formatMaterialJSON(materials[0]));
			return;

		} else if (req.is('multipart/form-data')) {
			/** FILE */
			upload(req, res, async function(err : any) {
				if (err) {
					return res.status(400).json( { message:err.message } );
				}

				const name : string = req.body.name || req.file.originalname;
				const mimeType : string = req.file.mimetype;
				const sizeBytes : number = req.file.size;
				const description : string = req.body.description || "";
				const type : string = "file";
	
				const tmpFilePath = `/app/tmp/${course_uuid}`;
				const newDirPath = `/app/materials/${course_uuid}`;
				const newFilePath = `${newDirPath}/${uuid}`;
	
				if (!name || !type) {
					deleteFile(tmpFilePath);
					res.status(404).json({ message: "Invalid data" });
					return;
				}
	
				if (!(await fileOrDirectoryExists(newDirPath))) {
					await createDirectory(newDirPath);
				}
				await moveFile(tmpFilePath, newFilePath);
	
				await pool.execute(`
					INSERT INTO materials (uuid, course_uuid)
					VALUES (?, ?)
				`,[uuid, course_uuid]);
	
				await pool.execute(`
					INSERT INTO files (uuid, name, type, fileUrl, description, mimeType, sizeBytes)
					VALUES (?, ?, ?, ?, ?, ?, ?)
				`, [uuid, name, type, newFilePath, description, mimeType, sizeBytes]);

				await updateCourseByUUID(course_uuid);
	
				const [materials] = await pool.execute(`
					SELECT * FROM materials WHERE uuid = ?
				`,[uuid]);

				res.status(201).json(await formatMaterialJSON(materials[0]));
				return;
			});
		} else {
			res.status(404).json({ message: "Invalid content type" });
			return;
		}
		
	} catch (error) {
		console.error("Error creating material:", error);
		res.status(500).json({ error: "Failed to create material" });
	}
});

/** PUT/DELETE on /courses/:uuid/materials/:material_uuid */
courseRoutes.put("/:uuid/materials/:material_uuid", async (req, res) => {
	try {
		const uuid: string = req.params.uuid;
		const material_uuid: string = req.params.material_uuid;

		const course = await findCourseByUUID(uuid);
		if (!course) {
			res.status(404).json({ message: "Invalid course uuid" });
			return;
		}

		const material = await findMaterialByUUID(material_uuid);
		if (!material) {
			res.status(404).json({ message: "Invalid material uuid" });
			return;
		}

		if (req.body) {
			const name: string = req.body.name != null ? req.body.name : material.name;
			const desc: string = req.body.description != null ? req.body.description : material.description;
			const type = material.type;

			if (type == "file") {
				await pool.execute(`
					UPDATE files
					SET name = ?, description = ?
					WHERE uuid = ?
				`, [name, desc, material_uuid]);
				
			} else if (type == "url") {
				const url: string = req.body.url != null ? req.body.url : material.url;

				await pool.execute(`
					UPDATE urls
					SET name = ?, description = ?, url = ?, faviconUrl = ?
					WHERE uuid = ?
				`, [name, desc, url, `${url}/favicon.ico`, material_uuid]);
			}
		}

		await pool.execute(`
			UPDATE materials
			SET update_count = ?
			WHERE uuid = ?
		`, [material.update_count+1, material_uuid]);

		await updateCourseByUUID(uuid);

		res.status(200).json(await findMaterialByUUID(material_uuid));
		
	} catch (error) {
		console.error("Error updating course:", error);
		res.status(500).json({ error: "Failed to update course" });
	}
});

courseRoutes.delete("/:uuid/materials/:material_uuid", async (req, res) => {
	try {
		const uuid: string = req.params.uuid;
		const material_uuid: string = req.params.material_uuid;

		const course = await findCourseByUUID(uuid);
		if (!course) {
			res.status(404).json({ message: "Invalid course uuid" });
			return;
		}

		const material = await findMaterialByUUID(material_uuid);
		if (!material) {
			res.status(404).json({ message: "Invalid material uuid" });
			return;
		}

		await pool.execute(`
			DELETE FROM materials WHERE uuid = ?
		`,[material_uuid]);

		await updateCourseByUUID(uuid);

		// This somehow returns nothing, so it works as intended
		res.status(204).json(material);
	} catch (error) {
		console.error("Error deleting course:", error);
		res.status(500).json({ error: "Failed to delete course" });
	}
});

/** Functions */
async function updateCourseByUUID(uuid : string) {
	const course = await findCourseByUUID(uuid);
	if (!course) {
		return;
	}

	await pool.execute(`
		UPDATE courses
		SET update_count = ?
		WHERE uuid = ?
	`, [course.update_count+1, uuid]);
}

async function findCourseByUUID(uuid : string) {
	const [courses] = await pool.execute(`
			SELECT * FROM courses WHERE uuid = ?
	`,[uuid]);
	return courses.length == 1 ? courses[0] : null;
};

async function formatMaterialJSON(entry : JSON) {
	delete entry.course_uuid;

	/** Prioritize file instead of url, shouldnt cause problems */
	const [files] = await pool.execute(`
		SELECT * FROM files WHERE uuid = ?
	`,[entry.uuid]);
	const file = files.length == 1 ? files[0] : null;
	if (file) {
		delete file.uuid;
		entry = Object.assign(entry, file);
		return entry;
	}

	const [urls] = await pool.execute(`
		SELECT * FROM urls WHERE uuid = ?
	`,[entry.uuid]);
	const url = urls.length == 1 ? urls[0] : null;
	if (url) {
		delete url.uuid;
		entry = Object.assign(entry, url);
		return entry;
	}
};

async function findMaterialByUUID(uuid : string) {
	const [materials] = await pool.execute(`
			SELECT * FROM materials WHERE uuid = ?
	`,[uuid]);
	return materials.length == 1 ? (await formatMaterialJSON(materials[0])) : null;
};

async function getMaterialsByCourseUUID(uuid : string) {
	if (!(await findCourseByUUID(uuid))) return;
	const [materials] = await pool.execute(`
			SELECT * FROM materials WHERE course_uuid = ? ORDER BY created_at DESC
	`,[uuid]);
	for (const entry of materials) {
		await formatMaterialJSON(entry);
	};
	return materials;
};

/** TODO */
async function getQuizzesByCourseUUID(uuid : string) {
	if (!(await findCourseByUUID(uuid))) return;
	return [];
};

/** TODO */
async function getFeedByCourseUUID(uuid : string) {
	if (!(await findCourseByUUID(uuid))) return;
	return [];
};

async function getCourseDetailsByUUID(uuid : string) {
	/** for now only get materials ontop of the initial course */
	const course = await findCourseByUUID(uuid);
	if (!course) return;

	const materials = await getMaterialsByCourseUUID(uuid);
	if (!materials) return;

	const quizzes = await getQuizzesByCourseUUID(uuid);
	if (!quizzes) return;

	const feed = await getFeedByCourseUUID(uuid);
	if (!feed) return;

	course.materials = materials;
	course.quizzes = quizzes;
	course.feed = feed;

	return course;
};
