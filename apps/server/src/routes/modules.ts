import express from "express";
import { pool } from "@/db";
import { randomUUID } from "crypto";
import { authenticate, authenticateOptional, findUser } from "./users";
import * as z from "zod";
import { Types } from "..";
import type { RowDataPacket } from "mysql2";
import { FeedMessages } from "@/types/feed";
import { checkCourse } from "./courses";

export const moduleRoutes = express.Router({mergeParams: true});

moduleRoutes.get("/", checkCourse, authenticateOptional, async (req, res) => {
    try {
        const uuid : string = req.params.uuid;
        const modules = await getModulesByCourseUUID(uuid);
        const isLecturer = req.user != null && await findUser(req.user.name);

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
