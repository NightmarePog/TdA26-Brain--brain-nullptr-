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
					name VARCHAR(255) NOT NULL,
					password VARCHAR(255) NOT NULL,
					createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
					CONSTRAINT UC_Person UNIQUE (name,email)
				)
			`);
			console.log("users OK");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS courses (
					uuid CHAR(36) PRIMARY KEY,
					name VARCHAR(255) NOT NULL,
					description VARCHAR(1000),
					createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
					updateCount INT DEFAULT 0
				)
			`);
			console.log("courses OK");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS materials (
					uuid CHAR(36) PRIMARY KEY,
					courseUuid CHAR(36) NOT NULL,
					createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
					updateCount INT DEFAULT 0,
					FOREIGN KEY (courseUuid) REFERENCES courses(uuid) ON DELETE CASCADE
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
					courseUuid CHAR(36) NOT NULL,
					title VARCHAR(255) NOT NULL,
					attemptsCount INT DEFAULT 0,
					description VARCHAR(1000),
					createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
					updateCount INT DEFAULT 0,
					FOREIGN KEY (courseUuid) REFERENCES courses(uuid) ON DELETE CASCADE
				)
			`);
			console.log("quizzes OK");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS questions (
					uuid CHAR(36) PRIMARY KEY,
					quizUuid CHAR(36) NOT NULL,
					type VARCHAR(255) NOT NULL,
					question VARCHAR(1000) NOT NULL,
					FOREIGN KEY (quizUuid) REFERENCES quizzes(uuid) ON DELETE CASCADE
				)
			`);
			console.log("questions OK");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS options (
					uuid CHAR(36) PRIMARY KEY,
					questionUuid CHAR(36) NOT NULL,
					idx INT NOT NULL,
					opt VARCHAR(1000) NOT NULL,
					correct BOOL NOT NULL,
					FOREIGN KEY (questionUuid) REFERENCES questions(uuid) ON DELETE CASCADE
				)
			`);
			console.log("options OK");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS answers (
					uuid CHAR(36) PRIMARY KEY,
					quizUuid CHAR(36) NOT NULL,
					score INT NOT NULL,
					maxScore INT NOT NULL,
					submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (quizUuid) REFERENCES quizzes(uuid) ON DELETE CASCADE
				)
			`);
			console.log("answers OK");

			await pool.execute(`
				CREATE TABLE IF NOT EXISTS feed (
					uuid CHAR(36) PRIMARY KEY,
					courseUuid CHAR(36) NOT NULL,
					type VARCHAR(255) NOT NULL,
					message VARCHAR(1000) NOT NULL,
					edited BOOL NOT NULL,
					author VARCHAR(255) NOT NULL,
					createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
					FOREIGN KEY (courseUuid) REFERENCES courses(uuid) ON DELETE CASCADE
				)
			`);
			console.log("feed OK");
			
			console.log("\nCreating users..");

			await pool.execute(`
				INSERT IGNORE INTO users (name, password)
				VALUES (?, ?)
			`, ["lecturer", await sha512(`TdA26!${process.env.PASSWORD_SALT}`)]);
			console.log("lecturer OK");

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
