import "dotenv/config";
import { pool } from "./index.js";

export async function initDatabase() {
	try {
		console.log("Initializing database schema...");

		await pool.execute(`
			CREATE TABLE IF NOT EXISTS users (
				id INT AUTO_INCREMENT PRIMARY KEY,
				email VARCHAR(255) NOT NULL,
				name VARCHAR(255) NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
			)
		`);

		console.log("Database schema initialized successfully!");
	} catch (error) {
		console.error("Error initializing database:", error);
	}
}
