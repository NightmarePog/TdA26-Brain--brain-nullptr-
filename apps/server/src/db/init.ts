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
					type VARCHAR(255) NOT NULL,
					name VARCHAR(255) NOT NULL,
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
					type VARCHAR(255) NOT NULL,
					name VARCHAR(255) NOT NULL,
					url VARCHAR(1000) NOT NULL,
					faviconUrl VARCHAR(1000),
					description VARCHAR(1000),
					FOREIGN KEY (uuid) REFERENCES materials(uuid) ON DELETE CASCADE
				)
			`);
			console.log("urls OK");

			console.log("\nInserting test data...");

			/** Testing data */
			await pool.execute(`
				INSERT IGNORE INTO courses (uuid, name, description)
				VALUES ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'This is a name!', 'This is a description!')
			`);
			console.log("course1 OK");

			await pool.execute(`
				INSERT IGNORE INTO materials (uuid, course_uuid)
				VALUES ('12345678-bbbb-1234-4321-eeeeeeeeeeee', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
			`);
			console.log("material OK");

			await pool.execute(`
				INSERT IGNORE INTO files (uuid, type, name)
				VALUES ('12345678-bbbb-1234-4321-eeeeeeeeeeee', 'This is a file type!', 'This is a name of a file!')
			`);
			console.log("file OK");
			
			await pool.execute(`
				INSERT IGNORE INTO courses (uuid, name, description)
				VALUES ('abcdefgh-ijkl-mnop-qrst-uvwxyzabcdef', 'Jetset life is gonna kill you', 'Gaze into her killing jar id sometimes stare for hours, she even poked the holes so i can breathe. She bought the last line, im just the worst kind of guy to argue with what you might find and for the last night i lie, could i lie with you? ALRIGHT, GIVE UP, GET DOWN, Its just the hardest part of living!')
			`);
			console.log("course2 OK");
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
