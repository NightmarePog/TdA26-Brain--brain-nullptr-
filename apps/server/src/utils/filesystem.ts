/** Utility for creating and reading from directories and files */

const fs = require('fs').promises;

export async function fileOrDirectoryExists(path : string) : Promise<boolean> {
    try {
        await fs.access(path, fs.constants.F_OK);
        return true;
    } catch (error) {
        if (error.code == "ENOENT") {
            return false;
        } else {
            console.error("Error while checking path existance:", error);
            /** It's probably safe to return false here */
            return false;
        }
    }
}

export async function isDirectory(path : string) : Promise<boolean> {
    if (!(await fileOrDirectoryExists(path))) {
        console.error("File or directory doesn't exist");
        return false;
    }
    const stats = await fs.stat(path);
    return stats.isDirectory();
}

export async function readFile(path : string, format : string) : Promise<string|void> {
    if (!(await fileOrDirectoryExists(path))) {
        console.error("File doesn't exist");
        return;
    }
    if (await isDirectory(path)) {
        console.error("Path is a directory");
        return;
    }
    try {
        const data = await fs.readFile(path, format);
        return data;
    } catch (error) {
        console.error("Error reading file:", error);
    }
}

export async function writeFile(path : string, format : string, data : string) : Promise<string|void> {
    if (await isDirectory(path)) {
        console.error("Path is a directory");
        return;
    }
    try {
        await fs.writeFile(path, data, format);
        return data;
    } catch (error) {
        console.error("Error writing file:", error);
    }
}

export async function appendFile(path : string, format : string, data : string) : Promise<string|void> {
    if (!(await fileOrDirectoryExists(path))) {
        console.error("File doesn't exist");
        return;
    }
    if (await isDirectory(path)) {
        console.error("Path is a directory");
        return;
    }
    try {
        await fs.appendFile(path, data, format);
        return data;
    } catch (error) {
        console.error("Error appending file:", error);
    }
}

export async function deleteFile(path : string) : Promise<void> {
    if (!(await fileOrDirectoryExists(path))) {
        console.error("File doesn't exist");
        return;
    }
    if (await isDirectory(path)) {
        console.error("Path is a directory");
        return;
    }
    try {
        await fs.unlink(path);
    } catch (error) {
        console.error("Error deleting file:", error);
    }
}

export async function moveFile(path : string, newPath : string) : Promise<void> {
    if (!(await fileOrDirectoryExists(path))) {
        console.error("File doesn't exist");
        return;
    }
    try {
        await fs.rename(path, newPath);
    } catch (error) {
        console.error("Error moving file:", error);
    }
}

export async function createDirectory(path : string) : Promise<void> {
    if (await fileOrDirectoryExists(path)) {
        console.error("Directory already exists");
        return;
    }
    try {
        await fs.mkdir(path);
    } catch (error) {
        console.error("Error creating directory:", error);
    }
}

export async function deleteDirectory(path : string) : Promise<void> {
    if (!(await fileOrDirectoryExists(path))) {
        console.error("Directory doesn't exist");
        return;
    }
    try {
        if (!(await isDirectory(path))) {
            console.error("Path is not a directory");
            return;
        }

        await fs.rm(path, { recursive: true, force: true });

    } catch (error) {
        console.error("Error deleting directory:", error);
    }
}
