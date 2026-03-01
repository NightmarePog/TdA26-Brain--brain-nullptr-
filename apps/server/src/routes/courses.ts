import express from "express";
import multer from 'multer';
import { pool } from "@/db";
import { randomUUID } from "crypto";
import { createDirectory, fileOrDirectoryExists, moveFile } from "@/utils/filesystem";
import { authenticate, authenticateOptional, findUser } from "./users";

enum Types {
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

/** Messages that show up in course feeds */
enum FeedMessages {
	CREATE = "has been created",
	EDIT = "has been edited",
	DELETE = "has been deleted",
};

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
const upload = multer({
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

export const courseRoutes = express.Router();


/** COURSES */
/** GET/POST on /courses/ */
courseRoutes.get("/", authenticateOptional, async (req, res) => {
	try {
		const isLecturer = req.user != null && await findUser(req.user.name);
		const [courses] = await pool.execute(`SELECT * FROM courses ${!isLecturer && "WHERE state != 'draft' AND state != 'archived'" || ""} ORDER BY createdAt DESC`);
		res.status(200).json(courses);
	} catch (error) {
		console.error("Error fetching course summaries:", error);
		res.status(500).json({ error: "Failed to fetch course summaries" });
	}
});

courseRoutes.post("/", checkJSON, checkBody, authenticate, async (req, res) => {
  	try {
		const name: string = req.body.name;
		if (name == null) {
			res.status(400).json({ message: "Missing name" });
			return;
		}

		const uuid: string = randomUUID();
		const desc: string = req.body.description || "";
		const theme: string = req.body.theme || "";
		const openedAt: string = req.body.openedAt != null ? req.body.openedAt : null;
		const duration: string = req.body.duration != null ? req.body.duration : null;

		await pool.execute(`
			INSERT INTO courses (uuid, name, description, state, theme, openedAt, duration)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`,[uuid, name, desc, Types.COURSE_DRAFT, theme, openedAt, duration]);

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

courseRoutes.delete("/:uuid", checkCourse, authenticate, async (req, res) => {
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

courseRoutes.put("/:uuid", checkJSON, checkBody, checkCourse, authenticate, async (req, res) => {
	try {
		const uuid: string = req.params.uuid;
		const name: string = req.body.name != null ? req.body.name : req.course.name;
		const desc: string = req.body.description != null ? req.body.description : req.course.description;
		const theme: string = req.body.theme != null ? req.body.theme : req.course.theme;
		const openedAt: string = req.body.openedAt != null ? req.body.openedAt : req.course.openedAt;
		const duration: string = req.body.duration != null ? req.body.duration : req.course.duration;

		await pool.execute(`
			UPDATE courses
			SET name = ?, description = ?, theme = ?, openedAt = ?, duration = ?
			WHERE uuid = ?
		`, [name, desc, theme, openedAt, duration, uuid]);

		let useAnd: boolean = false;
		async function getAnd(b: boolean) {
			if (!b) {
				return "";
			}
			if (!useAnd) {
				useAnd = true;
				return "";
			}
			return " and";
		}

		const 	nameChanged = name != req.course.name,
				descChanged = desc != req.course.description,
				openedAtChanged = openedAt != req.course.openedAt,
				durationChanged = duration != req.course.duration,
				themeChanged = theme != req.course.theme;
		
		const msg: any =
		`{
			"content": "Course${await getAnd(nameChanged)}${nameChanged ? " name" : ""}${await getAnd(descChanged)}${descChanged ? " description" : ""}${await getAnd(themeChanged)}${themeChanged ? " theme" : ""}${await getAnd(openedAtChanged)}${openedAtChanged ? " opening time" : ""}${await getAnd(durationChanged)}${durationChanged ? " duration" : ""}",
			"type": "${FeedMessages.EDIT}"
		}`
		await updateCourseByUUID(uuid, msg);

		res.status(200).json(await findCourseByUUID(uuid));
			
	} catch (error) {
		console.error("Error updating course:", error);
		res.status(500).json({ error: "Failed to update course" });
	}
});

courseRoutes.post("/:uuid/state", checkJSON, checkBody, checkCourse, authenticate, async (req, res) => {
	try {
		const uuid: string = req.params.uuid;
		const state: string = req.body.state;
		if (state == null) {
			res.status(400).json({ message: "Missing state" });
			return;
		}
		if (state == req.course.state) {
			res.status(400).json({ message: "State is unchanged" });
			return;
		}

		/** Future functionality? */
		switch (state) {
			case Types.COURSE_DRAFT:
			case Types.COURSE_SCHEDULED:
			case Types.COURSE_ARCHIVED:
			case Types.COURSE_LIFE:
			case Types.COURSE_PAUSED:
				break;
			default:
				res.status(400).json({ message: "Incorrect state type" });
				break;
		}

		await pool.execute(`
			UPDATE courses
			SET state = ?
			WHERE uuid = ?
		`, [state, uuid]);

		res.status(200).json(await findCourseByUUID(uuid));
	} catch (error) {
		console.error("Error updating course state:", error);
		res.status(500).json({ error: "Failed to update course state" });
	}
});

/** MODULES */
/** GET/POST on /courses/:uuid/modules/ */
courseRoutes.get("/:uuid/modules", checkCourse, authenticateOptional, async (req, res) => {
	try {
		const uuid : string = req.params.uuid;
		const modules = await getModulesByCourseUUID(uuid);
		const isLecturer = req.user != null && await findUser(req.user.name);

		for (const module of modules) {
			delete module.materials;
			delete module.quizzes;
		}

		res.status(200).json(modules);
	} catch (error) {
		console.error("Error fetching modules:", error);
		res.status(500).json({ error: "Failed to fetch modules" });
	}
});

courseRoutes.post("/:uuid/modules", checkJSON, checkBody, checkCourse, authenticate, async (req, res) => {
  	try {
		const name: string = req.body.name;
		if (name == null) {
			res.status(400).json({ message: "Missing name" });
			return;
		}
		const desc: string = req.body.description != null ? req.body.description : "";

		const uuid: string = randomUUID();
		const courseUuid: string = req.params.uuid;

		const modules: any = await getModulesByCourseUUID(courseUuid);
		const moduleCount: number = modules != null ? modules.length : 0;

		await pool.execute(`
			INSERT INTO modules (uuid, courseUuid, name, description, idx, state)
			VALUES (?, ?, ?, ?, ?, ?)
		`,[uuid, courseUuid, name, desc, moduleCount, Types.MODULE_CLOSED]);

		const msg: any =
			`{
				"content": "Module '${name}'",
				"type": "${FeedMessages.CREATE}"
			}`
		await updateCourseByUUID(courseUuid, msg);

		const module = await findModuleByUUID(uuid);
		res.status(201).json(module);
	} catch (error) {
		console.error("Error creating module:", error);
		res.status(500).json({ error: "Failed to create module" });
	}
});

/** GET/PUT/DELETE on /courses/:uuid/modules/:moduleUuid/ */
courseRoutes.get("/:uuid/modules/:moduleUuid", checkCourse, checkModule, authenticateOptional, async (req, res) => {
	try {
		const module = await formatModuleJSON(req.module);
		const isLecturer = req.user != null && await findUser(req.user.name);

		if (!isLecturer && module.state == Types.MODULE_CLOSED) {
			delete module.materials;
			delete module.quizzes;
		}

		res.status(200).json(module);
	} catch (error) {
		console.error("Error fetching module:", error);
		res.status(500).json({ error: "Failed to fetch module" });
	}
});

courseRoutes.put("/:uuid/modules/:moduleUuid", checkJSON, checkBody, checkCourse, checkModule, authenticate, async (req, res) => {
	try {
		const moduleUuid: string = req.params.moduleUuid;
		const name: string = req.body.name != null ? req.body.name : req.module.name;
		const state: string = req.body.state != null ? req.body.state : req.module.state;

		await pool.execute(`
			UPDATE modules
			SET name = ?, state = ?, updateCount = ?
			WHERE uuid = ?
		`, [name, state, req.module.updateCount+1, moduleUuid]);

		let useAnd: boolean = false;
		async function getAnd(b: boolean) {
			if (!b) {
				return "";
			}
			if (!useAnd) {
				useAnd = true;
				return "";
			}
			return " and";
		}

		const 	nameChanged = name != req.module.name,
				stateChanged = state != req.module.state;
		
		const msg: any =
			`{
				"module": "${req.module.name}",
				"content": "${await getAnd(nameChanged)}${nameChanged ? " name" : ""}${await getAnd(stateChanged)}${stateChanged ? " state" : ""}",
				"type": "${FeedMessages.EDIT}"
			}`
		await updateCourseByUUID(req.params.uuid, msg);

		res.status(200).json(await findModuleByUUID(moduleUuid));
			
	} catch (error) {
		console.error("Error updating module:", error);
		res.status(500).json({ error: "Failed to update module" });
	}
});

courseRoutes.delete("/:uuid/modules/:moduleUuid", checkCourse, checkModule, authenticate, async (req, res) => {
	try {
		const moduleUuid = req.params.moduleUuid;

		await pool.execute(`
			DELETE FROM modules WHERE uuid = ?
		`,[moduleUuid]);

		await pool.execute(`
			UPDATE modules
			SET idx = idx - 1
			WHERE courseUuid = ? AND idx > ?
		`, [req.params.uuid, req.module.idx]);


		const msg: any =
			`{
				"content": "Module '${req.module.name}'",
				"type": "${FeedMessages.DELETE}"
			}`
		await updateCourseByUUID(req.params.uuid, msg);

		res.status(204).json({ message: "Module deleted successfully" });
	} catch (error) {
		console.error("Error deleting module:", error);
		res.status(500).json({ error: "Failed to delete module" });
	}
});

/** MATERIALS */
/** GET/POST on /courses/:uuid/modules/:moduleUuid/materials/ */
courseRoutes.get("/:uuid/modules/:moduleUuid/materials", checkCourse, checkModule, async (req, res) => {
	try {
		const moduleUuid : string = req.params.moduleUuid;
		const materials = await getMaterialsByModuleUUID(moduleUuid);
		res.status(200).json(materials);
	} catch (error) {
		console.error("Error fetching materials:", error);
		res.status(500).json({ error: "Failed to fetch materials" });
	}
});

courseRoutes.post("/:uuid/modules/:moduleUuid/materials", checkCourse, checkModule, authenticate, async (req, res, next) => {
	try {
		const moduleUuid : string = req.params.moduleUuid;
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
	
				const type : string = Types.MATERIAL_URL;
				const faviconUrl : string = `${url}/favicon.ico`;
				const desc : string = req.body.description || "";
	
				await pool.execute(`
					INSERT INTO materials (uuid, moduleUuid)
					VALUES (?, ?)
				`,[uuid, moduleUuid]);
	
				await pool.execute(`
					INSERT INTO urls (uuid, name, type, url, faviconUrl, description)
					VALUES (?, ?, ?, ?, ?, ?)
				`, [uuid, name, type, url, faviconUrl, desc]);

				req.materialUuid = uuid;
				req.name = name;
				next();
			});
		} else if (req.is('multipart/form-data')) {
			/** FILE */
			await upload(req, res, async (err : any) => {
				if (err) {
					res.status(400).json({ message: err.message });
					return;
				}
				if (req.file == null) {
					res.status(400).json({ message: "File doesn't exist" });
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
				const type : string = Types.MATERIAL_FILE;
	
				const tmpFilePath = `/app/tmp/${moduleUuid}`;
				const newDirPath = `/app/materials/${moduleUuid}`;
				const newFilePath = `${newDirPath}/${uuid}`;
	
				if (!(await fileOrDirectoryExists(newDirPath))) {
					await createDirectory(newDirPath);
				}
				await moveFile(tmpFilePath, newFilePath);
	
				await pool.execute(`
					INSERT INTO materials (uuid, moduleUuid)
					VALUES (?, ?)
				`,[uuid, moduleUuid]);
	
				await pool.execute(`
					INSERT INTO files (uuid, name, type, fileUrl, description, mimeType, sizeBytes)
					VALUES (?, ?, ?, ?, ?, ?, ?)
				`, [uuid, name, type, newFilePath, description, mimeType, sizeBytes]);

				req.materialUuid = uuid;
				req.name = name;
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
	const msg: any =
		`{
			"moduleUuid": "${req.params.moduleUuid}",
			"module": "${req.module.name}",
			"content": "Material '${req.name}'",
			"type": "${FeedMessages.CREATE}"
		}`
	await updateCourseByUUID(req.params.uuid, msg);

	const [materials] = await pool.execute(`
		SELECT * FROM materials WHERE uuid = ?
	`,[req.materialUuid]);

	res.status(201).json(await formatMaterialJSON(materials[0]));
});

/** PUT/DELETE on /courses/:uuid/modules/:moduleUuid/materials/:materialUuid/ */
courseRoutes.put("/:uuid/modules/:moduleUuid/materials/:materialUuid", checkCourse, checkModule, checkMaterial, authenticate, async (req, res, next) => {
	try {
		const moduleUuid: string = req.params.moduleUuid;
		const materialUuid: string = req.params.materialUuid;
		const material = req.material;
		const type = material.type;

		if (type == Types.MATERIAL_FILE) {
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
		
					const tmpFilePath = `/app/tmp/${moduleUuid}`;
					const newDirPath = `/app/materials/${moduleUuid}`;
					const newFilePath = `${newDirPath}/${materialUuid}`;

					if (!(await fileOrDirectoryExists(newDirPath))) {
						await createDirectory(newDirPath);
					}
					await moveFile(tmpFilePath, newFilePath);

					await pool.execute(`
						UPDATE files
						SET name = ?, description = ?, mimeType = ?, sizeBytes = ?
						WHERE uuid = ?
					`, [name, description, mimeType, sizeBytes, materialUuid]);
					
					req.name = name;
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
				`, [name, desc, materialUuid]);

				req.name = name;
				next();
			} else {
				res.status(400).json({ message: "Invalid content type" });
				return;
			}
		} else if (type == Types.MATERIAL_URL) {
			const name: string = req.body.name || material.name;
			const desc: string = req.body.description || material.description;
			const url: string = req.body.url != null ? req.body.url : material.url;

			await pool.execute(`
				UPDATE urls
				SET name = ?, description = ?, url = ?, faviconUrl = ?
				WHERE uuid = ?
			`, [name, desc, url, `${url}/favicon.ico`, materialUuid]);

			req.name = name;
			next();
		}
		
	} catch (error) {
		console.error("Error updating material:", error);
		res.status(500).json({ error: "Failed to update material" });
	}
}, async (req, res) => {
	await pool.execute(`
		UPDATE materials
		SET updateCount = ?
		WHERE uuid = ?
	`, [req.material.updateCount+1, req.material.uuid]);

	const msg: any =
		`{
			"moduleUuid": "${req.params.moduleUuid}",
			"module": "${req.module.name}",
			"content": "Material '${req.material.name}'",
			"type": "${FeedMessages.EDIT}"
		}`
	await updateCourseByUUID(req.params.uuid, msg);

	res.status(200).json(await findMaterialByUUID(req.material.uuid));
});

courseRoutes.delete("/:uuid/modules/:moduleUuid/materials/:materialUuid", checkCourse, checkModule, checkMaterial, authenticate, async (req, res) => {
	try {
		const materialUuid: string = req.params.materialUuid;

		await pool.execute(`
			DELETE FROM materials WHERE uuid = ?
		`,[materialUuid]);

		const msg: any =
			`{
				"moduleUuid": "${req.params.moduleUuid}",
				"module": "${req.module.name}",
				"content": "Material ${req.material.name}",
				"type": "${FeedMessages.DELETE}"
			}`
		await updateCourseByUUID(req.params.uuid, msg);

		res.status(204).json({ message: "Material deleted sucessfully" });
	} catch (error) {
		console.error("Error deleting material:", error);
		res.status(500).json({ error: "Failed to delete material" });
	}
});


/** QUIZZES */
/** GET/POST on /courses/:uuid/modules/:moduleUuid/quizzes/ */
courseRoutes.get("/:uuid/modules/:moduleUuid/quizzes", checkCourse, checkModule, async (req,res) => {
	try {
		const moduleUuid : string = req.params.uuid;
		const quizzes = await getQuizzesByModuleUUID(moduleUuid);
		for (const quiz of quizzes) {
			const [answers] = await pool.execute(`
				SELECT * FROM answers WHERE quizUuid = ?
			`,[quiz.uuid]);
			
			quiz.answers = await formatAnswersJSON(answers);
		}
		
		res.status(200).json(quizzes);
	} catch (error) {
		console.error("Error fetching quizzes:", error);
		res.status(500).json({ error: "Failed to fetch quizzes" });
	}
});

courseRoutes.post("/:uuid/modules/:moduleUuid/quizzes", checkJSON, checkBody, checkCourse, checkModule, authenticate, async (req, res) => {
  	try {
		const moduleUuid = req.params.moduleUuid;
		const body = req.body;

		if (body.title == null) {
			res.status(400).json({ message: "Missing title" });
			return;
		}
		if (body.questions == null) {
			res.status(400).json({ message: "Missing questions" });
			return;
		}
		if (!Array.isArray(body.questions)) {
			res.status(400).json({ message: "questions must be an array" });
			return;
		}
		if (body.questions.length == 0) {
			res.status(400).json({ message: "questions must not be empty" });
			return;
		}

		const questions : JSON[] = [];

		/** Parse questions */
		for (const q of body.questions) {
			if (q.type == null) {
				res.status(400).json({ message: "Missing question->type" });
				return;
			}
			if (q.type != Types.QUESTION_SINGLE_CHOICE && q.type != Types.QUESTION_MULTIPLE_CHOICE) {
				res.status(400).json({ message: `question->type must be '${Types.QUESTION_SINGLE_CHOICE}' or '${Types.QUESTION_MULTIPLE_CHOICE}'` });
				return;
			}
			if (q.question == null) {
				res.status(400).json({ message: "Missing question->question" });
				return;
			}
			if (q.options == null) {
				res.status(400).json({ message: "Missing question->options" });
				return;
			}
			if (!Array.isArray(q.options)) {
				res.status(400).json({ message: "question->options must be an array" });
				return;
			}
			if (q.options.length == 0) {
				res.status(400).json({ message: "question->options must not be empty" });
				return;
			}

			const correctIndices : number[] = [];
			if (q.type == Types.QUESTION_SINGLE_CHOICE) {
				if (q.correctIndex == null) {
					res.status(400).json({ message: "Missing question->correctIndex" });
					return;
				}

				if (q.correctIndex > q.options.length-1 || q.correctIndex < 0) {
					res.status(400).json({ message: `question->correctIndex must be within 0 and ${q.options.length-1}` });
					return;
				}
				correctIndices.push(q.correctIndex);
				delete q.correctIndex;
			} else {
				if (q.correctIndices == null) {
					res.status(400).json({ message: "Missing question->correctIndices" });
					return;
				}
				if (!Array.isArray(q.correctIndices)) {
					res.status(400).json({ message: "question->correctIndices must be an array" });
					return;
				}
				if (q.correctIndices.length == 0) {
					res.status(400).json({ message: "question->correctIndices must not be empty" });
					return;
				}

				for (const ci of q.correctIndices) {
					if (ci > q.options.length-1 || ci < 0) {
						res.status(400).json({ message: `question->correctIndices->number must be within 0 and ${q.options.length-1}` });
						return;
					}
					correctIndices.push(ci);
				}
				delete q.correctIndices;
			}
			q.correctIndices = correctIndices;
			questions.push(q);
		}

		const quizUuid : string = randomUUID();
		const title : string = body.title;
		const desc : string = body.description != null ? body.description : "";

		await pool.execute(`
			INSERT INTO quizzes (uuid, moduleUuid, title, description)
			VALUES (?, ?, ?, ?)
		`,[quizUuid, moduleUuid, title, desc]);

		for (const q of questions) {
			const questionUuid : string = randomUUID();
			const type : string = q.type;
			const question : string = q.question;
			const correctIndices : number[] = q.correctIndices;
			const options : string[] = q.options;

			await pool.execute(`
				INSERT INTO questions (uuid, quizUuid, type, question)
				VALUES (?, ?, ?, ?)
			`,[questionUuid, quizUuid, type, question]);

			let idx=0;
			for (const o of options) {
				await pool.execute(`
					INSERT INTO options (uuid, questionUuid, idx, opt, correct)
					VALUES (?, ?, ?, ?, ?)
				`,[randomUUID(), questionUuid, idx, o, correctIndices.indexOf(idx) != -1]);
				idx++;
			}
		}

		const msg: any =
			`{
				"moduleUuid": "${req.params.moduleUuid}",
				"module": "${req.module.name}",
				"content": "Quiz '${title}'",
				"type": "${FeedMessages.CREATE}"
			}`
		await updateCourseByUUID(req.params.uuid, msg);

		const [quizzes] = await pool.execute(`
			SELECT * FROM quizzes WHERE uuid = ?
		`,[quizUuid]);

		res.status(201).json(await formatQuizJSON(quizzes[0]));
	} catch (error) {
		console.error("Error creating quiz:", error);
		res.status(500).json({ error: "Failed to create quiz" });
	}
});

/** GET/DELETE/PUT on /courses/:uuid/modules/:moduleUuid/quizzes/:quizUuid/ */
courseRoutes.get("/:uuid/modules/:moduleUuid/quizzes/:quizUuid", checkCourse, checkModule, checkQuiz, async (req, res) => {
	try {
		const [answers] = await pool.execute(`
			SELECT * FROM answers WHERE quizUuid = ?
		`,[req.params.quizUuid]);
		
		req.quiz.answers = await formatAnswersJSON(answers);

		res.status(200).json(req.quiz);
	} catch (error) {
		console.error("Error fetching quiz:", error);
		res.status(500).json({ error: "Failed to fetch quiz" });
	}
});

courseRoutes.delete("/:uuid/modules/:moduleUuid/quizzes/:quizUuid", checkCourse, checkModule, checkQuiz, authenticate, async (req, res) => {
	try {
		const quizUuid = req.params.quizUuid;

		await pool.execute(`
			DELETE FROM quizzes WHERE uuid = ?
		`,[quizUuid]);

		const msg: any =
			`{
				"moduleUuid": "${req.params.moduleUuid}",
				"module": "${req.module.name}",
				"content": "Quiz '${req.quiz.title}'",
				"type": "${FeedMessages.DELETE}"
			}`
		await updateCourseByUUID(req.params.uuid, msg);

		res.status(204).json(({ message: "Quiz deleted sucessfully" }));
	} catch (error) {
		console.error("Error deleting quiz:", error);
		res.status(500).json({ error: "Failed to delete quiz" });
	}
});

courseRoutes.put("/:uuid/modules/:moduleUuid/quizzes/:quizUuid", checkJSON, checkBody, checkCourse, checkModule, checkQuiz, authenticate, async (req, res) => {
	try {
		const quizUuid : string = req.params.quizUuid;
		const body : JSON = req.body;
		const quiz : JSON = req.quiz;

		const title : string = body.title != null ? body.title : quiz.title;
		const questions : JSON[] = body.questions != null ? [] : quiz.questions;
		const desc : string = body.description != null ? body.description : quiz.description;
		
		if (body.questions != null) {
			if (!Array.isArray(body.questions)) {
				res.status(400).json({ message: "questions must be an array" });
				return;
			}
			if (body.questions.length == 0) {
				res.status(400).json({ message: "questions must not be empty" });
				return;
			}
	
			/** Parse questions */
			for (const q of body.questions) {
				if (q.type == null) {
					res.status(400).json({ message: "Missing question->type" });
					return;
				}
				if (q.type != Types.QUESTION_SINGLE_CHOICE && q.type != Types.QUESTION_MULTIPLE_CHOICE) {
					res.status(400).json({ message: `question->type must be '${Types.QUESTION_SINGLE_CHOICE}' or '${Types.QUESTION_MULTIPLE_CHOICE}'` });
					return;
				}
				if (q.question == null) {
					res.status(400).json({ message: "Missing question->question" });
					return;
				}
				if (q.options == null) {
					res.status(400).json({ message: "Missing question->options" });
					return;
				}
				if (!Array.isArray(q.options)) {
					res.status(400).json({ message: "question->options must be an array" });
					return;
				}
				if (q.options.length == 0) {
					res.status(400).json({ message: "question->options must not be empty" });
					return;
				}
	
				const correctIndices : number[] = [];
				if (q.type == Types.QUESTION_SINGLE_CHOICE) {
					if (q.correctIndex == null) {
						res.status(400).json({ message: "Missing question->correctIndex" });
						return;
					}
	
					if (q.correctIndex > q.options.length-1 || q.correctIndex < 0) {
						res.status(400).json({ message: `question->correctIndex must be within 0 and ${q.options.length-1}` });
						return;
					}
					correctIndices.push(q.correctIndex);
					delete q.correctIndex;
				} else {
					if (q.correctIndices == null) {
						res.status(400).json({ message: "Missing question->correctIndices" });
						return;
					}
					if (!Array.isArray(q.correctIndices)) {
						res.status(400).json({ message: "question->correctIndices must be an array" });
						return;
					}
					if (q.correctIndices.length == 0) {
						res.status(400).json({ message: "question->correctIndices must not be empty" });
						return;
					}
	
					for (const ci of q.correctIndices) {
						if (ci > q.options.length-1 || ci < 0) {
							res.status(400).json({ message: `question->correctIndices->number must be within 0 and ${q.options.length-1}` });
							return;
						}
						correctIndices.push(ci);
					}
					delete q.correctIndices;
				}
				q.correctIndices = correctIndices;
				questions.push(q);
			}

			await pool.execute(`
				DELETE FROM questions WHERE quizUuid = ?
			`,[quizUuid]);

			for (const q of questions) {
				const questionUuid : string = randomUUID();
				const type : string = q.type;
				const question : string = q.question;
				const correctIndices : number[] = q.correctIndices;
				const options : string[] = q.options;

				await pool.execute(`
					INSERT INTO questions (uuid, quizUuid, type, question)
					VALUES (?, ?, ?, ?)
				`,[questionUuid, quizUuid, type, question]);

				let idx=0;
				for (const o of options) {
					await pool.execute(`
						INSERT INTO options (uuid, questionUuid, idx, opt, correct)
						VALUES (?, ?, ?, ?, ?)
					`,[randomUUID(), questionUuid, idx, o, correctIndices.indexOf(idx) != -1]);
					idx++;
				}
			}
		}

		await pool.execute(`
			UPDATE quizzes
			SET title = ?, updateCount = ?, description = ?
			WHERE uuid = ?
		`,[title, quiz.updateCount+1, desc, quizUuid]);

		const msg: any =
			`{
				"moduleUuid": "${req.params.moduleUuid}",
				"module": "${req.module.name}",
				"content": "Quiz '${req.quiz.title}'",
				"type": "${FeedMessages.EDIT}"
			}`
		await updateCourseByUUID(req.params.uuid, msg);

		res.status(201).json(await formatQuizJSON(await findQuizByUUID(quizUuid)));
	} catch (error) {
		console.error("Error updating quiz:", error);
		res.status(500).json({ error: "Failed to update quiz" });
	}
});

/** POST/DELETE/PUT on /courses/:uuid/modules/:moduleUuid/quizzes/:quizUuid/questions/ */
courseRoutes.post("/:uuid/modules/:moduleUuid/quizzes/:quizUuid/questions", checkJSON, checkBody, checkCourse, checkModule, checkQuiz, authenticate, async (req, res) => {
	try {
		const quizUuid : string = req.params.quizUuid;
		const body : JSON = req.body;
		const quiz : JSON = req.quiz;

		const question = body.question;
		if (question == null) {
			res.status(400).json({ message: "Missing question" });
			return;
		}

		if (question.type == null) {
			res.status(400).json({ message: "Missing question->type" });
			return;
		}
		if (question.type != Types.QUESTION_SINGLE_CHOICE && question.type != Types.QUESTION_MULTIPLE_CHOICE) {
			res.status(400).json({ message: `question->type must be '${Types.QUESTION_SINGLE_CHOICE}' or '${Types.QUESTION_MULTIPLE_CHOICE}'` });
			return;
		}
		if (question.question == null) {
			res.status(400).json({ message: "Missing question->question" });
			return;
		}
		if (question.options == null) {
			res.status(400).json({ message: "Missing question->options" });
			return;
		}
		if (!Array.isArray(question.options)) {
			res.status(400).json({ message: "question->options must be an array" });
			return;
		}
		if (question.options.length == 0) {
			res.status(400).json({ message: "question->options must not be empty" });
			return;
		}

		const correctIndices : number[] = [];
		if (question.type == Types.QUESTION_SINGLE_CHOICE) {
			if (question.correctIndex == null) {
				res.status(400).json({ message: "Missing question->correctIndex" });
				return;
			}

			if (question.correctIndex > question.options.length-1 || question.correctIndex < 0) {
				res.status(400).json({ message: `question->correctIndex must be within 0 and ${question.options.length-1}` });
				return;
			}
			correctIndices.push(question.correctIndex);
			delete question.correctIndex;
		} else {
			if (question.correctIndices == null) {
				res.status(400).json({ message: "Missing question->correctIndices" });
				return;
			}
			if (!Array.isArray(question.correctIndices)) {
				res.status(400).json({ message: "question->correctIndices must be an array" });
				return;
			}
			if (question.correctIndices.length == 0) {
				res.status(400).json({ message: "question->correctIndices must not be empty" });
				return;
			}

			for (const ci of question.correctIndices) {
				if (ci > question.options.length-1 || ci < 0) {
					res.status(400).json({ message: `question->correctIndices->number must be within 0 and ${q.options.length-1}` });
					return;
				}
				correctIndices.push(ci);
			}
			delete question.correctIndices;
		}
		question.correctIndices = correctIndices;

		const questionUuid = randomUUID();

		await pool.execute(`
			INSERT INTO questions (uuid, quizUuid, type, question)
			VALUES (?, ?, ?, ?)
		`,[questionUuid, quizUuid, question.type, question.question]);

		let idx=0;
		for (const o of question.options) {
			await pool.execute(`
				INSERT INTO options (uuid, questionUuid, idx, opt, correct)
				VALUES (?, ?, ?, ?, ?)
			`,[randomUUID(), questionUuid, idx, o, correctIndices.indexOf(idx) != -1]);
			idx++;
		}

		await pool.execute(`
			UPDATE quizzes
			SET updateCount = ?
			WHERE uuid = ?
		`,[quiz.updateCount+1, quizUuid]);

		const msg: any =
			`{
				"moduleUuid": "${req.params.moduleUuid}",
				"module": "${req.module.name}",
				"content": "Quiz '${quiz.title}'",
				"type": "${FeedMessages.EDIT}"
			}`
		await updateCourseByUUID(req.params.uuid, msg);

		res.status(201).json(await formatQuizJSON(await findQuizByUUID(quizUuid)));

	} catch (error) {
		console.error("Error creating question:", error);
		res.status(500).json({ error: "Failed to create question" });
	}
});

courseRoutes.put("/:uuid/modules/:moduleUuid/quizzes/:quizUuid/questions/:questionUuid", checkJSON, checkBody, checkCourse, checkModule, checkQuiz, checkQuestion, authenticate, async (req, res) => {
	try {
		const quizUuid : string = req.params.quizUuid;
		const questionUuid : string = req.params.questionUuid;
		const body : JSON = req.body;
		const quiz : JSON = req.quiz;

		const question = body.question;
		if (question != null) {
			if (question.type == null) {
				res.status(400).json({ message: "Missing question->type" });
				return;
			}
			if (question.type != Types.QUESTION_SINGLE_CHOICE && question.type != Types.QUESTION_MULTIPLE_CHOICE) {
				res.status(400).json({ message: `question->type must be '${Types.QUESTION_SINGLE_CHOICE}' or '${Types.QUESTION_MULTIPLE_CHOICE}'` });
				return;
			}
			if (question.question == null) {
				res.status(400).json({ message: "Missing question->question" });
				return;
			}
			if (question.options == null) {
				res.status(400).json({ message: "Missing question->options" });
				return;
			}
			if (!Array.isArray(question.options)) {
				res.status(400).json({ message: "question->options must be an array" });
				return;
			}
			if (question.options.length == 0) {
				res.status(400).json({ message: "question->options must not be empty" });
				return;
			}
	
			const correctIndices : number[] = [];
			if (question.type == Types.QUESTION_SINGLE_CHOICE) {
				if (question.correctIndex == null) {
					res.status(400).json({ message: "Missing question->correctIndex" });
					return;
				}
	
				if (question.correctIndex > question.options.length-1 || question.correctIndex < 0) {
					res.status(400).json({ message: `question->correctIndex must be within 0 and ${question.options.length-1}` });
					return;
				}
				correctIndices.push(question.correctIndex);
				delete question.correctIndex;
			} else {
				if (question.correctIndices == null) {
					res.status(400).json({ message: "Missing question->correctIndices" });
					return;
				}
				if (!Array.isArray(question.correctIndices)) {
					res.status(400).json({ message: "question->correctIndices must be an array" });
					return;
				}
				if (question.correctIndices.length == 0) {
					res.status(400).json({ message: "question->correctIndices must not be empty" });
					return;
				}
	
				for (const ci of question.correctIndices) {
					if (ci > question.options.length-1 || ci < 0) {
						res.status(400).json({ message: `question->correctIndices->number must be within 0 and ${q.options.length-1}` });
						return;
					}
					correctIndices.push(ci);
				}
				delete question.correctIndices;
			}
			question.correctIndices = correctIndices;

			await pool.execute(`
				UPDATE questions
				SET type = ?, question = ?
				WHERE uuid = ?
			`,[question.type, question.question, questionUuid]);
	
			await pool.execute(`
				DELETE FROM options WHERE questionUuid = ?
			`,[questionUuid]);

			let idx=0;
			for (const o of question.options) {
				await pool.execute(`
					INSERT INTO options (uuid, questionUuid, idx, opt, correct)
					VALUES (?, ?, ?, ?, ?)
				`,[randomUUID(), questionUuid, idx, o, correctIndices.indexOf(idx) != -1]);
				idx++;
			}
		}

		await pool.execute(`
			UPDATE quizzes
			SET updateCount = ?
			WHERE uuid = ?
		`,[quiz.updateCount+1, quizUuid]);

		const msg: any =
			`{
				"moduleUuid": "${req.params.moduleUuid}",
				"module": "${req.module.name}",
				"content": "Quiz '${quiz.title}'",
				"type": "${FeedMessages.EDIT}"
			}`
		await updateCourseByUUID(req.params.uuid, msg);

		res.status(201).json(await formatQuizJSON(await findQuizByUUID(quizUuid)));

	} catch (error) {
		console.error("Error updating question:", error);
		res.status(500).json({ error: "Failed to update question" });
	}
});

courseRoutes.delete("/:uuid/modules/:moduleUuid/quizzes/:quizUuid/questions/:questionUuid", checkCourse, checkModule, checkQuiz, checkQuestion, authenticate, async (req, res) => {
	try {
		const quizUuid : string = req.params.quizUuid;
		const questionUuid: string = req.params.questionUuid;
		const quiz : JSON = req.quiz;

		await pool.execute(`
			UPDATE quizzes
			SET updateCount = ?
			WHERE uuid = ?
		`,[quiz.updateCount+1, quizUuid]);

		await pool.execute(`
			DELETE FROM questions WHERE uuid = ?
		`,[questionUuid]);

		const msg: any =
			`{
				"moduleUuid": "${req.params.moduleUuid}",
				"module": "${req.module.name}",
				"content": "Quiz '${quiz.title}'",
				"type": "${FeedMessages.EDIT}"
			}`
		await updateCourseByUUID(req.params.uuid, msg);

		res.status(204).json(({ message: "Question deleted sucessfully" }));

	} catch (error) {
		console.error("Error deleting question:", error);
		res.status(500).json({ error: "Failed to delete question" });
	}
});

/** POST on /courses/:uuid/modules/:moduleUuid/quizzes/:quizUuid/submit/ */
courseRoutes.post("/:uuid/modules/:moduleUuid/quizzes/:quizUuid/submit", checkJSON, checkBody, checkCourse, checkModule, checkQuiz, async (req, res) => {
	try {
		const quizUuid : string = req.params.quizUuid;
		const answers : JSON[] = req.body.answers;
		if (answers == null) {
			res.status(400).json({ message: "Missing answers" });
			return;
		}
		if (!Array.isArray(answers)) {
			res.status(400).json({ message: "answers must be an array" });
			return;
		}
		const ansCount = answers.length;

		const [questions] = await pool.execute(`
			SELECT * FROM questions WHERE quizUuid = ?
		`,[quizUuid]);

		let score : number = 0, maxScore : number = 0;
		const correctPerQuestion : boolean[] = [];

		let correctAnsIdx = 0;
		for (const q of questions) {
			
			const [correctAnswers] = await pool.execute(`
			 	SELECT * FROM options WHERE questionUuid = ? AND correct = ?
			`,[q.uuid, true]);
			maxScore+=correctAnswers.length;

			if (correctAnsIdx >= ansCount) {
				correctPerQuestion.push(false);
				continue;
			}
			correctAnsIdx++;

			let ans = null;
			for (const a of answers) {
				if (a.uuid == null) {
					res.status(400).json({ message: "Missing answer->uuid" });
					return;
				}
				if (a.uuid == q.uuid) {
					ans = a;
				}
			}
			if (ans == null) {
				res.status(404).json({ message: "Invalid question uuid" });
				return;
			}

			if (q.type == Types.QUESTION_SINGLE_CHOICE) {
				if (ans.selectedIndex == null) {
					res.status(400).json({ message: "Missing answer->selectedIndex" });
					return;
				}
				const isCorrect = ans.selectedIndex == correctAnswers.at(0).idx;
				if (isCorrect) {
					score += 1;
				}
				correctPerQuestion.push(isCorrect);
			} else {
				if (ans.selectedIndices == null) {
					res.status(400).json({ message: "Missing answer->selectedIndices" });
					return;
				}
				if (!Array.isArray(ans.selectedIndices)) {
					res.status(400).json({ message: "answer->selectedIndices must be an array" });
					return;
				}
				if (ans.selectedIndices.length == 0) {
					correctPerQuestion.push(false);
					continue;
				}
				ans.selectedIndices = [...new Set(ans.selectedIndices)];

				const correctIndices: number[] = [];
				for (const ci of correctAnswers) {
					correctIndices.push(ci.idx);
				}

				let totalCorrect : number = 0;
				for (const a of ans.selectedIndices) {
					totalCorrect += correctIndices.indexOf(a) != -1 ? 1 : 0;
				}

				const totalBad : number = ans.selectedIndices.filter(n => !correctIndices.includes(n)).length;
				let corrects : number = Math.max(0,totalCorrect-totalBad);
				score += corrects;
				correctPerQuestion.push(corrects == correctAnswers.length);
			}
		}

		const answerUuid : string = randomUUID();
		let cpq: string = "";
		for (const q of correctPerQuestion) cpq += q + ",";

		await pool.execute(`
			INSERT INTO answers (uuid, quizUuid, score, maxScore, correctPerQuestion)
			VALUES (?, ?, ?, ?, ?)
		`,[answerUuid, quizUuid, score, maxScore, cpq]);

		await pool.execute(`
			UPDATE quizzes
			SET attemptsCount = ?
			WHERE uuid = ?
		`,[req.quiz.attemptsCount+1, quizUuid]);

		const [db_answers] = await pool.execute(`
			SELECT * FROM answers WHERE uuid = ?
		`,[answerUuid]);

		res.status(200).json((await formatAnswersJSON(db_answers))[0]);
	} catch (error) {
		console.error("Error submitting quiz:", error);
		res.status(500).json({ error: "Failed to submit quiz" });
	}
});


/** FEED */
/** GET/POST on /courses/:uuid/feed/ */
courseRoutes.get("/:uuid/feed", checkCourse, async (req, res) => {
	try {
		const uuid : string = req.params.uuid;
		const feed = await getFeedByCourseUUID(uuid);
		res.status(200).json(feed);
	} catch (error) {
		console.error("Error fetching feed:", error);
		res.status(500).json({ error: "Failed to fetch feed" });
	}
});

courseRoutes.post("/:uuid/feed", checkJSON, checkBody, checkCourse, authenticate, async (req, res) => {
	try {
		const uuid : string = req.params.uuid;
		const message : string = req.body.message;
		if (message == null) {
			res.status(400).json({ message: "Missing message" });
			return;
		}

		const feedUuid = randomUUID();

		await pool.execute(`
			INSERT INTO feed (uuid, courseUuid, type, message, edited, author)
			VALUES (?, ?, ?, ?, ?, ?)
		`,[feedUuid, uuid, Types.FEED_MANUAL, message, false, req.user.name]);

		const [feed] = await pool.execute(`
			SELECT * FROM feed WHERE uuid = ?
		`,[feedUuid]);

		res.status(201).json(await formatFeedJSON(feed[0]));
	} catch (error) {
		console.error("Error creating feed:", error);
		res.status(500).json({ error: "Failed to create feed" });
	}
});

/** PUT/DELETE on /courses/:uuid/feed/:feedUuid/ */
courseRoutes.put("/:uuid/feed/:feedUuid", checkJSON, checkBody, checkCourse, checkFeed, authenticate, async (req, res) => {
	try {
		if (req.feed.type == Types.FEED_SYSTEM) {
			res.status(400).json({ message: "Can not update system feed message" });
			return;
		}
		const feedUuid : string = req.params.feedUuid;
		const message : string = req.body.message != null ? req.body.message : req.feed.message;

		await pool.execute(`
			UPDATE feed
			SET message = ?, edited = ?
			WHERE uuid = ?
		`,[message, true, feedUuid]);

		res.status(200).json(await findFeedByUUID(feedUuid));
	} catch (error) {
		console.error("Error updating feed:", error);
		res.status(500).json({ error: "Failed to update feed" });
	}
});

courseRoutes.delete("/:uuid/feed/:feedUuid", checkCourse, checkFeed, authenticate, async (req, res) => {
	try {
		if (req.feed.type == Types.FEED_SYSTEM) {
			res.status(400).json({ message: "Can not delete system feed message" });
			return;
		}
		const feedUuid : string = req.params.feedUuid;

		await pool.execute(`
			DELETE FROM feed WHERE uuid = ?
		`,[feedUuid]);

		res.status(204).json({ message: "Feed deleted successfully" });
	} catch (error) {
		console.error("Error deleting feed:", error);
		res.status(500).json({ error: "Failed to delete feed" });
	}
});

/** GET on /courses/:uuid/feed/stream */
courseRoutes.get("/:uuid/feed/stream", checkCourse, async (req, res) => {
	try {
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
			'Content-Encoding': 'none',
			'Access-Control-Allow-Origin': '*'
		});
		res.flushHeaders();

		let [latest] = await pool.execute(`
			SELECT * FROM feed WHERE courseUuid = ? ORDER BY createdAt DESC LIMIT 1
		`,[req.params.uuid]);

		const heartbeatInterval = setInterval(() => {
			res.write("event: heartbeat\n\n");
			res.flush();
		}, 20000);

		const dataInterval = setInterval(async () => {
			const [newLatest] = await pool.execute(`
				SELECT * FROM feed WHERE courseUuid = ? ORDER BY createdAt DESC LIMIT 1
			`,[req.params.uuid]);

			if ((latest[0] != null && latest[0].uuid != newLatest[0].uuid) || (latest[0] == null && newLatest[0] != null)) {
				latest = newLatest;
				res.write(`event: new_post\ndata: ${JSON.stringify(await formatFeedJSON(latest[0]))}\n\n`);
				res.flush();
			}
		}, 2000);

		res.on("close", () => {
			clearInterval(heartbeatInterval);
			clearInterval(dataInterval);
			res.end();
		});
	} catch (error) {
		console.error("Error streaming feed:", error);
		res.end();
		res.status(500).json({ error: "Failed to stream feed" });
	}
});

/** FORMAT FUNCTIONS */
/** Formats materials */
async function formatMaterialJSON(entry : JSON) {
	delete entry.courseUuid;

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

/** Formats quizzes */
async function formatQuizJSON(entry : JSON) {
	delete entry.courseUuid;

	const [questions] = await pool.execute(`
		SELECT * FROM questions WHERE quizUuid = ?
	`,[entry.uuid]);
	let qCount = 0;
	let maxScore = 0;
	for (const q of questions) {
		qCount++;
		delete q.quizUuid;

		const [db_options] = await pool.execute(`
			SELECT * FROM options WHERE questionUuid = ? ORDER BY idx ASC
		`,[q.uuid]);

		const options : string[] = [];
		const correctIndices : number[] = [];

		for (const op of db_options) {
			options.push(op.opt);
			if (op.correct) {
				maxScore++;
				correctIndices.push(op.idx);
			}
		}
		q.options = options;

		if (q.type == Types.QUESTION_SINGLE_CHOICE) {
			q.correctIndex = correctIndices.at(0);
		} else {
			q.correctIndices = correctIndices;
		}
	};
	entry.maxScore = maxScore;
	entry.questionCount = qCount;
	entry.questions = questions;

	return entry;
};

/** Formats quizzes */
async function formatAnswersJSON(entry : JSON) {
	for (const q of entry) {
		delete q.uuid;
		delete q.quizUuid;
		let cpq : Array<string> = q.correctPerQuestion.split(",");
		q.correctPerQuestion = [];
		for (const c of cpq) {
			if (c == "false") {
				q.correctPerQuestion.push(false);
			} else if (c == "true") {
				q.correctPerQuestion.push(true);
			}
		}
	}

	return entry;
};

/** Formats feed */
async function formatFeedJSON(entry : JSON) {
	delete entry.courseUuid;
	entry.edited = entry.edited ? true : false;
	return entry;
}

/** Formats module */
async function formatModuleJSON(entry : JSON) {
	delete entry.courseUuid;

	const materials = await getMaterialsByModuleUUID(entry.uuid);
	if (!materials) return;
	entry.materials = materials;

	const quizzes = await getQuizzesByModuleUUID(entry.uuid);
	if (!quizzes) return;
	entry.quizzes = quizzes;

	return entry;
}


/** FIND FUNCTIONS */
/** Finds specific course */
async function findCourseByUUID(uuid : string) {
	const [courses] = await pool.execute(`
			SELECT * FROM courses WHERE uuid = ?
	`,[uuid]);
	return courses.length == 1 ? courses[0] : null;
};

/** Finds specific module */
async function findModuleByUUID(uuid : string) {
	const [modules] = await pool.execute(`
			SELECT * FROM modules WHERE uuid = ?
	`,[uuid]);
	return modules.length == 1 ? modules[0] : null;
};

/** Finds specific material */
async function findMaterialByUUID(uuid : string) {
	const [materials] = await pool.execute(`
			SELECT * FROM materials WHERE uuid = ?
	`,[uuid]);
	return materials.length == 1 ? (await formatMaterialJSON(materials[0])) : null;
};

/** Finds specific quiz */
async function findQuizByUUID(uuid : string) {
	const [quizzes] = await pool.execute(`
			SELECT * FROM quizzes WHERE uuid = ?
	`,[uuid]);
	return quizzes.length == 1 ? (await formatQuizJSON(quizzes[0])) : null;
};

/** Finds specific question */
async function findQuestionByUUID(uuid : string) {
	const [questions] = await pool.execute(`
			SELECT * FROM questions WHERE uuid = ?
	`,[uuid]);
	return questions.length == 1 ? (questions[0]) : null;
};

/** Finds specific feed */
async function findFeedByUUID(uuid : string) {
	const [feed] = await pool.execute(`
			SELECT * FROM feed WHERE uuid = ?
	`,[uuid]);
	return feed.length == 1 ? (await formatFeedJSON(feed[0])) : null;
};


/** GET FUNCTIONS */
/** Gets all course modules */
async function getModulesByCourseUUID(uuid : string) {
	if (!(await findCourseByUUID(uuid))) return;
	const [modules] = await pool.execute(`
			SELECT * FROM modules WHERE courseUuid = ? ORDER BY idx ASC
	`,[uuid]);
	for (const entry of modules) {
		await formatModuleJSON(entry);
	};
	return modules;
};

/** Gets all course materials */
async function getMaterialsByModuleUUID(uuid : string) {
	if (!(await findModuleByUUID(uuid))) return;
	const [materials] = await pool.execute(`
			SELECT * FROM materials WHERE moduleUuid = ? ORDER BY createdAt DESC
	`,[uuid]);
	for (const entry of materials) {
		await formatMaterialJSON(entry);
	};
	return materials;
};

/** Gets all course quizzes */
async function getQuizzesByModuleUUID(uuid : string) {
	if (!(await findModuleByUUID(uuid))) return;
	const [quizzes] = await pool.execute(`
			SELECT * FROM quizzes WHERE moduleUuid = ? ORDER BY createdAt DESC
	`,[uuid]);
	for (const entry of quizzes) {
		await formatQuizJSON(entry);
	};
	return quizzes;
};

/** Gets all course feed */
async function getFeedByCourseUUID(uuid : string) {
	if (!(await findCourseByUUID(uuid))) return;
	const [feed] = await pool.execute(`
			SELECT * FROM feed WHERE courseUuid = ? ORDER BY createdAt DESC
	`,[uuid]);
	for (const entry of feed) {
		await formatFeedJSON(entry);
	};
	return feed;
};

/** Gets course details */
async function getCourseDetailsByUUID(uuid : string) {
	/** for now only get materials ontop of the initial course */
	const course = await findCourseByUUID(uuid);
	if (!course) return;

	const modules = await getModulesByCourseUUID(uuid);
	if (!modules) return;
	for (const m of modules) {
		delete m.materials;
		delete m.quizzes;
	}

	const feed = await getFeedByCourseUUID(uuid);
	if (!feed) return;

	course.modules = modules;
	course.feed = feed;

	return course;
};


/** CHECK FUNCTIONS */
/** Checks for JSON content type */
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

/** Checks for JSON body */
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

/** Checks for course in params */
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

/** Checks for module in params */
async function checkModule(req : any, res : any, next : any) {
	try {
		const module = await findModuleByUUID(req.params.moduleUuid);
		if (!module) {
			res.status(404).json({ message: "Module not found" });
			return;
		}
		req.module = module;
		next();
	} catch (error) {
		console.error("Error checking module:", error);
		res.status(500).json({ error: "Failed to check module" });
	}
}

/** Checks for material in params */
async function checkMaterial(req : any, res : any, next : any) {
	try {
		const material = await findMaterialByUUID(req.params.materialUuid);
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

/** Checks for quiz in params */
async function checkQuiz(req : any, res : any, next : any) {
	try {
		const quiz = await findQuizByUUID(req.params.quizUuid);
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

/** Checks for question in params */
async function checkQuestion(req : any, res : any, next : any) {
	try {
		const question = await findQuestionByUUID(req.params.questionUuid);
		if (!question) {
			res.status(404).json({ message: "Question not found" });
			return;
		}
		req.question = question;
		next();
	} catch (error) {
		console.error("Error checking question:", error);
		res.status(500).json({ error: "Failed to check question" });
	}
}


/** Checks for feed in params */
async function checkFeed(req : any, res : any, next : any) {
	try {
		const feed = await findFeedByUUID(req.params.feedUuid);
		if (!feed) {
			res.status(404).json({ message: "Feed not found" });
			return;
		}
		req.feed = feed;
		next();
	} catch (error) {
		console.error("Error checking feed:", error);
		res.status(500).json({ error: "Failed to check feed" });
	}
}


/** MISCELLANEOUS FUNCTIONS */
/** Creates a system feed message */
async function systemFeedMessage(uuid : string, message : string) {
	const course = await findCourseByUUID(uuid);
	if (!course) {
		return;
	}

	await pool.execute(`
		INSERT INTO feed (uuid, courseUuid, type, message, edited, author)
		VALUES (?, ?, ?, ?, ?, ?)
	`,[randomUUID(), uuid, Types.FEED_SYSTEM, message, false, Types.FEED_SYSTEM]);
}

/** Updates module updateCount */
async function updateModuleByUUID(uuid: string) {
	const module = await findModuleByUUID(uuid);
	if (!module) {
		return;
	}

	await pool.execute(`
		UPDATE modules
		SET updateCount = ?
		WHERE uuid = ?
	`, [module.updateCount+1, uuid]);
}

/** Updates course updateCount */
async function updateCourseByUUID(uuid : string, message? : any) {
	const course = await findCourseByUUID(uuid);
	if (!course) {
		return;
	}

	if (message != null) {
		message = JSON.parse(message);
		if (message.moduleUuid != null) await updateModuleByUUID(message.moduleUuid);

		const msg = `${message.content != null ? message.content : ""}${message.type != null ? " "+message.type : ""}${message.module != null ? " in module '"+message.module+"'" : ""}`;
		systemFeedMessage(uuid, msg);
	}

	await pool.execute(`
		UPDATE courses
		SET updateCount = ?
		WHERE uuid = ?
	`, [course.updateCount+1, uuid]);
};
