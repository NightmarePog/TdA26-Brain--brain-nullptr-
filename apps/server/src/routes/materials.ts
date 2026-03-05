import express from "express";
import { pool } from "@/db";
import { randomUUID } from "crypto";
import { authenticate } from "./users";
import * as z from "zod";
import { Types, upload } from "..";
import type { RowDataPacket } from "mysql2";
import { FeedMessages } from "@/types/feed";
import { checkCourse, updateCourseByUUID } from "./courses";
import { checkModule, findModuleByUUID } from "./modules";
import { FileCreateRequest, FileUpdateRequest, UrlCreateRequest, UrlUpdateRequest } from "@/types/materials";
import { createDirectory, fileOrDirectoryExists, moveFile } from "@/utils/filesystem";
import type { SendFileOptions } from "express-serve-static-core";

export const materialRoute = "/:uuid/modules/:moduleUuid/materials";
export const materialRoutes = express.Router();

/** getAll */
materialRoutes.get(materialRoute, checkCourse, checkModule, async (req, res) => {
    try {
        const moduleUuid : string = req.params.moduleUuid;
        const materials = await getMaterialsByModuleUUID(moduleUuid);
        res.status(200).json(materials);
    } catch (error) {
        console.error("Error fetching materials:", error);
        res.status(500).json({ error: "Failed to fetch materials" });
    }
});

/** post */
materialRoutes.post(materialRoute, checkCourse, checkModule, authenticate, async (req, res, next) => {
    try {
        const moduleUuid : string = req.params.moduleUuid;
        const uuid : string = randomUUID();

        if (req.is('application/json')) {
            /** URL */
            const result: z.ZodSafeParseResult<UrlCreateRequest> = await UrlCreateRequest.safeParseAsync(req.body);
            if (!result.success) {
                res.status(400).json({ message: "Invalid body" });
                return;
            }
            const url : string = result.data.url;
            const name : string = result.data.name;
            const type : string = Types.MATERIAL_URL;
            const faviconUrl : string = `${url}/favicon.ico`;
            const desc : string|null = result.data.description || null;

            await pool.execute(`
                INSERT INTO materials (uuid, moduleUuid)
                VALUES (?, ?)
            `,[uuid, moduleUuid]);

            await pool.execute(`
                INSERT INTO urls (uuid, name, type, url, faviconUrl, description)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [uuid, name, type, url, faviconUrl, desc]);

            req.materialUuid = uuid;
            req.name = name;
            next();
        } else if (req.is('multipart/form-data')) {
            /** FILE */
            await upload(req, res, async (err : any) => {
                if (err) {
                    res.status(400).json({ message: err.message });
                    return;
                }
                if (req.file == null) {
                    res.status(400).json({ message: "File doesn't exist" });
                    return;
                }

                const result: z.ZodSafeParseResult<FileCreateRequest> = await FileCreateRequest.safeParseAsync(req.body);
                if (!result.success) {
                    res.status(400).json({ message: "Invalid body" });
                    return;
                }
                const name : string = result.data.name || req.file.originalname, description : string|null = result.data.description || null;
                const mimeType : string = req.file.mimetype;
                const sizeBytes : number = req.file.size;
                const type : string = Types.MATERIAL_FILE;
    
                const tmpFilePath = `/app/tmp/${req.params.uuid}`;
                const newDirPath = `/app/materials/${req.params.uuid}`;
                const newFilePath = `${newDirPath}/${uuid}`;
    
                if (!(await fileOrDirectoryExists(newDirPath))) {
                    await createDirectory(newDirPath);
                }
                await moveFile(tmpFilePath, newFilePath);
    
                await pool.execute(`
                    INSERT INTO materials (uuid, moduleUuid)
                    VALUES (?, ?)
                `,[uuid, moduleUuid]);
    
                await pool.execute(`
                    INSERT INTO files (uuid, name, type, fileUrl, description, mimeType, sizeBytes)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [uuid, name, type, newFilePath, description, mimeType, sizeBytes]);

                req.materialUuid = uuid;
                req.name = name;
                next();
            });
        } else {
            res.status(400).json({ message: "Invalid content type" });
            return;
        }
    } catch (error) {
        console.error("Error creating material:", error);
        res.status(500).json({ error: "Failed to create material" });
    }
}, async (req, res) => {
    if (req.module == null) {
        res.status(404).json({"message":"Module not found"});
        return;
    }
    const msg: string =
        `{
            "moduleUuid": "${req.params.moduleUuid}",
            "module": "${req.module.name}",
            "content": "Material '${req.name}'",
            "type": "${FeedMessages.CREATE}"
        }`
    await updateCourseByUUID(req.params.uuid, msg);

    const [materials] = await pool.execute<RowDataPacket[]>(`
        SELECT * FROM materials WHERE uuid = ?
    `,[req.materialUuid]);

    res.status(201).json(await formatMaterialJSON(materials[0]));
});

/** get */
materialRoutes.get(`${materialRoute}/:materialUuid`, checkCourse, checkModule, checkMaterial, async (req, res, next) => {
    try {
        if (req.material == null) {
            res.status(404).json({"message":"Material not found"});
            return;
        }
        const material = req.material;

        if (material.type == Types.MATERIAL_URL) {
            res.status(200).json(material);
            return;
        } else if (material.type == Types.MATERIAL_FILE && material.fileUrl != null) {
            const options : SendFileOptions = {
                dotfiles: 'deny',
                headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
                }
            }

            res.status(200).sendFile(material.fileUrl, options, (err) => {
                if (err) {
                    console.error(err);
                };
            })
            return;
        }
        res.status(400);
        
    } catch (error) {
        console.error("Error fetching material:", error);
        res.status(500).json({ error: "Failed to fetch material" });
    }
});

/** put */
materialRoutes.put(`${materialRoute}/:materialUuid`, checkCourse, checkModule, checkMaterial, authenticate, async (req, res, next) => {
    try {
        if (req.material == null) {
            res.status(404).json({ message: "Material not found" });
            return;
        }
        const moduleUuid: string = req.params.moduleUuid;
        const materialUuid: string = req.params.materialUuid;
        const material = req.material;
        const type = material.type;

        if (type == Types.MATERIAL_FILE) {
            if (req.is('multipart/form-data')) {
                /** With file replacement */
                upload(req, res, async function(err : any) {
                    if (err) {
                        return res.status(400).json({ message:err.message });
                    }
                    if (req.file == null) {
                        res.status(400).json({ message: "File doesn't exist" });
                        return;
                    }
                    
                    const result: z.ZodSafeParseResult<FileUpdateRequest> = await FileUpdateRequest.safeParseAsync(req.body);
                    if (!result.success) {
                        res.status(400).json({ message: "Invalid body" });
                        return;
                    }

                    const name : string = result.data.name || material.name;
                    const description : string|null = result.data.description || material.description || null;
                    const mimeType : string = req.file.mimetype;
                    const sizeBytes : number = req.file.size;
        
                    const tmpFilePath = `/app/tmp/${req.params.uuid}`;
                    const newDirPath = `/app/materials/${req.params.uuid}`;
                    const newFilePath = `${newDirPath}/${materialUuid}`;

                    if (!(await fileOrDirectoryExists(newDirPath))) {
                        await createDirectory(newDirPath);
                    }
                    await moveFile(tmpFilePath, newFilePath);

                    await pool.execute(`
                        UPDATE files
                        SET name = ?, description = ?, mimeType = ?, sizeBytes = ?
                        WHERE uuid = ?
                    `, [name, description, mimeType, sizeBytes, materialUuid]);
                    
                    req.name = name;
                    next();
                });
            } else if (req.is('application/json')) {
                /** Without file replacement */
                const result: z.ZodSafeParseResult<FileUpdateRequest> = await FileUpdateRequest.safeParseAsync(req.body);
                if (!result.success) {
                    res.status(400).json({ message: "Invalid body" });
                    return;
                }

                const name: string = result.data.name || material.name;
                const desc: string|null = result.data.description || material.description || null;

                await pool.execute(`
                    UPDATE files
                    SET name = ?, description = ?
                    WHERE uuid = ?
                `, [name, desc, materialUuid]);

                req.name = name;
                next();
            } else {
                res.status(400).json({ message: "Invalid content type" });
                return;
            }
        } else if (type == Types.MATERIAL_URL) {
            const result: z.ZodSafeParseResult<UrlUpdateRequest> = await UrlUpdateRequest.safeParseAsync(req.body);
            if (!result.success) {
                res.status(400).json({ message: "Invalid body" });
                return;
            }
            const name: string = result.data.name || material.name;
            const desc: string|null = result.data.description || material.description || null;
            const url: string|null = result.data.url || material.url || null;

            await pool.execute(`
                UPDATE urls
                SET name = ?, description = ?, url = ?, faviconUrl = ?
                WHERE uuid = ?
            `, [name, desc, url, `${url}/favicon.ico`, materialUuid]);

            req.name = name;
            next();
        }
        
    } catch (error) {
        console.error("Error updating material:", error);
        res.status(500).json({ error: "Failed to update material" });
    }
}, async (req, res) => {
    if (req.material == null) {
        res.status(404).json({"message":"Material not found"});
        return;
    }
    if (req.module == null) {
        res.status(404).json({"message":"Module not found"});
        return;
    }

    await pool.execute(`
        UPDATE materials
        SET updateCount = ?
        WHERE uuid = ?
    `, [req.material.updateCount+1, req.material.uuid]);

    const msg: any =
        `{
            "moduleUuid": "${req.params.moduleUuid}",
            "module": "${req.module.name}",
            "content": "Material '${req.material.name}'",
            "type": "${FeedMessages.EDIT}"
        }`
    await updateCourseByUUID(req.params.uuid, msg);

    res.status(200).json(await findMaterialByUUID(req.material.uuid));
});

/** delete */
materialRoutes.delete(`${materialRoute}/:materialUuid`, checkCourse, checkModule, checkMaterial, authenticate, async (req, res) => {
    try {
        if (req.material == null) {
            res.status(404).json({"message":"Material not found"});
            return;
        }
        if (req.module == null) {
            res.status(404).json({"message":"Module not found"});
            return;
        }

        const materialUuid: string = req.params.materialUuid;

        await pool.execute(`
            DELETE FROM materials WHERE uuid = ?
        `,[materialUuid]);

        const msg: string =
            `{
                "moduleUuid": "${req.params.moduleUuid}",
                "module": "${req.module.name}",
                "content": "Material ${req.material.name}",
                "type": "${FeedMessages.DELETE}"
            }`
        await updateCourseByUUID(req.params.uuid, msg);

        res.status(204).json({ message: "Material deleted sucessfully" });
    } catch (error) {
        console.error("Error deleting material:", error);
        res.status(500).json({ error: "Failed to delete material" });
    }
});


/** Functions */
async function checkMaterial(req : any, res : any, next : any): Promise<void> {
	try {
		const material: RowDataPacket|null = await findMaterialByUUID(req.params.materialUuid);
		if (material == null) {
			res.status(404).json({ message: "Material not found" });
			return;
		}
		req.material = material;
		next();
	} catch (error) {
		console.error("Error checking material:", error);
		res.status(500).json({ error: "Failed to check material" });
	}
}

async function formatMaterialJSON(entry : RowDataPacket): Promise<RowDataPacket|null> {
	delete entry.moduleUuid;

	/** Prioritize file instead of url, shouldnt cause problems */
	const [files] = await pool.execute<RowDataPacket[]>(`
		SELECT * FROM files WHERE uuid = ?
	`,[entry.uuid]);
	const file = files.length == 1 ? files[0] : null;
	if (file) {
		delete file.uuid;
		entry = Object.assign(entry, file);
		return entry;
	}

	const [urls] = await pool.execute<RowDataPacket[]>(`
		SELECT * FROM urls WHERE uuid = ?
	`,[entry.uuid]);
	const url = urls.length == 1 ? urls[0] : null;
	if (url) {
		delete url.uuid;
		entry = Object.assign(entry, url);
		return entry;
	}
    return null;
};

async function findMaterialByUUID(uuid : string): Promise<RowDataPacket|null> {
    const [materials] = await pool.execute<RowDataPacket[]>(`
            SELECT * FROM materials WHERE uuid = ?
    `,[uuid]);
    return materials.length == 1 ? (await formatMaterialJSON(materials[0])) : null;
};

export async function getMaterialsByModuleUUID(uuid : string): Promise<RowDataPacket[]|null> {
    if (!(await findModuleByUUID(uuid))) return null;
    const [materials] = await pool.execute<RowDataPacket[]>(`
            SELECT * FROM materials WHERE moduleUuid = ? ORDER BY createdAt DESC
    `,[uuid]);
    for (const entry of materials) {
        await formatMaterialJSON(entry);
    };
    return materials;
};
