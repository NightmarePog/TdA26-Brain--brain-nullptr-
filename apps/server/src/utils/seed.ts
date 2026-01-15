import { writeFile } from "./filesystem";

async function call(method: string, content: string, endpoint: string, data: any) {
    const res = await fetch(`http://localhost:3000/api/${endpoint}`, {
        method: method,
        headers: {
            "Content-Type": content
        },
        body: data
    });
    if (res.ok && res.body) {
        return res.json();
    }
}

export async function seed() {
    /** PURGE EXISTING */
    const existing_courses = await call(
        "GET",
        "application/json",
        "courses",
        null
    );
    for (const c of existing_courses) {
        await call(
            "DELETE",
            "application/json",
            `courses/${c.uuid}`,
            null
        );
    }

    /** CREATE TESTING DATA */
    const course = await call(
        "POST",
        "application/json",
        "courses",
        '{"name":"Welcome, TdA 2026!"}'
    );
    const url_material = await call(
        "POST",
        "application/json",
        `courses/${course.uuid}/materials`,
        '{"name":"Seznam Website", "description":"The website for Seznam", "url":"https://seznam.cz"}'
    );

    const formData  = new FormData();
    formData.append("file", new File(["Hello, world!"], "file.png", {type: "image/png"}))
    formData.append("description", "A file!");

    const res = await fetch(`http://localhost:3000/api/courses/${course.uuid}/materials`, {
        method: 'POST',
        body: formData
    });

    const quiz_single_choice = await call(
        "POST",
        "application/json",
        `courses/${course.uuid}/quizzes`,
        `{
            "title": "Basic Programming Quiz",
            "description": "Test your basic programming knowledge",
            "questions": [
            {
                "type": "singleChoice",
                "question": "What does HTML stand for?",
                "options": [
                "HyperText Markup Language",
                "HighText Machine Language",
                "Hyperlink and Text Markup Language",
                "Home Tool Markup Language"
                ],
                "correctIndex": 0
            },
            {
                "type": "singleChoice",
                "question": "Which keyword is used to declare a constant in JavaScript?",
                "options": ["var", "let", "const", "static"],
                "correctIndex": 2
            }
            ]
        }`
    );
    const quiz_multiple_choice = await call(
        "POST",
        "application/json",
        `courses/${course.uuid}/quizzes`,
        `{
            "title": "Web Development Basics",
            "description": "Multiple choice quiz about web technologies",
            "questions": [
            {
                "type": "multipleChoice",
                "question": "Which of the following are JavaScript frameworks?",
                "options": ["React", "Laravel", "Vue", "Django"],
                "correctIndices": [0, 2]
            },
            {
                "type": "multipleChoice",
                "question": "Which HTTP methods are idempotent?",
                "options": ["GET", "POST", "PUT", "DELETE"],
                "correctIndices": [0, 2, 3]
            }
            ]
        }`
    );
    const quiz_mix = await call(
        "POST",
        "application/json",
        `courses/${course.uuid}/quizzes`,
        `{
            "title": "Ari Lore",
            "description": "Quiz about me, the backend developer",
            "questions": [
            {
                "type": "singleChoice",
                "question": "How old am i?",
                "options": ["13", "14", "15", "16", "17", "18", "19", "20"],
                "correctIndex": 4
            },
            {
                "type": "multipleChoice",
                "question": "What are my hobbies?",
                "options": ["Guitar", "Running", "Electrical work", "Linux", "Cybersecurity", "Partying"],
                "correctIndices": [0, 2, 3]
            },
            {
                "type": "singleChoice",
                "question": "Was this quiz good?",
                "options": ["Yes", "No"],
                "correctIndex": 1
            }
            ]
        }`
    );
    const feed = await call(
        "POST",
        "application/json",
        `courses/${course.uuid}/feed`,
        '{"message":"I am gay!"}'
    );
}
