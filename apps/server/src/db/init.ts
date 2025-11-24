import "dotenv/config";
import { pool } from "./index.js";

export async function initDatabase() {
	while (true) {
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
			console.log("Created users table");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS courses (
					uuid CHAR(36) PRIMARY KEY,
					name VARCHAR(255) NOT NULL,	 
					description VARCHAR(1000),
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
				)
			`);
			console.log("Created courses table");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS materials (
					uuid CHAR(36) PRIMARY KEY,
					course_uuid CHAR(36),
					FOREIGN KEY (course_uuid) REFERENCES courses(uuid) ON DELETE CASCADE
				)
			`);
			console.log("Created materials table");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS files (
					uuid CHAR(36) PRIMARY KEY,
					type VARCHAR(255) NOT NULL,
					name VARCHAR(255) NOT NULL,
					fileUrl VARCHAR(1000) NOT NULL,
					description VARCHAR(1000),
					mimeType VARCHAR(255),
					sizeBytes INT,
					FOREIGN KEY (uuid) REFERENCES materials(uuid) ON DELETE CASCADE
				)
			`);
			console.log("Created files table");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS urls (
					uuid CHAR(36) PRIMARY KEY,
					type VARCHAR(255) NOT NULL,
					name VARCHAR(255) NOT NULL,
					url VARCHAR(1000) NOT NULL,
					faviconUrl VARCHAR(1000),
					description VARCHAR(1000),
					FOREIGN KEY (uuid) REFERENCES materials(uuid) ON DELETE CASCADE
				)
			`);
			console.log("Created urls table");

			/** Testing data */
			await pool.execute(`
				INSERT IGNORE INTO courses (uuid, name, description)
				VALUES ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'This is a name!', 'This is a description!')
			`);
			await pool.execute(`
				INSERT IGNORE INTO materials (uuid, course_uuid)
				VALUES ('12345678-bbbb-1234-4321-eeeeeeeeeeee', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
			`);
			await pool.execute(`
				INSERT IGNORE INTO files (uuid, type, name, fileUrl)
				VALUES ('12345678-bbbb-1234-4321-eeeeeeeeeeee', 'file', 'This is a name!', 'This is a description!')
			`);
			await pool.execute(`
				INSERT IGNORE INTO courses (uuid, name, description)
				VALUES ('abcdefgh-ijkl-mnop-qrst-uvwxyzabcdef', 'Jetset life is gonna kill you', 'Gaze into her killing jar id sometimes stare for hours, she even poked the holes so i can breathe. She bought the last line, im just the worst kind of guy to argue with what you might find and for the last night i lie, could i lie with you? ALRIGHT, GIVE UP, GET DOWN, Its just the hardest part of living!')
			`);
			console.log("Added test data")

			console.log("Database schema initialized successfully!");
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
