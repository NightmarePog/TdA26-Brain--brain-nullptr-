import express from "express";
import { pool } from "@/db";
import { randomUUID } from "crypto";
import { authenticate, authenticateOptional, findUser } from "./users";
import * as z from "zod";
import { Types } from "..";
import type { RowDataPacket } from "mysql2";
import { FeedMessages } from "@/types/feed";
import { checkCourse, findCourseByUUID, updateCourseByUUID } from "./courses";
import { ModuleCreateRequest, ModuleUpdateRequest } from "@/types/modules";
import { getMaterialsByModuleUUID } from "./materials";
import { getQuizzesByModuleUUID } from "./quizzes";

export const moduleRoute = "/:uuid/modules";
export const moduleRoutes = express.Router();

/** getAll */
moduleRoutes.get(moduleRoute, checkCourse, authenticateOptional, async (req, res) => {
    try {
        const uuid : string = req.params.uuid;
        const modules: RowDataPacket[]|null = await getModulesByCourseUUID(uuid);
        const isLecturer = req.user != null && await findUser(req.user.name);

        if (modules == null) {
            res.status(404).json({ message: "No modules found" });
            return;
        }

        for (const module of modules) {
            delete module.materials;
            delete module.quizzes;
        }

        res.status(200).json(modules);
    } catch (error) {
        console.error("Error fetching modules:", error);
        res.status(500).json({ error: "Failed to fetch modules" });
    }
});

/** post */
moduleRoutes.post(moduleRoute, checkCourse, authenticate, async (req, res) => {
    try {
        const result: z.ZodSafeParseResult<ModuleCreateRequest> = await ModuleCreateRequest.safeParseAsync(req.body);
        if (!result.success) {
            res.status(400).json({ message: "Invalid body" });
            return;
        }

        const uuid: string = randomUUID();
        const courseUuid: string = req.params.uuid;

        const name: string = result.data.name;
        const desc: string|null = result.data.description || null;

        const modules: RowDataPacket[]|null = await getModulesByCourseUUID(courseUuid);
        const moduleCount: number = modules != null ? modules.length : 0;

        await pool.execute(`
            INSERT INTO modules (uuid, courseUuid, name, description, idx, state)
            VALUES (?, ?, ?, ?, ?, ?)
        `,[uuid, courseUuid, name, desc, moduleCount, Types.MODULE_CLOSED]);

        const msg: string =
            `{
                "content": "Module '${name}'",
                "type": "${FeedMessages.CREATE}"
            }`
        await updateCourseByUUID(courseUuid, msg);

        const module: RowDataPacket|null = await findModuleByUUID(uuid);
        res.status(201).json(module);
    } catch (error) {
        console.error("Error creating module:", error);
        res.status(500).json({ error: "Failed to create module" });
    }
});

/** get */
moduleRoutes.get(`${moduleRoute}/:moduleUuid`, checkCourse, checkModule, authenticateOptional, async (req, res) => {
    try {
        if (req.module == null) {
            res.status(404).json({"message":"Module not found"});
            return;
        }
        const module: RowDataPacket|null = await formatModuleJSON(req.module);
        const isLecturer = req.user != null && await findUser(req.user.name);

        if (module != null && !isLecturer && module.state == Types.MODULE_CLOSED) {
            delete module.materials;
            delete module.quizzes;
        }

        res.status(200).json(module);
    } catch (error) {
        console.error("Error fetching module:", error);
        res.status(500).json({ error: "Failed to fetch module" });
    }
});

/** put */
moduleRoutes.put(`${moduleRoute}/:moduleUuid`, checkCourse, checkModule, authenticate, async (req, res) => {
    try {
        if (req.module == null) {
            res.status(404).json({"message":"Module not found"});
            return;
        }

        const result: z.ZodSafeParseResult<ModuleUpdateRequest> = await ModuleUpdateRequest.safeParseAsync(req.body);
        if (!result.success) {
            res.status(400).json({ message: "Invalid body" });
            return;
        }

        const moduleUuid: string = req.params.moduleUuid;
        const name: string|null = result.data.name || req.module.name || null;
        const desc: string|null = result.data.description || req.module.description || null;
        const state: string|null = result.data.state || req.module.state || null;

        await pool.execute(`
            UPDATE modules
            SET name = ?, description = ?, state = ?, updateCount = ?
            WHERE uuid = ?
        `, [name, desc, state, req.module.updateCount+1, moduleUuid]);

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

        const 	nameChanged = name != req.module.name,
                descChanged = desc != req.module.description,
                stateChanged = state != req.module.state;
        
        const msg: string =
            `{
                "module": "${req.module.name}",
                "content": "${await getAnd(nameChanged)}${nameChanged ? " name" : ""}${await getAnd(descChanged)}${descChanged ? " description" : ""}${await getAnd(stateChanged)}${stateChanged ? " state" : ""}",
                "type": "${FeedMessages.EDIT}"
            }`
        await updateCourseByUUID(req.params.uuid, msg);

        res.status(200).json(await findModuleByUUID(moduleUuid));
            
    } catch (error) {
        console.error("Error updating module:", error);
        res.status(500).json({ error: "Failed to update module" });
    }
});

/** delete */
moduleRoutes.delete(`${moduleRoute}/:moduleUuid`, checkCourse, checkModule, authenticate, async (req, res) => {
    try {
        if (req.module == null) {
            res.status(404).json({"message":"Module not found"});
            return;
        }

        const moduleUuid = req.params.moduleUuid;

        await pool.execute(`
            DELETE FROM modules WHERE uuid = ?
        `,[moduleUuid]);

        await pool.execute(`
            UPDATE modules
            SET idx = idx - 1
            WHERE courseUuid = ? AND idx > ?
        `, [req.params.uuid, req.module.idx]);


        const msg: string =
            `{
                "content": "Module '${req.module.name}'",
                "type": "${FeedMessages.DELETE}"
            }`
        await updateCourseByUUID(req.params.uuid, msg);

        res.status(204).json({ message: "Module deleted successfully" });
    } catch (error) {
        console.error("Error deleting module:", error);
        res.status(500).json({ error: "Failed to delete module" });
    }
});

/** Functions */
async function formatModuleJSON(entry : RowDataPacket): Promise<RowDataPacket> {
	delete entry.courseUuid;

	const materials: RowDataPacket[]|null = await getMaterialsByModuleUUID(entry.uuid);
	if (materials != null) {
        entry.materials = materials;
    }

	const quizzes: RowDataPacket[]|null = await getQuizzesByModuleUUID(entry.uuid);
	if (quizzes != null) {
        entry.quizzes = quizzes;
    }

	return entry;
}

export async function checkModule(req : any, res : any, next : any): Promise<void> {
	try {
		const module: RowDataPacket|null = await findModuleByUUID(req.params.moduleUuid);
		if (module == null) {
			res.status(404).json({ message: "Module not found" });
			return;
		}
		req.module = module;
		next();
	} catch (error) {
		console.error("Error checking module:", error);
		res.status(500).json({ error: "Failed to check module" });
	}
}

export async function getModulesByCourseUUID(uuid : string): Promise<RowDataPacket[]|null> {
    if (!(await findCourseByUUID(uuid))) return null;
    const [modules] = await pool.execute<RowDataPacket[]>(`
            SELECT * FROM modules WHERE courseUuid = ? ORDER BY idx ASC
    `,[uuid]);
    for (const entry of modules) {
        await formatModuleJSON(entry);
    };
    return modules;
};

export async function findModuleByUUID(uuid : string): Promise<RowDataPacket|null> {
	const [modules] = await pool.execute<RowDataPacket[]>(`
			SELECT * FROM modules WHERE uuid = ?
	`,[uuid]);
	return modules.length == 1 ? modules[0] : null;
};

export async function updateModuleByUUID(uuid: string): Promise<void> {
    const module: RowDataPacket|null = await findModuleByUUID(uuid);
    if (module == null) return;

    await pool.execute(`
        UPDATE modules
        SET updateCount = ?
        WHERE uuid = ?
    `, [module.updateCount+1, uuid]);
}
