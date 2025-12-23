import express from "express";
import { pool } from "@/db";
import jwt from "jsonwebtoken";

const authTokenSecret = process.env.AUTH_TOKEN_SECRET || "secwet";

export const userRoutes = express.Router();

/** GET on /users/ */
userRoutes.get("/", authenticate, authenticateAdmin, async (req, res) => {
	try {
		const [users] = await pool.execute("SELECT * FROM users");
		res.status(200).json(users);
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ error: "Failed to fetch users" });
	}
});

/** POST on /users/login/ */
userRoutes.post("/login/", async (req, res) => {
	try {
		/** TODO implement rate limiting? */

		const nameOrEmail = req.body.nameOrEmail;
		const password = req.body.password;

		if (!password || !nameOrEmail) {
			res.status(400).json({ message: "Invalid data" });
			return;
		}

		const user = await findUser(nameOrEmail);
		if (!user) {
			res.status(404).json({ message: "Invalid user name or email" });
			return;
		}

		if (await sha512(password) !== user.password) {
			res.status(401).json({ message: "Invalid password" });
			return;
		}

		if (req.cookies.auth_token !== undefined) {
			res.status(403).json({ message: "Already logged in" });
			return;
		}

		const token = jwt.sign({nameOrEmail}, authTokenSecret);
		console.log(token);
		/** Token for 12 hours */
		res.cookie("auth_token",token,{ maxAge: 1000 * 3600 * 12, httpOnly: true, secure: true });
		res.status(200).json({ message: "Login successful" });

	} catch (error) {
		console.error("Error logging in:", error);
		res.status(500).json({ error: "Failed to log in" });
	}
});

/** Functions */
export async function sha512(str : string) {
 	const buf = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(str));
	return Array.prototype.map.call(new Uint8Array(buf), x => (('00' + x.toString(16)).slice(-2))).join('');
}

export function authenticate(req : any, res : any, next : any) {
	/** temporary authenticate skip */
	next();
	return;

	let authToken;
	try {
		authToken = req.cookies.auth_token;
	} catch (err) {};
	if (!authToken) return res.sendStatus(401);

	jwt.verify(authToken, authTokenSecret, (err : any, user : any) => {
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
}

export async function authenticateAdmin(req : any, res : any, next : any) {
	/** temporary authenticate skip */
	next();
	return;
	
	const user = await findUser(req.user.nameOrEmail);
	if (!user.admin) {
		return res.sendStatus(403);
	}
	next();
}

async function findUser(nameOrEmail : string) {
	const [users] = await pool.execute(`
			SELECT * FROM users WHERE name = ? OR email = ?
	`,[nameOrEmail, nameOrEmail]);
	return users.length == 1 ? users[0] : null;
}
