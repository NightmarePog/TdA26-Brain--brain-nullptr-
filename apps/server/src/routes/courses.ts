import express from "express";
import { pool } from "@/db";
import { randomUUID } from "crypto";
import type { QueryResult } from "mysql2";

export const courseRoutes = express.Router();

courseRoutes.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM courses");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

courseRoutes.post("/", async (req, res) => {
  try {
    const uuid: string = randomUUID();
    const name: string = req.body.name;
    const desc: string = req.body.description || "";
    await pool.execute(
      `
            INSERT INTO courses (uuid, name, description)
            VALUES (?, ?, ?)
        `,
      [uuid, name, desc],
    );
    const course = await findCourseByUUID(uuid);
    res.status(201).json(course);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Failed to create course" });
  }
});

courseRoutes.get("/:uuid", async (req, res) => {
  try {
    const uuid: string = req.params.uuid;
    const course = await findCourseByUUID(uuid);
    course
      ? res.status(200).json(course)
      : res.status(404).json({ message: "Invalid course uuid" });
  } catch (error) {
    console.error("Error getting course details:", error);
    res.status(500).json({ error: "Failed to get course details" });
  }
});

courseRoutes.delete("/:uuid", async (req, res) => {
  try {
    const uuid: string = req.params.uuid;
    const course = await findCourseByUUID(uuid);
    if (!course) {
      res.status(404).json({ message: "Invalid course uuid" });
      return;
    }
    // TODO: delete from datbase
  } catch (error) {
    console.error("Error getting course details:", error);
    res.status(500).json({ error: "Failed to get course details" });
  }
});

courseRoutes.put("/:uuid", async (req, res) => {
  try {
    const uuid: string = req.params.uuid;

    const course = await findCourseByUUID(uuid);
    if (!course) {
      res.status(404).json({ message: "Invalid course uuid" });
      return;
    }

    if (req.body) {
      const name: string = req.body.name != null ? req.body.name : course.name;
      const desc: string =
        req.body.description != null
          ? req.body.description
          : course.description;

      await pool.execute(
        `
				UPDATE courses
				SET name = ?, description = ?
				WHERE uuid = ?
			`,
        [name, desc, uuid],
      );
    }

    res.status(200).json(await findCourseByUUID(uuid));
  } catch (error) {
    console.error("Error getting course details:", error);
    res.status(500).json({ error: "Failed to get course details" });
  }
});

async function findCourseByUUID(uuid: string) {
  const [courses] = await pool.execute(
    `
			SELECT * FROM courses WHERE uuid = ?
	`,
    [uuid],
  );
  return courses.length == 1 ? courses[0] : null;
}
