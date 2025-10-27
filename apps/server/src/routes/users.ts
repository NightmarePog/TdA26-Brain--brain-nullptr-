import express from "express";
import { pool } from "@/db";

export const userRoutes = express.Router();

userRoutes.get("/", async (_req, res) => {
	try {
		const [rows] = await pool.execute("SELECT * FROM users");
		res.status(200).json(rows);
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ error: "Failed to fetch users" });
	}
});
