import "dotenv/config";
import { pool } from "./index.js";
import { createDirectory } from "@/utils/filesystem.js";
import { sha512 } from "@/routes/users.js";

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
					password VARCHAR(255) NOT NULL,
					admin BOOL NOT NULL,
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
					CONSTRAINT UC_Person UNIQUE (name,email)
				)
			`);
			console.log("users OK");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS courses (
					uuid CHAR(36) PRIMARY KEY,
					name VARCHAR(255) NOT NULL,
					description VARCHAR(1000),
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
					update_count INT DEFAULT 0
				)
			`);
			console.log("courses OK");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS materials (
					uuid CHAR(36) PRIMARY KEY,
					course_uuid CHAR(36) NOT NULL,
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
					update_count INT DEFAULT 0,
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

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS quizzes (
					uuid CHAR(36) PRIMARY KEY,
					course_uuid CHAR(36) NOT NULL,
					title VARCHAR(255) NOT NULL,
					attemptsCount INT NOT NULL,
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
					update_count INT DEFAULT 0,
					FOREIGN KEY (course_uuid) REFERENCES courses(uuid) ON DELETE CASCADE
				)
			`);
			console.log("quizzes OK");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS questions (
					uuid CHAR(36) PRIMARY KEY,
					quiz_uuid CHAR(36) NOT NULL,
					type VARCHAR(255) NOT NULL,
					question VARCHAR(1000) NOT NULL,
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
					update_count INT DEFAULT 0,
					FOREIGN KEY (quiz_uuid) REFERENCES quizzes(uuid) ON DELETE CASCADE
				)
			`);
			console.log("questions OK");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS options (
					uuid CHAR(36) PRIMARY KEY,
					question_uuid CHAR(36) NOT NULL,
					idx INT NOT NULL,
					opt VARCHAR(1000) NOT NULL,
					correct BOOL NOT NULL,
					FOREIGN KEY (question_uuid) REFERENCES questions(uuid) ON DELETE CASCADE
				)
			`);
			console.log("options OK");
			
			console.log("\nCreating users..");

			await pool.execute(`
				INSERT IGNORE INTO users (email, name, password, admin)
				VALUES (?, ?, ?, ?)
			`, ["lecturer@email.com", "lecturer", await sha512(`TdA26!${process.env.PASSWORD_SALT}`), true]);
			console.log("admin user OK");

			await pool.execute(`
				INSERT IGNORE INTO users (email, name, password, admin)
				VALUES (?, ?, ?, ?)
			`, ["student@email.com", "student", await sha512("1234"), false]);
			console.log("student user OK");

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
