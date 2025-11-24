import express from "express";
import { pool } from "@/db";
import { randomUUID } from "crypto";

export const courseRoutes = express.Router();

/** GET/POST on /courses/ */
courseRoutes.get("/", async (_req, res) => {
	try {
		const [rows] = await pool.execute("SELECT * FROM courses");
		res.status(200).json(rows);
	} catch (error) {
		console.error("Error fetching course summaries:", error);
		res.status(500).json({ error: "Failed to fetch course summaries" });
	}
});


courseRoutes.post("/", async (req, res) => {
    try {
		const uuid : string = randomUUID();
        const name : string = req.body.name;
        const desc : string = req.body.description || '';
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
		const uuid : string = req.params.uuid;

		const course = await findCourseByUUID(uuid);
		if (!course) {
			res.status(404).json({ message: "Invalid course uuid" });
			return;
		}

		if (req.body) {
			const name : string = req.body.name != null ? req.body.name : course.name;
			const desc : string = req.body.description != null ? req.body.description : course.description;
	
			await pool.execute(`
				UPDATE courses
				SET name = ?, description = ?
				WHERE uuid = ?
			`,[name, desc, uuid]);
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

courseRoutes.post("/:uuid/materials", async (req, res) => {
	try {
		const course_uuid : string = req.params.uuid;
		const uuid : string = randomUUID();
		const type : string = req.body.type;
        const name : string = req.body.name;
        const desc : string = req.body.description || '';

		if (req.is('application/json')) {
			/** URL */
			const url : string = req.body.url;
			const faviconUrl : string = req.body.faviconUrl || '';

			await pool.execute(`
				INSERT INTO materials (uuid, course_uuid)
				VALUES (?, ?)
			`,[uuid, course_uuid]);

			await pool.execute(`
				INSERT INTO urls (uuid, type, name, url, faviconUrl, description)
				VALUES (?, ?, ?, ?, ?, ?)
			`, [uuid, type, name, url, faviconUrl, desc]);

			const [materials] = await pool.execute(`
				SELECT * FROM materials WHERE uuid = ?
			`,[uuid]);

			res.status(201).json(await formatMaterialJSON(materials[0]));

		} else if (req.is('multipart/form-data')) {
			/** FILE */
			const fileURL : string = req.body.fileURL;
			const mimeType : string = req.body.mimeType;
			const sizeBytes : number = req.body.sizeBytes;
			/** TODO */
			console.log("FILE not implemented yet");
		}

		res.status(404).json({ message: "Invalid mime type" });
		
	} catch (error) {
		console.error("Error creating material:", error);
		res.status(500).json({ error: "Failed to create material" });
	}
});

/** Functions */
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
		entry.file = file;
		return entry;
	}

	const [urls] = await pool.execute(`
		SELECT * FROM urls WHERE uuid = ?
	`,[entry.uuid]);
	const url = urls.length == 1 ? urls[0] : null;
	if (url) {
		delete url.uuid;
		entry.url = url;
		return entry;
	}
}

async function getMaterialsByCourseUUID(uuid : string) {
	if (!(await findCourseByUUID(uuid))) return;
	const [materials] = await pool.execute(`
			SELECT * FROM materials WHERE course_uuid = ?
	`,[uuid]);
	for (const entry of materials) {
		await formatMaterialJSON(entry);
	};
	return materials;
}

async function getCourseDetailsByUUID(uuid : string) {
	/** for now only get materials ontop of the initial course */
	const course = await findCourseByUUID(uuid);
	if (!course) return;
	const materials = await getMaterialsByCourseUUID(uuid);
	if (!materials) return;
	course.materials = materials;
	return course;
}
