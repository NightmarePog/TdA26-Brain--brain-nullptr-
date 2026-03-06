import express from "express";
import { pool } from "@/db";
import jwt from "jsonwebtoken";
import * as z from "zod";
import { User } from "@/types/users";
import type { RowDataPacket } from "mysql2";

const authTokenSecret = process.env.AUTH_TOKEN_SECRET || "secwet";

export const userRoutes = express.Router();

/** GET on /users/ */
userRoutes.get("/", authenticate, async (req, res) => {
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
		const result: z.ZodSafeParseResult<User> = await User.safeParseAsync(req.body);
		if (!result.success) {
			res.status(400).json({ message: "Invalid body" });
			return;
		}
		const password: string = result.data.password, name: string = result.data.name;

		const user = await findUser(name);
		if (!user) {
			res.status(401).json({ message: "Invalid username" });
			return;
		}

		if (await sha512(`${password}${process.env.PASSWORD_SALT}`) !== user.password) {
			res.status(401).json({ message: "Invalid password" });
			return;
		}

		if (req.cookies.auth_token !== undefined) {
			res.status(403).json({ message: "Already logged in" });
			return;
		}

		const token: string = jwt.sign({name}, authTokenSecret);
		/** Token for 12 hours */
		res.cookie("auth_token",token,{ maxAge: 1000 * 3600 * 12, httpOnly: true, secure: true });
		res.status(200).json({ message: "Login successful" });

	} catch (error) {
		console.error("Error logging in:", error);
		res.status(500).json({ error: "Failed to log in" });
	}
});

/** GET on /users/auth/ */
userRoutes.get("/auth/", authenticate, async (req, res) => {
	if (req.user == null) {
		res.status(401).json({ message: "Invalid username" });
		return;
	}
	res.status(200).json(await findUser(req.user.name));
});

/** Functions */
export async function sha512(str : string) {
 	const buf = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(str));
	return Array.prototype.map.call(new Uint8Array(buf), x => (('00' + x.toString(16)).slice(-2))).join('');
}

export async function authenticate(req : any, res : any, next : any) {
	/** temporary authenticate skip */
	// req.user = {name:"lecturer"};
	// next();
	// return;

	let authToken;
	try {
		authToken = req.cookies.auth_token;
	} catch (err) {};
	if (authToken == null) return res.status(401).json({message : "No auth token"});

	jwt.verify(authToken, authTokenSecret, async (err : any, user : any) => {
		if (err) return res.status(403).json({message: "Invalid auth token"});
		const u = await findUser(user.name);
		if (u == null) return res.status(401).json({ message: "User not found" });
		req.user = user;
		next();
	});
}

export async function authenticateOptional(req : any, res : any, next : any) {
	/** temporary authenticate skip */
	// req.user = {name:"lecturer"};
	// next();
	// return;

	let authToken;
	try {
		authToken = req.cookies.auth_token;
	} catch (err) {};
	if (authToken == null) return next();

	jwt.verify(authToken, authTokenSecret, async (err : any, user : any) => {
		if (err) return next();
		const u = await findUser(user.name);
		if (u == null) return next();
		req.user = user;
		next();
	});
}

export async function findUser(name : string): Promise<RowDataPacket|null> {
	const [users] = await pool.execute<RowDataPacket[]>(`
			SELECT * FROM users WHERE name = ?
	`,[name]);
	return users.length == 1 ? users[0] : null;
}
