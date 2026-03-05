import express from "express";
import { pool } from "@/db";
import { randomUUID } from "crypto";
import { authenticate, authenticateOptional, findUser } from "./users";
import * as z from "zod";
import { Types } from "..";
import type { RowDataPacket } from "mysql2";
import { FeedCreateRequest, FeedMessages } from "@/types/feed";
import { checkCourse, findCourseByUUID } from "./courses";

export const feedRoute = "/:uuid/feed";
export const feedRoutes = express.Router();

/** getAll */
feedRoutes.get(feedRoute, checkCourse, async (req, res) => {
    try {
        const uuid : string = req.params.uuid;
        const feed = await getFeedByCourseUUID(uuid);
        res.status(200).json(feed);
    } catch (error) {
        console.error("Error fetching feed:", error);
        res.status(500).json({ error: "Failed to fetch feed" });
    }
});

/** post */
feedRoutes.post(feedRoute, checkCourse, authenticate, async (req, res) => {
    try {
        const uuid : string = req.params.uuid;

        const result: z.ZodSafeParseResult<FeedCreateRequest> = await FeedCreateRequest.safeParseAsync(req.body);
        if (!result.success) {
            res.status(400).json({ message: "Invalid body" });
            return;
        }

        const message : string = result.data.message;
        const feedUuid = randomUUID();

        await pool.execute(`
            INSERT INTO feed (uuid, courseUuid, type, message, edited, author)
            VALUES (?, ?, ?, ?, ?, ?)
        `,[feedUuid, uuid, Types.FEED_MANUAL, message, false, req.user != null ? req.user.name : null]);

        const [feed] = await pool.execute<RowDataPacket[]>(`
            SELECT * FROM feed WHERE uuid = ?
        `,[feedUuid]);

        res.status(201).json(await formatFeedJSON(feed[0]));
    } catch (error) {
        console.error("Error creating feed:", error);
        res.status(500).json({ error: "Failed to create feed" });
    }
});

/** put */
feedRoutes.put(`${feedRoute}/:feedUuid`, checkCourse, checkFeed, authenticate, async (req, res) => {
    try {
        if (req.feed == null) {
            res.status(404).json({"message":"Feed not found"});
            return;
        }
        if (req.feed.type == Types.FEED_SYSTEM) {
            res.status(400).json({ message: "Can not update system feed message" });
            return;
        }
        const feedUuid : string = req.params.feedUuid;
        const message : string = req.body.message != null ? req.body.message : req.feed.message;

        await pool.execute(`
            UPDATE feed
            SET message = ?, edited = ?
            WHERE uuid = ?
        `,[message, true, feedUuid]);

        res.status(200).json(await findFeedByUUID(feedUuid));
    } catch (error) {
        console.error("Error updating feed:", error);
        res.status(500).json({ error: "Failed to update feed" });
    }
});

/** delete */
feedRoutes.delete(`${feedRoute}/:feedUuid`, checkCourse, checkFeed, authenticate, async (req, res) => {
    try {
        if (req.feed == null) {
            res.status(404).json({"message":"Feed not found"});
            return;
        }
        if (req.feed.type == Types.FEED_SYSTEM) {
            res.status(400).json({ message: "Can not delete system feed message" });
            return;
        }
        const feedUuid : string = req.params.feedUuid;

        await pool.execute(`
            DELETE FROM feed WHERE uuid = ?
        `,[feedUuid]);

        res.status(204).json({ message: "Feed deleted successfully" });
    } catch (error) {
        console.error("Error deleting feed:", error);
        res.status(500).json({ error: "Failed to delete feed" });
    }
});

/** get stream */
feedRoutes.get(`${feedRoute}/stream`, checkCourse, async (req, res) => {
    try {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Content-Encoding': 'none',
            'Access-Control-Allow-Origin': '*'
        });
        res.flushHeaders();

        let [latest] = await pool.execute<RowDataPacket[]>(`
            SELECT * FROM feed WHERE courseUuid = ? ORDER BY createdAt DESC LIMIT 1
        `,[req.params.uuid]);

        const heartbeatInterval = setInterval(() => {
            res.write("event: heartbeat\n\n");
            res.flush();
        }, 20000);

        const dataInterval = setInterval(async () => {
            const [newLatest] = await pool.execute<RowDataPacket[]>(`
                SELECT * FROM feed WHERE courseUuid = ? ORDER BY createdAt DESC LIMIT 1
            `,[req.params.uuid]);

            if ((latest[0] != null && latest[0].uuid != newLatest[0].uuid) || (latest[0] == null && newLatest[0] != null)) {
                latest = newLatest;
                res.write(`event: new_post\ndata: ${JSON.stringify(await formatFeedJSON(latest[0]))}\n\n`);
                res.flush();
            }
        }, 2000);

        res.on("close", () => {
            clearInterval(heartbeatInterval);
            clearInterval(dataInterval);
            res.end();
        });
    } catch (error) {
        console.error("Error streaming feed:", error);
        res.end();
        res.status(500).json({ error: "Failed to stream feed" });
    }
});

/** Functions */
async function formatFeedJSON(entry : RowDataPacket): Promise<RowDataPacket> {
	delete entry.courseUuid;
	entry.edited = entry.edited ? true : false;
	return entry;
}

async function checkFeed(req : any, res : any, next : any): Promise<void> {
	try {
		const feed: RowDataPacket|null = await findFeedByUUID(req.params.feedUuid);
		if (feed == null) {
			res.status(404).json({ message: "Feed not found" });
			return;
		}
		req.feed = feed;
		next();
	} catch (error) {
		console.error("Error checking feed:", error);
		res.status(500).json({ error: "Failed to check feed" });
	}
}

async function findFeedByUUID(uuid : string): Promise<RowDataPacket|null> {
    const [feed] = await pool.execute<RowDataPacket[]>(`
            SELECT * FROM feed WHERE uuid = ?
    `,[uuid]);
    return feed.length == 1 ? (await formatFeedJSON(feed[0])) : null;
};

export async function systemFeedMessage(uuid : string, message : string): Promise<void> {
    const course = await findCourseByUUID(uuid);
    if (course == null) return;

    await pool.execute(`
        INSERT INTO feed (uuid, courseUuid, type, message, edited, author)
        VALUES (?, ?, ?, ?, ?, ?)
    `,[randomUUID(), uuid, Types.FEED_SYSTEM, message, false, Types.FEED_SYSTEM]);
}

export async function getFeedByCourseUUID(uuid : string): Promise<RowDataPacket[]|null> {
    if (!(await findCourseByUUID(uuid))) return null;
    const [feed] = await pool.execute<RowDataPacket[]>(`
            SELECT * FROM feed WHERE courseUuid = ? ORDER BY createdAt DESC
    `,[uuid]);
    for (const entry of feed) {
        await formatFeedJSON(entry);
    };
    return feed;
};
