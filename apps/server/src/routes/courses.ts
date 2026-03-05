import express from "express";
import { pool } from "@/db";
import { randomUUID } from "crypto";
import { authenticate, authenticateOptional, findUser } from "./users";
import * as z from "zod";
import { Types } from "..";
import type { RowDataPacket } from "mysql2";
import { CourseCreateRequest, CourseUpdateRequest } from "@/types/courses";
import { FeedMessages } from "@/types/feed";
import { getModulesByCourseUUID, updateModuleByUUID } from "./modules";
import { getFeedByCourseUUID, systemFeedMessage } from "./feed";

export const courseRoutes = express.Router();

/** getAll */
courseRoutes.get("/", authenticateOptional, async (req, res) => {
    try {
        const isLecturer = req.user != null && await findUser(req.user.name);
        const [courses] = await pool.execute<RowDataPacket[]>(`SELECT * FROM courses ${!isLecturer && "WHERE state != 'draft' AND state != 'archived'" || ""} ORDER BY createdAt DESC`);
        for (const c of courses) await formatCourseJSON(c);
        res.status(200).json(courses);
    } catch (error) {
        console.error("Error fetching course summaries:", error);
        res.status(500).json({ error: "Failed to fetch course summaries" });
    }
});

/** post */
courseRoutes.post("/", authenticate, async (req, res) => {
    try {
        const result: z.ZodSafeParseResult<CourseCreateRequest> = await CourseCreateRequest.safeParseAsync(req.body);
        if (!result.success) {
			res.status(400).json({ message: "Invalid body" });
			return;
		}

        const uuid: string = randomUUID();
        const name: string = result.data.name;
        const desc: string|null = result.data.description || null;
        const theme: string|null = result.data.theme || null;
        const openedAt: string|null = result.data.openedAt || null;
        const closedAt: string|null = result.data.closedAt || null;

        await pool.execute(`
            INSERT INTO courses (uuid, name, description, state, theme, openedAt, closedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `,[uuid, name, desc, Types.COURSE_DRAFT, theme, openedAt, closedAt]);

        const course: RowDataPacket|null = await findCourseByUUID(uuid);
        res.status(201).json(course);
    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({ error: "Failed to create course" });
    }
});

/** get */
courseRoutes.get("/:uuid", checkCourse, authenticateOptional, async (req, res) => {
    try {
        if (req.course == null) {
            res.status(404).json({"message":"Course not found"});
            return;
        }
        const isLecturer = req.user != null && await findUser(req.user.name);
        if (!isLecturer && (req.course.state == Types.COURSE_DRAFT || req.course.state == Types.COURSE_ARCHIVED)) {
            res.status(403).json({"message":`This course has been made ${req.course.state}`});
        }
        res.status(200).json(await getCourseDetailsByUUID(req.course.uuid));
    } catch (error) {
        console.error("Error getting course details:", error);
        res.status(500).json({ error: "Failed to get course details" });
    }
});

/** delete */
courseRoutes.delete("/:uuid", checkCourse, authenticate, async (req, res) => {
    try {
        const uuid = req.params.uuid;

        await pool.execute(`
            DELETE FROM courses WHERE uuid = ?
        `,[uuid]);

        res.status(204).json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ error: "Failed to delete course" });
    }
});

/** put */
courseRoutes.put("/:uuid", checkCourse, authenticate, async (req, res) => {
    try {
        if (req.course == null) {
            res.status(404).json({"message":"Course not found"});
            return;
        }

        const uuid: string = req.params.uuid;
        const result: z.ZodSafeParseResult<CourseUpdateRequest> = await CourseUpdateRequest.safeParseAsync(req.body);
        if (!result.success) {
			res.status(400).json({ message: "Invalid body" });
			return;
		}

        const name: string = result.data.name || req.course.name;
        const desc: string|null = result.data.description || req.course.description || null;
        const theme: string|null = result.data.theme || req.course.theme || null;
        const openedAt: string|null = result.data.openedAt || req.course.openedAt || null;
        const closedAt: string|null = result.data.closedAt || req.course.closedAt || null;
        const imageUrl: string|null = result.data.imageUrl || req.course.imageUrl || null;

        await pool.execute(`
            UPDATE courses
            SET name = ?, description = ?, theme = ?, openedAt = ?, closedAt = ?, imageUrl = ?
            WHERE uuid = ?
        `, [name, desc, theme, openedAt, closedAt, imageUrl, uuid]);

        let useAnd: boolean = false;
        async function getAnd(b: boolean) {
            if (!b) {
                return "";
            }
            if (!useAnd) {
                useAnd = true;
                return "";
            }
            return " and";
        }

        const 	nameChanged = name != req.course.name,
                descChanged = desc != req.course.description,
                openedAtChanged = openedAt != req.course.openedAt,
                closedAtChanged = closedAt != req.course.closedAt,
                themeChanged = theme != req.course.theme,
                imageUrlChanged = imageUrl != req.course.imageUrl;
        
        const msg: any =
        `{
            "content": "Course${await getAnd(nameChanged)}${nameChanged ? " name" : ""}${await getAnd(descChanged)}${descChanged ? " description" : ""}${await getAnd(themeChanged)}${themeChanged ? " theme" : ""}${await getAnd(openedAtChanged)}${openedAtChanged ? " opening time" : ""}${await getAnd(closedAtChanged)}${closedAtChanged ? " closing time" : ""}${await getAnd(imageUrlChanged)}${imageUrlChanged ? " image" : ""}",
            "type": "${FeedMessages.EDIT}"
        }`
        await updateCourseByUUID(uuid, msg);

        res.status(200).json(await findCourseByUUID(uuid));
            
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ error: "Failed to update course" });
    }
});

/** post state */
courseRoutes.post("/:uuid/state", checkCourse, authenticate, async (req, res) => {
    try {
        if (req.course == null) {
            res.status(404).json({"message":"Course not found"});
            return;
        }

        const uuid: string = req.params.uuid;
        const state: string = req.body.state;
        if (state == null) {
            res.status(400).json({ message: "Missing state" });
            return;
        }
        if (state == req.course.state) {
            res.status(400).json({ message: "State is unchanged" });
            return;
        }

        switch (state) {
            case Types.COURSE_DRAFT:
                if (req.course.state == Types.COURSE_LIFE || req.course.state == Types.COURSE_PAUSED || req.course.state == Types.COURSE_ARCHIVED) {
                    res.status(400).json({ message: "Course cannot be drafted" });
                    return;
                }
                break;
            case Types.COURSE_ARCHIVED:
                if (req.course.state == Types.COURSE_DRAFT || req.course.state == Types.COURSE_SCHEDULED) {
                    res.status(400).json({ message: "Course cannot be archived" });
                    return;
                }
                break;
            case Types.COURSE_SCHEDULED:
                if (req.course.state == Types.COURSE_LIFE || req.course.state == Types.COURSE_ARCHIVED) {
                    res.status(400).json({ message: "Course cannot be scheduled" });
                    return;
                }
                if (req.course.openedAt == null || req.course.closedAt == null) {
                    res.status(400).json({"message":"missing course open time and/or close time"});
                    return;
                }
                break;
            case Types.COURSE_LIFE:
                if (req.course.state == Types.COURSE_ARCHIVED) {
                    res.status(400).json({ message: "Course cannot be made live" });
                    return;
                }
                break;
            case Types.COURSE_PAUSED:
                if (req.course.state == Types.COURSE_DRAFT || req.course.state == Types.COURSE_SCHEDULED || req.course.state == Types.COURSE_ARCHIVED) {
                    res.status(400).json({ message: "Course cannot be paused" });
                    return;
                }
                break;
            default:
                res.status(400).json({ message: "Incorrect state type" });
                return;
        }

        await pool.execute(`
            UPDATE courses
            SET state = ?
            WHERE uuid = ?
        `, [state, uuid]);

        res.status(200).json(await findCourseByUUID(uuid));
    } catch (error) {
        console.error("Error updating course state:", error);
        res.status(500).json({ error: "Failed to update course state" });
    }
});


/** Functions */
async function updateCourseByTime(course : RowDataPacket) : Promise<RowDataPacket> {
    switch (course.state) {
        case Types.COURSE_SCHEDULED:
            if (course.pausedAt != null) {
                await pool.execute(`
                    UPDATE courses
                    SET pausedAt = null
                    WHERE uuid = ?
                `, [course.uuid]);
            }
            const [timeToStart] = await pool.execute<RowDataPacket[]>(`
                SELECT TIMESTAMPDIFF(SECOND,CURRENT_TIMESTAMP(),openedAt) AS timeToStart FROM courses WHERE uuid = ?;
            `, [course.uuid]);

            if (timeToStart[0]["timeToStart"] <= 0) {
                if (course.pausedAt != null) {
                    await pool.execute(`
                        UPDATE courses
                        SET state = ?
                        WHERE uuid = ?
                    `, [Types.COURSE_DRAFT, course.uuid]);
                    course.state = Types.COURSE_DRAFT;
                } else {
                    await pool.execute(`
                        UPDATE courses
                        SET state = ?
                        WHERE uuid = ?
                    `, [Types.COURSE_LIFE, course.uuid]);
                    course.state = Types.COURSE_LIFE;
                }
            }
            break;
        case Types.COURSE_LIFE:
            if (course.pausedAt != null) {
                await pool.execute(`
                    UPDATE courses
                    SET pausedAt = null
                    WHERE uuid = ?
                `, [course.uuid]);
            }
            break;
        case Types.COURSE_PAUSED:
            if (course.pausedAt == null) {
                await pool.execute(`
                    UPDATE courses
                    SET pausedAt = CURRENT_TIMESTAMP()
                    WHERE uuid = ?
                `, [course.uuid]);
            }
            if (course.closedAt != null) {
                const [timeDiff] = await pool.execute<RowDataPacket[]>(`
                    SELECT TIMESTAMPDIFF(SECOND,pausedAt,CURRENT_TIMESTAMP()) AS timeDiff FROM courses WHERE uuid = ?;
                `, [course.uuid]);

                await pool.execute(`
                    UPDATE courses
                    SET closedAt = TIMESTAMPADD(SECOND,${timeDiff[0]["timeDiff"]},closedAt), pausedAt = CURRENT_TIMESTAMP()
                    WHERE uuid = ?
                `, [course.uuid]);
                
                const [closedAt] = await pool.execute<RowDataPacket[]>(`
                    SELECT closedAt FROM courses WHERE uuid = ?
                `,[course.uuid]);
                course.closedAt = closedAt[0]["closedAt"];
            }
        default:
            break;
    }

    return course;
}

async function formatCourseJSON(entry : RowDataPacket): Promise<RowDataPacket> {
	await updateCourseByTime(entry);
    delete entry.pausedAt;

	return entry;
}

async function getCourseDetailsByUUID(uuid : string): Promise<RowDataPacket|null> {
	const course: RowDataPacket|null = await findCourseByUUID(uuid);
	if (!course) return null;

	const modules: RowDataPacket[]|null = await getModulesByCourseUUID(uuid);
	if (modules == null) return null;
	for (const m of modules) {
		delete m.materials;
		delete m.quizzes;
	}

	const feed: RowDataPacket[]|null = await getFeedByCourseUUID(uuid);
	if (feed == null) return null;

	course.modules = modules;
	course.feed = feed;

	return course;
};

export async function updateCourseByUUID(uuid : string, message? : string & { moduleUuid?: string, content? : string, module? : string, type? : string} ): Promise<void> {
    const course = await findCourseByUUID(uuid);
    if (course == null) {
        return;
    }
    
    if (message != null) message = JSON.parse(message);
    if (message != null) {
        if (message.moduleUuid != null) await updateModuleByUUID(message.moduleUuid);

        const msg = `${message.content != null ? message.content : ""}${message.type != null ? " "+message.type : ""}${message.module != null ? " in module '"+message.module+"'" : ""}`;
        systemFeedMessage(uuid, msg);
    }

    await pool.execute(`
        UPDATE courses
        SET updateCount = ?
        WHERE uuid = ?
    `, [course.updateCount+1, uuid]);
};

export async function findCourseByUUID(uuid : string): Promise<RowDataPacket | null> {
    const [courses] = await pool.execute<RowDataPacket[]>(`
            SELECT * FROM courses WHERE uuid = ?
    `,[uuid]);
    return courses.length == 1 ? (await formatCourseJSON(courses[0])) : null;
};

export async function checkCourse(req : any, res : any, next : any): Promise<void> {
	try {
		const course: RowDataPacket|null = await findCourseByUUID(req.params.uuid);
		if (course == null) {
			res.status(404).json({ message: "Course not found" });
			return;
		}
		req.course = course;
		next();
	} catch (error) {
		console.error("Error checking course:", error);
		res.status(500).json({ error: "Failed to check course" });
	}
}
