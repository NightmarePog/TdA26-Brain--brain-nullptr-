import express from "express";
import multer from 'multer';
import { pool } from "@/db";
import { randomUUID } from "crypto";
import { createDirectory, fileOrDirectoryExists, moveFile } from "@/utils/filesystem";
import { authenticate, authenticateAdmin, authenticateOptional, findUser } from "./users";

enum Types {
	FILE = "file",
	URL = "url",
	SINGLE_CHOICE = "singleChoice",
	MULTIPLE_CHOICE = "multipleChoice",
	MANUAL = "manual",
	SYSTEM = "system"
};

/** Messages that show up in course feeds */
enum FeedMessages {
	CREATE = "has been uploaded",
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
}).single(Types.FILE);

export const courseRoutes = express.Router();


/** COURSES */
/** GET/POST on /courses/ */
courseRoutes.get("/", async (req, res) => {
	try {
		const [courses] = await pool.execute("SELECT * FROM courses ORDER BY createdAt DESC");
		res.status(200).json(courses);
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

		const nameChanged = name != req.course.name, descChanged = desc != req.course.description;
		await updateCourseByUUID(uuid, `Course ${nameChanged && descChanged ? "name and description" : (nameChanged && !descChanged ? "name" : "description")} ${FeedMessages.EDIT}`);

		res.status(200).json(await findCourseByUUID(uuid));
			
	} catch (error) {
		console.error("Error updating course:", error);
		res.status(500).json({ error: "Failed to update course" });
	}
});


/** MATERIALS */
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
		const courseUuid : string = req.params.uuid;
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
					INSERT INTO materials (uuid, courseUuid)
					VALUES (?, ?)
				`,[uuid, courseUuid]);
	
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
	
				const tmpFilePath = `/app/tmp/${courseUuid}`;
				const newDirPath = `/app/materials/${courseUuid}`;
				const newFilePath = `${newDirPath}/${uuid}`;
	
				if (!(await fileOrDirectoryExists(newDirPath))) {
					await createDirectory(newDirPath);
				}
				await moveFile(tmpFilePath, newFilePath);
	
				await pool.execute(`
					INSERT INTO materials (uuid, courseUuid)
					VALUES (?, ?)
				`,[uuid, courseUuid]);
	
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
	await updateCourseByUUID(req.params.uuid, `Material '${req.name}' ${FeedMessages.CREATE}`);

	const [materials] = await pool.execute(`
		SELECT * FROM materials WHERE uuid = ?
	`,[req.materialUuid]);

	res.status(201).json(await formatMaterialJSON(materials[0]));
});

/** PUT/DELETE on /courses/:uuid/materials/:materialUuid/ */
courseRoutes.put("/:uuid/materials/:materialUuid", checkCourse, checkMaterial, authenticate, authenticateAdmin, async (req, res, next) => {
	try {
		const uuid: string = req.params.uuid;
		const materialUuid: string = req.params.materialUuid;
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
		} else if (type == Types.URL) {
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

	await updateCourseByUUID(req.params.uuid, `Material '${req.name}'${(req.name != req.material.name ? ` (originally '${req.material.name}')` : "")} ${FeedMessages.EDIT}`);

	res.status(200).json(await findMaterialByUUID(req.material.uuid));
});

courseRoutes.delete("/:uuid/materials/:materialUuid", checkCourse, checkMaterial, authenticate, authenticateAdmin, async (req, res) => {
	try {
		const uuid: string = req.params.uuid;
		const materialUuid: string = req.params.materialUuid;

		await pool.execute(`
			DELETE FROM materials WHERE uuid = ?
		`,[materialUuid]);

		await updateCourseByUUID(uuid, `Material ${req.material.name} ${FeedMessages.DELETE}`);

		res.status(204).json({ message: "Material deleted sucessfully" });
	} catch (error) {
		console.error("Error deleting material:", error);
		res.status(500).json({ error: "Failed to delete material" });
	}
});


/** QUIZZES */
/** GET/POST on /courses/:uuid/quizzes/ */
courseRoutes.get("/:uuid/quizzes", checkCourse, authenticateOptional, async (req,res) => {
	try {
		const uuid : string = req.params.uuid;
		const quizzes = await getQuizzesByCourseUUID(uuid);
		if (req.user != null) {
			const user = await findUser(req.user.nameOrEmail);
			if (user != null && user.admin) {
				for (const quiz of quizzes) {
					const [answers] = await pool.execute(`
						SELECT * FROM answers WHERE quizUuid = ?
					`,[quiz.uuid]);
					
					quiz.answers = answers;
				}
			}
		}
		res.status(200).json(quizzes);
	} catch (error) {
		console.error("Error fetching quizzes:", error);
		res.status(500).json({ error: "Failed to fetch quizzes" });
	}
});

courseRoutes.post("/:uuid/quizzes", checkJSON, checkBody, checkCourse, authenticate, authenticateAdmin, async (req, res) => {
  	try {
		const uuid = req.params.uuid;
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
			if (q.type != Types.SINGLE_CHOICE && q.type != Types.MULTIPLE_CHOICE) {
				res.status(400).json({ message: `question->type must be '${Types.SINGLE_CHOICE}' or '${Types.MULTIPLE_CHOICE}'` });
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
			if (q.type == Types.SINGLE_CHOICE) {
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

		await pool.execute(`
			INSERT INTO quizzes (uuid, courseUuid, title)
			VALUES (?, ?, ?)
		`,[quizUuid, uuid, title]);

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
				idx+=1;
			}
		}

		await updateCourseByUUID(uuid, `Quiz '${title}' ${FeedMessages.CREATE}`);

		const [quizzes] = await pool.execute(`
			SELECT * FROM quizzes WHERE uuid = ?
		`,[quizUuid]);

		res.status(201).json(await formatQuizJSON(quizzes[0]));
	} catch (error) {
		console.error("Error creating quiz:", error);
		res.status(500).json({ error: "Failed to create quiz" });
	}
});

/** GET/DELETE/PUT on /courses/:uuid/quizzes/:quizUuid/ */
courseRoutes.get("/:uuid/quizzes/:quizUuid", checkCourse, checkQuiz, authenticateOptional, async (req, res) => {
	try {
		if (req.user != null) {
			const user = await findUser(req.user.nameOrEmail);
			if (user != null && user.admin) {
				const [answers] = await pool.execute(`
					SELECT * FROM answers WHERE quizUuid = ?
				`,[req.quiz.uuid]);
				
				req.quiz.answers = answers;
			}
		}
		res.status(200).json(req.quiz);
	} catch (error) {
		console.error("Error fetching quiz:", error);
		res.status(500).json({ error: "Failed to fetch quiz" });
	}
});

courseRoutes.delete("/:uuid/quizzes/:quizUuid", checkCourse, checkQuiz, authenticate, authenticateAdmin, async (req, res) => {
	try {
		const uuid = req.params.uuid;
		const quizUuid = req.params.quizUuid;

		await pool.execute(`
			DELETE FROM quizzes WHERE uuid = ?
		`,[quizUuid]);

		await updateCourseByUUID(uuid, `Quiz '${req.quiz.title}' ${FeedMessages.DELETE}`);

		res.status(204).json(({ message: "Quiz deleted sucessfully" }));
	} catch (error) {
		console.error("Error deleting quiz:", error);
		res.status(500).json({ error: "Failed to delete quiz" });
	}
});

courseRoutes.put("/:uuid/quizzes/:quizUuid", checkJSON, checkBody, checkCourse, checkQuiz, authenticate, authenticateAdmin, async (req, res) => {
	try {
		const uuid : string = req.params.uuid;
		const quizUuid : string = req.params.quizUuid;
		const body : JSON = req.body;
		const quiz : JSON = req.quiz;

		const title : string = body.title != null ? body.title : quiz.title;
		const questions : JSON[] = body.questions != null ? [] : quiz.questions;

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
				if (q.type != Types.SINGLE_CHOICE && q.type != Types.MULTIPLE_CHOICE) {
					res.status(400).json({ message: `question->type must be '${Types.SINGLE_CHOICE}' or '${Types.MULTIPLE_CHOICE}'` });
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
				if (q.type == Types.SINGLE_CHOICE) {
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
					idx+=1;
				}
			}
		}

		await pool.execute(`
			UPDATE quizzes
			SET title = ?, updateCount = ?
			WHERE uuid = ?
		`,[title, quiz.updateCount+1, quizUuid]);

		await updateCourseByUUID(uuid, `Quiz '${title}'${(title != quiz.title ? ` (originally '${quiz.title}')` : "")} ${FeedMessages.EDIT}`);

		const [quizzes] = await pool.execute(`
			SELECT * FROM quizzes WHERE uuid = ?
		`,[quizUuid]);

		res.status(201).json(await formatQuizJSON(quizzes[0]));
	} catch (error) {
		console.error("Error updating quiz:", error);
		res.status(500).json({ error: "Failed to update quiz" });
	}
});

/** POST on /courses/:uuid/quizzes/:quizUuid/submit/ */
courseRoutes.post("/:uuid/quizzes/:quizUuid/submit", checkJSON, checkBody, checkCourse, checkQuiz, authenticateOptional, async (req, res) => {
	try {
		const user = req.user != null ? await findUser(req.user.nameOrEmail) : null;
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
			if (correctAnsIdx >= ansCount) {
				correctPerQuestion.push(false);
				continue;
			}
			correctAnsIdx+=1;

			let ans : JSON;
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

			const [correctAnswers] = await pool.execute(`
			 	SELECT * FROM options WHERE questionUuid = ? AND correct = ?
			`,[q.uuid, true]);
			maxScore+=correctAnswers.length;

			if (q.type == Types.SINGLE_CHOICE) {
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

		await pool.execute(`
			INSERT INTO answers (uuid, quizUuid, userId, score, maxScore)
			VALUES (?, ?, ?, ?, ?)
		`,[answerUuid, quizUuid, user != null ? user.id : null, score, maxScore]);

		await pool.execute(`
			UPDATE quizzes
			SET attemptsCount = ?
			WHERE uuid = ?
		`,[req.quiz.attemptsCount+1, quizUuid]);

		const [db_answers] = await pool.execute(`
			SELECT * FROM answers WHERE uuid = ?
		`,[answerUuid]);

		db_answers[0].correctPerQuestion = correctPerQuestion;
		delete db_answers[0].userId;
		delete db_answers[0].uuid;

		res.status(200).json(db_answers[0]);
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

courseRoutes.post("/:uuid/feed", checkJSON, checkBody, checkCourse, authenticate, authenticateAdmin, async (req, res) => {
	try {
		const uuid : string = req.params.uuid;
		const message : string = req.body.message;
		if (message == null) {
			res.status(400).json({ message: "Missing message" });
			return;
		}

		const feedUuid = randomUUID();

		await pool.execute(`
			INSERT INTO feed (uuid, courseUuid, type, message, edited)
			VALUES (?, ?, ?, ?, ?)
		`,[feedUuid, uuid, Types.MANUAL, message, false]);

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
courseRoutes.put("/:uuid/feed/:feedUuid", checkJSON, checkBody, checkCourse, checkFeed, authenticate, authenticateAdmin, async (req, res) => {
	try {
		if (req.feed.type == Types.SYSTEM) {
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

courseRoutes.delete("/:uuid/feed/:feedUuid", checkCourse, checkFeed, authenticate, authenticateAdmin, async (req, res) => {
	try {
		if (req.feed.type == Types.SYSTEM) {
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
	for (const q of questions) {
		delete q.quizUuid;

		const [db_options] = await pool.execute(`
			SELECT * FROM options WHERE questionUuid = ? ORDER BY idx ASC
		`,[q.uuid]);

		const options : string[] = [];
		const correctIndices : number[] = [];

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
};

/** Formats feed */
async function formatFeedJSON(entry : JSON) {
	delete entry.courseUuid;
	entry.edited = entry.edited ? "true" : "false";
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

/** Finds specific feed */
async function findFeedByUUID(uuid : string) {
	const [feed] = await pool.execute(`
			SELECT * FROM feed WHERE uuid = ?
	`,[uuid]);
	return feed.length == 1 ? (await formatFeedJSON(feed[0])) : null;
};


/** GET FUNCTIONS */
/** Gets all course materials */
async function getMaterialsByCourseUUID(uuid : string) {
	if (!(await findCourseByUUID(uuid))) return;
	const [materials] = await pool.execute(`
			SELECT * FROM materials WHERE courseUuid = ? ORDER BY createdAt DESC
	`,[uuid]);
	for (const entry of materials) {
		await formatMaterialJSON(entry);
	};
	return materials;
};

/** Gets all course quizzes */
async function getQuizzesByCourseUUID(uuid : string) {
	if (!(await findCourseByUUID(uuid))) return;
	const [quizzes] = await pool.execute(`
			SELECT * FROM quizzes WHERE courseUuid = ? ORDER BY createdAt DESC
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
		INSERT INTO feed (uuid, courseUuid, type, message, edited)
		VALUES (?, ?, ?, ?, ?)
	`,[randomUUID(), uuid, Types.SYSTEM, message, false]);
}

/** Updates course updateCount */
async function updateCourseByUUID(uuid : string, message? : string) {
	const course = await findCourseByUUID(uuid);
	if (!course) {
		return;
	}

	if (message != null) systemFeedMessage(uuid, message);

	await pool.execute(`
		UPDATE courses
		SET updateCount = ?
		WHERE uuid = ?
	`, [course.updateCount+1, uuid]);
};
