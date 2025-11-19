import express from "express";
import { pool } from "@/db";
import { randomUUID } from "crypto";

export const courseRoutes = express.Router();

courseRoutes.get("/", async (_req, res) => {
	try {
		const [rows] = await pool.execute("SELECT * FROM courses");
		res.status(200).json(rows);
	} catch (error) {
		console.error("Error fetching courses:", error);
		res.status(500).json({ error: "Failed to fetch courses" });
	}
});


courseRoutes.post("/", async (req, res) => {
    try {
		const uuid = randomUUID();
        const name = req.body.name;
        const desc = req.body.description || '';
		await pool.execute(`
            INSERT INTO courses (uuid, name, description)
            VALUES (?, ?, ?)
        `,[uuid, name, desc]);
		const [course] = await pool.execute(`SELECT * FROM courses WHERE uuid = ?`,[uuid]);
		res.status(201).json(course);
	} catch (error) {
		console.error("Error creating course:", error);
		res.status(500).json({ error: "Failed to create course" });
	}
});

courseRoutes.get("/:uuid", async (req, res) => {
	try {
		const uuid = req.params.uuid;
		const [course] = await pool.execute(`
			SELECT * FROM courses WHERE uuid = ?
		`,[uuid]);
		course.length > 0 ? res.status(200).json(course) : res.status(404).json({ message: "Invalid course uuid" });
	} catch (error) {
		console.error("Error getting course details:", error);
		res.status(500).json({ error: "Failed to get course details" });
	}
});
