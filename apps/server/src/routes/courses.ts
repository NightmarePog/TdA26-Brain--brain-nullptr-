import express from "express";
import multer from 'multer';
import { pool } from "@/db";
import { randomUUID } from "crypto";
import { createDirectory, deleteFile, fileOrDirectoryExists, moveFile } from "@/utils/filesystem";
import { authenticate, authenticateAdmin } from "./users";

enum Types {
	FILE = "file",
	URL = "url",
	SINGLE_CHOICE = "singleChoice",
	MULTIPLE_CHOICE = "multipleChoice",
};

const MAX_UPLOAD_SIZE = 30000000;
const VALID_EXTENSIONS = ['pdf', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mp3'];
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
		if (!(VALID_EXTENSIONS.includes(file.originalname.split(".").at(-1)))) {
			return callback(new Error('Unsupported file type'));
		}

		const fileSize = parseInt(req.headers['content-length']);
		if (fileSize > MAX_UPLOAD_SIZE) {
			return callback(new Error('Maximum file size exceeded'));
		}

		callback(null, true);
    }
}).single(Types.FILE);

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

courseRoutes.post("/", checkJSON, checkBody, authenticate, authenticateAdmin, async (req, res) => {
  	try {
		const name: string = req.body.name;
		if (!name) {
			res.status(400).json({ message: "Missing name" });
			return;
		}

		const uuid: string = randomUUID();
		const desc: string = req.body.description || "";

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
courseRoutes.get("/:uuid", checkCourse, async (req, res) => {
	try {
		res.status(200).json(await getCourseDetailsByUUID(req.course.uuid));
	} catch (error) {
		console.error("Error getting course details:", error);
		res.status(500).json({ error: "Failed to get course details" });
	}
});

courseRoutes.delete("/:uuid", checkCourse, authenticate, authenticateAdmin, async (req, res) => {
	try {
		const uuid = req.params.uuid;

		await pool.execute(`
			DELETE FROM courses WHERE uuid = ?
		`,[uuid]);

		res.status(204).json({ message: "Course deleted successfully" });
	} catch (error) {
		console.error("Error deleting course:", error);
		res.status(500).json({ error: "Failed to delete course" });
	}
});

courseRoutes.put("/:uuid", checkJSON, checkBody, checkCourse, authenticate, authenticateAdmin, async (req, res) => {
	try {
		const uuid: string = req.params.uuid;
		const name: string = req.body.name != null ? req.body.name : req.course.name;
		const desc: string = req.body.description != null ? req.body.description : req.course.description;

		await pool.execute(`
			UPDATE courses
			SET name = ?, description = ?
			WHERE uuid = ?
		`, [name, desc, uuid]);

		res.status(200).json(await findCourseByUUID(uuid));
			
	} catch (error) {
		console.error("Error updating course:", error);
		res.status(500).json({ error: "Failed to update course" });
	}
});

/** GET/POST on /courses/:uuid/materials/ */
courseRoutes.get("/:uuid/materials", checkCourse, async (req, res) => {
	try {
		const uuid : string = req.params.uuid;
		const materials = await getMaterialsByCourseUUID(uuid);
		res.status(200).json(materials);
	} catch (error) {
		console.error("Error fetching materials:", error);
		res.status(500).json({ error: "Failed to fetch materials" });
	}
});

courseRoutes.post("/:uuid/materials", checkCourse, authenticate, authenticateAdmin, async (req, res, next) => {
	try {
		const course_uuid : string = req.params.uuid;
		const uuid : string = randomUUID();

		if (req.is('application/json')) {
			checkBody(req, res, async () => {
				/** URL */
				const url : string = req.body.url;
				const name : string = req.body.name;
				if (!url) {
					res.status(400).json({ message: "Missing url" });
					return;
				}
				if (!name) {
					res.status(400).json({ message: "Missing name" });
					return;
				}
	
				const type : string = Types.URL;
				const faviconUrl : string = `${url}/favicon.ico`;
				const desc : string = req.body.description || "";
	
				await pool.execute(`
					INSERT INTO materials (uuid, course_uuid)
					VALUES (?, ?)
				`,[uuid, course_uuid]);
	
				await pool.execute(`
					INSERT INTO urls (uuid, name, type, url, faviconUrl, description)
					VALUES (?, ?, ?, ?, ?, ?)
				`, [uuid, name, type, url, faviconUrl, desc]);

				req.material_uuid = uuid;
				next();
			});
		} else if (req.is('multipart/form-data')) {
			/** FILE */
			await upload(req, res, async (err : any) => {
				if (err) {
					res.status(400).json({ message: err.message });
					return;
				}

				let name : string = req.file.originalname, description : string = "";
				if (req.body) {
					if (req.body.name) {
						name = req.body.name;
					}
					if (req.body.description) {
						description = req.body.description;
					}
				}
				const mimeType : string = req.file.mimetype;
				const sizeBytes : number = req.file.size;
				const type : string = Types.FILE;
	
				const tmpFilePath = `/app/tmp/${course_uuid}`;
				const newDirPath = `/app/materials/${course_uuid}`;
				const newFilePath = `${newDirPath}/${uuid}`;
	
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

				req.material_uuid = uuid;
				next();
			});
		} else {
			res.status(400).json({ message: "Invalid content type" });
			return;
		}
	} catch (error) {
		console.error("Error creating material:", error);
		res.status(500).json({ error: "Failed to create material" });
	}
}, async (req, res) => {
	await updateCourseByUUID(req.params.uuid);

	const [materials] = await pool.execute(`
		SELECT * FROM materials WHERE uuid = ?
	`,[req.material_uuid]);

	res.status(201).json(await formatMaterialJSON(materials[0]));
});

/** PUT/DELETE on /courses/:uuid/materials/:material_uuid */
courseRoutes.put("/:uuid/materials/:material_uuid", checkCourse, checkMaterial, authenticate, authenticateAdmin, async (req, res, next) => {
	try {
		const uuid: string = req.params.uuid;
		const material_uuid: string = req.params.material_uuid;
		const material = req.material;
		const type = material.type;

		if (type == Types.FILE) {
			if (req.is('multipart/form-data')) {
				/** With file replacement */
				upload(req, res, async function(err : any) {
					if (err) {
						return res.status(400).json({ message:err.message });
					}
					
					let name : string = material.name, description : string = material.description;
					if (req.body) {
						if (req.body.name) {
							name = req.body.name;
						}
						if (req.body.description) {
							description = req.body.description;
						}
					}
					const mimeType : string = req.file.mimetype;
					const sizeBytes : number = req.file.size;
		
					const tmpFilePath = `/app/tmp/${uuid}`;
					const newDirPath = `/app/materials/${uuid}`;
					const newFilePath = `${newDirPath}/${material_uuid}`;

					if (!(await fileOrDirectoryExists(newDirPath))) {
						await createDirectory(newDirPath);
					}
					await moveFile(tmpFilePath, newFilePath);

					await pool.execute(`
						UPDATE files
						SET name = ?, description = ?, mimeType = ?, sizeBytes = ?
						WHERE uuid = ?
					`, [name, description, mimeType, sizeBytes, material_uuid]);

					next();
				});
			} else if (req.is('application/json')) {
				/** Without file replacement */
				if (!req.body) {
					res.status(400).json({ message: "Missing body" });
					return;
				}

				const name: string = req.body.name != null ? req.body.name : material.name;
				const desc: string = req.body.description != null ? req.body.description : material.description;

				await pool.execute(`
					UPDATE files
					SET name = ?, description = ?
					WHERE uuid = ?
				`, [name, desc, material_uuid]);

				next();
			} else {
				res.status(400).json({ message: "Invalid content type" });
				return;
			}
		} else if (type == Types.URL) {
			const name: string = req.body.name || material.name;
			const desc: string = req.body.description || material.description;
			const url: string = req.body.url != null ? req.body.url : material.url;

			await pool.execute(`
				UPDATE urls
				SET name = ?, description = ?, url = ?, faviconUrl = ?
				WHERE uuid = ?
			`, [name, desc, url, `${url}/favicon.ico`, material_uuid]);

			next();
		}
		
	} catch (error) {
		console.error("Error updating material:", error);
		res.status(500).json({ error: "Failed to update material" });
	}
}, async (req, res) => {
	await pool.execute(`
		UPDATE materials
		SET update_count = ?
		WHERE uuid = ?
	`, [req.material.update_count+1, req.material.uuid]);

	await updateCourseByUUID(uuid);

	res.status(200).json(await findMaterialByUUID(req.material.uuid));
});

courseRoutes.delete("/:uuid/materials/:material_uuid", checkCourse, checkMaterial, authenticate, authenticateAdmin, async (req, res) => {
	try {
		const uuid: string = req.params.uuid;
		const material_uuid: string = req.params.material_uuid;

		await pool.execute(`
			DELETE FROM materials WHERE uuid = ?
		`,[material_uuid]);

		await updateCourseByUUID(uuid);

		res.status(204).json({ message: "Material deleted sucessfully" });
	} catch (error) {
		console.error("Error deleting material:", error);
		res.status(500).json({ error: "Failed to delete material" });
	}
});

/** GET/POST on /courses/:uuid/quizzes */
courseRoutes.get("/:uuid/quizzes", checkCourse, async (req,res) => {
	try {
		const uuid : string = req.params.uuid;
		const quizzes = await getQuizzesByCourseUUID(uuid);
		quizzes ? res.status(200).json(quizzes) : res.status(404).json({ message: "Invalid course uuid" });
	} catch (error) {
		console.error("Error fetching quizzes:", error);
		res.status(500).json({ error: "Failed to fetch quizzes" });
	}
});

courseRoutes.post("/:uuid/quizzes", checkJSON, checkBody, checkCourse, authenticate, authenticateAdmin, async (req, res, next) => {
  	try {
		const uuid = req.params.uuid;
		const body = req.body;

		if (body.title == null || body.attemptsCount == null || body.questions == null || body.questions.length == 0) {
			next();
			return;
		}

		const questions : JSON[] = [];

		/** Parse questions */
		for (const q of body.questions) {
			if (q.type == null || q.question == null || q.options == null || q.options.length == 0) {
				next();
				return;
			}
			if (q.type != Types.SINGLE_CHOICE && q.type != Types.MULTIPLE_CHOICE) {
				next();
				return;
			}

			const correctIndices : number[] = [];
			if (q.type == Types.SINGLE_CHOICE) {
				if (q.correctIndex > q.options.length-1 || q.correctIndex < 0) {
					next();
					return;
				}
				correctIndices.push(q.correctIndex);
				delete q.correctIndex;
			} else {
				for (const ci of q.correctIndices) {
					if (ci > q.options.length-1 || ci < 0) {
						next();
						return;
					}
					correctIndices.push(ci);
				}
				delete q.correctIndices;
			}
			if (correctIndices.length == 0) {
				next();
				return;
			}
			q.correctIndices = correctIndices;
			questions.push(q);
		}

		const quiz_uuid : string = randomUUID();
		const title : string = body.title;
		const attemptsCount : number = body.attemptsCount;

		await pool.execute(`
			INSERT INTO quizzes (uuid, course_uuid, title, attemptsCount)
			VALUES (?, ?, ?, ?)
		`,[quiz_uuid, uuid, title, attemptsCount]);

		for (const q of questions) {
			const question_uuid : string = randomUUID();
			const type : string = q.type;
			const question : string = q.question;
			const correctIndices : number[] = q.correctIndices;
			const options : string[] = q.options;

			await pool.execute(`
				INSERT INTO questions (uuid, quiz_uuid, type, question)
				VALUES (?, ?, ?, ?)
			`,[question_uuid, quiz_uuid, type, question]);

			let idx=0;
			for (const o of options) {
				await pool.execute(`
					INSERT INTO options (uuid, question_uuid, idx, opt, correct)
					VALUES (?, ?, ?, ?, ?)
				`,[randomUUID(), question_uuid, idx, o, correctIndices.indexOf(idx) != -1]);
				idx+=1;
			}
		}

		await updateCourseByUUID(uuid);

		const [quizzes] = await pool.execute(`
			SELECT * FROM quizzes WHERE uuid = ?
		`,[quiz_uuid]);

		res.status(201).json(await formatQuizJSON(quizzes[0]));
	} catch (error) {
		console.error("Error creating quiz:", error);
		res.status(500).json({ error: "Failed to create quiz" });
	}
}, async (req, res) => {
	res.status(400).json({ message: "Invalid data" });
	return;
});

/** GET/DELETE/PUT on /courses/:uuid/quizzes/:quiz_uuid */
courseRoutes.get("/:uuid/quizzes/:quiz_uuid", checkCourse, checkQuiz, async (req, res) => {
	try {
		res.status(200).json(req.quiz);
	} catch (error) {
		console.error("Error fetching quizzes:", error);
		res.status(500).json({ error: "Failed to fetch quizzes" });
	}
});

courseRoutes.delete("/:uuid/quizzes/:quiz_uuid", checkCourse, checkQuiz, authenticate, authenticateAdmin, async (req, res) => {
	try {
		const uuid = req.params.uuid;
		const quiz_uuid = req.params.quiz_uuid;
		const quiz = req.quiz;

		await pool.execute(`
			DELETE FROM quizzes WHERE uuid = ?
		`,[quiz_uuid]);

		await updateCourseByUUID(uuid);

		// This somehow returns nothing, so it works as intended
		res.status(204).json(quiz);
	} catch (error) {
		console.error("Error deleting quizzes:", error);
		res.status(500).json({ error: "Failed to delete quizzes" });
	}
});

courseRoutes.put("/:uuid/quizzes/:quiz_uuid", checkJSON, checkBody, checkCourse, checkQuiz, authenticate, authenticateAdmin, async (req, res, next) => {
	
}, async (req, res) => {
	res.status(400).json({ message: "Invalid data" });
	return;
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

async function findQuizByUUID(uuid : string) {
	const [quizzes] = await pool.execute(`
			SELECT * FROM materials WHERE uuid = ?
	`,[uuid]);
	return quizzes.length == 1 ? (await formatQuizJSON(quizzes[0])) : null;
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

async function formatQuizJSON(entry : JSON) {
	delete entry.course_uuid;

	const [questions] = await pool.execute(`
		SELECT * FROM questions WHERE quiz_uuid = ?
	`,[entry.uuid]);
	for (const q of questions) {
		delete q.quiz_uuid;

		const [db_options] = await pool.execute(`
			SELECT * FROM options WHERE question_uuid = ? ORDER BY idx ASC
		`,[q.uuid]);
		delete q.uuid;

		const options : Array<string> = [];
		const correctIndices : Array<number> = [];

		for (const op of db_options) {
			options.push(op.opt);
			if (op.correct) {
				correctIndices.push(op.idx);
			}
		}
		q.options = options;

		if (q.type == Types.SINGLE_CHOICE) {
			q.correctIndex = correctIndices.at(0);
		} else {
			q.correctIndices = correctIndices;
		}
	};
	entry.questions = questions;
	return entry;
}

async function getQuizzesByCourseUUID(uuid : string) {
	if (!(await findCourseByUUID(uuid))) return;
	const [quizzes] = await pool.execute(`
			SELECT * FROM quizzes WHERE course_uuid = ? ORDER BY created_at DESC
	`,[uuid]);
	for (const entry of quizzes) {
		await formatQuizJSON(entry);
	};
	return quizzes;
};

/** TODO */
async function getFeedByCourseUUID(uuid : string) {
	if (!(await findCourseByUUID(uuid))) return;
	return [];
};

/** Check functions */
async function checkJSON(req : any, res : any, next : any) {
	try {
		if (req.is("application/json")) {
			next();
		} else {
			res.status(400).json({ message: "Incorrect content type" });
			return;
		}
	} catch (error) {
		console.error("Error checking json:", error);
		res.status(500).json({ error: "Failed to check json" });
	}
}

async function checkBody(req : any, res : any, next : any) {
	try {
		if (!req.body) {
			res.status(400).json({ message: "Missing body" });
			return;
		}
		next();
	} catch (error) {
		console.error("Error checking body:", error);
		res.status(500).json({ error: "Failed to check body" });
	}
}

async function checkCourse(req : any, res : any, next : any) {
	try {
		const course = await findCourseByUUID(req.params.uuid);
		if (!course) {
			res.status(404).json({ message: "Course not found" });
			return;
		}
		req.course = course;
		next();
	} catch (error) {
		console.error("Error checking course:", error);
		res.status(500).json({ error: "Failed to check course" });
	}
}

async function checkMaterial(req : any, res : any, next : any) {
	try {
		const material = await findMaterialByUUID(req.params.material_uuid);
		if (!material) {
			res.status(404).json({ message: "Material not found" });
			return;
		}
		req.material = material;
		next();
	} catch (error) {
		console.error("Error checking material:", error);
		res.status(500).json({ error: "Failed to check material" });
	}
}

async function checkQuiz(req : any, res : any, next : any) {
	try {
		const quiz = await findQuizByUUID(req.params.quiz_uuid);
		if (!quiz) {
			res.status(404).json({ message: "Quiz not found" });
			return;
		}
		req.quiz = quiz;
		next();
	} catch (error) {
		console.error("Error checking quiz:", error);
		res.status(500).json({ error: "Failed to check quiz" });
	}
}

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
