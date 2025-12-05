import "dotenv/config";
import { pool } from "./index.js";
import { createDirectory } from "@/utils/filesystem.js";

export async function initDatabase() {
	while (true) {
		try {
			/** Check if database is available */
			await pool.execute(`
				SHOW TABLES
			`);

			console.log("\nCreating directories..");

			await createDirectory("/app/materials/");
			console.log("/app/materials/ OK");
			
			await createDirectory("/app/tmp/");
			console.log("/app/tmp/ OK");

			console.log("\nCreating tables...");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS users (
					id INT AUTO_INCREMENT PRIMARY KEY,
					email VARCHAR(255) NOT NULL,
					name VARCHAR(255) NOT NULL,
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
				)
			`);
			console.log("users OK");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS courses (
					uuid CHAR(36) PRIMARY KEY,
					name VARCHAR(255) NOT NULL,	 
					description VARCHAR(1000),
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
				)
			`);
			console.log("courses OK");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS materials (
					uuid CHAR(36) PRIMARY KEY,
					course_uuid CHAR(36),
					FOREIGN KEY (course_uuid) REFERENCES courses(uuid) ON DELETE CASCADE
				)
			`);
			console.log("materials OK");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS files (
					uuid CHAR(36) PRIMARY KEY,
					name VARCHAR(255) NOT NULL,
					type VARCHAR(255) NOT NULL,
					fileUrl VARCHAR(1000) NOT NULL,
					description VARCHAR(1000),
					mimeType VARCHAR(255),
					sizeBytes INT,
					FOREIGN KEY (uuid) REFERENCES materials(uuid) ON DELETE CASCADE
				)
			`);
			console.log("files OK");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS urls (
					uuid CHAR(36) PRIMARY KEY,
					name VARCHAR(255) NOT NULL,
					type VARCHAR(255) NOT NULL,
					url VARCHAR(1000) NOT NULL,
					faviconUrl VARCHAR(1000),
					description VARCHAR(1000),
					FOREIGN KEY (uuid) REFERENCES materials(uuid) ON DELETE CASCADE
				)
			`);
			console.log("urls OK");
			
			break;

		} catch (error) {
			if (error.code === 'PROTOCOL_CONNECTION_LOST') {
				console.log("Database is probably still starting, retrying...");
				await new Promise(f => setTimeout(f, 5000));
				continue;
			}
			console.error("Error initializing database:", error);
			break;
		}
	}
}
