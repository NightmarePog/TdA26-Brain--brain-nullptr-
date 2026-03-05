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
import { Answer, QuestionCreateRequest, QuizCreateRequest, QuizSubmitRequest, QuizUpdateRequest } from "@/types/quizzes";

export const quizRoute = "/:uuid/modules/:moduleUuid/quizzes";
export const quizRoutes = express.Router();

/** getAll */
quizRoutes.get(quizRoute, checkCourse, checkModule, async (req,res) => {
    try {
        const moduleUuid : string = req.params.uuid;
        const quizzes: RowDataPacket[]|null = await getQuizzesByModuleUUID(moduleUuid);
        if (quizzes == null) {
            res.status(404).json({message: "Quizzes not found"});
            return;
        }
        for (const quiz of quizzes) {
            const [answers] = await pool.execute<RowDataPacket[]>(`
                SELECT * FROM answers WHERE quizUuid = ?
            `,[quiz.uuid]);
            
            quiz.answers = await formatAnswersJSON(answers);
        }
        
        res.status(200).json(quizzes);
    } catch (error) {
        console.error("Error fetching quizzes:", error);
        res.status(500).json({ error: "Failed to fetch quizzes" });
    }
});

/** post */
quizRoutes.post(quizRoute, checkCourse, checkModule, authenticate, async (req, res) => {
    try {
        if (req.module == null) {
            res.status(404).json({"message":"Module not found"});
            return;
        }

        const moduleUuid = req.params.moduleUuid;
        const result: z.ZodSafeParseResult<QuizCreateRequest> = await QuizCreateRequest.safeParseAsync(req.body);
        if (!result.success || result.data.questions.length == 0) {
            res.status(400).json({ message: "Invalid body" });
            return;
        }

        const questions : QuestionCreateRequest[] = [];

        /** Parse questions */
        for (const q of result.data.questions) {
            const correctIndices : number[] = [];
            if (q.type == Types.QUESTION_SINGLE_CHOICE) {
                if (q.correctIndex == null) {
                    res.status(400).json({ message: "Missing correct index" });
                    return;
                }
                if (q.correctIndex > q.options.length-1 || q.correctIndex < 0) {
                    res.status(400).json({ message: `Length of correct index must be within 0 and ${q.options.length-1}` });
                    return;
                }

                correctIndices.push(q.correctIndex);
                delete q.correctIndex;
            } else if (q.type == Types.QUESTION_MULTIPLE_CHOICE) {
                if (q.correctIndices == null) {
                    res.status(400).json({ message: "Missing correct indices" });
                    return;
                }
                if (q.correctIndices.length == 0) {
                    res.status(400).json({ message: "Correct indices must not be empty" });
                    return;
                }

                for (const ci of q.correctIndices) {
                    if (ci > q.options.length-1 || ci < 0) {
                        res.status(400).json({ message: `Correct indices index must be within 0 and ${q.options.length-1}` });
                        return;
                    }
                    correctIndices.push(ci);
                }
                delete q.correctIndices;
            } else {
                res.status(400).json({ message: "Incorrect question type" });
                return;
            }
            q.correctIndices = correctIndices;
            questions.push(q);
        }

        const quizUuid : string = randomUUID();
        const title : string = result.data.title;
        const desc : string|null = result.data.description || null;

        await pool.execute(`
            INSERT INTO quizzes (uuid, moduleUuid, title, description)
            VALUES (?, ?, ?, ?)
        `,[quizUuid, moduleUuid, title, desc]);

        for (const q of questions) {
            const questionUuid : string = randomUUID();
            const type : string = q.type;
            const question : string = q.question;
            const correctIndices : number[]|null = q.correctIndices || null;
            const options : string[] = q.options;

            await pool.execute(`
                INSERT INTO questions (uuid, quizUuid, type, question)
                VALUES (?, ?, ?, ?)
            `,[questionUuid, quizUuid, type, question]);

            let idx=0;
            for (const o of options) {
                await pool.execute(`
                    INSERT INTO options (uuid, questionUuid, idx, opt, correct)
                    VALUES (?, ?, ?, ?, ?)
                `,[randomUUID(), questionUuid, idx, o, correctIndices != null ? correctIndices.indexOf(idx) != -1 : false]);
                idx++;
            }
        }

        const msg: string =
            `{
                "moduleUuid": "${req.params.moduleUuid}",
                "module": "${req.module.name}",
                "content": "Quiz '${title}'",
                "type": "${FeedMessages.CREATE}"
            }`
        await updateCourseByUUID(req.params.uuid, msg);

        const [quizzes] = await pool.execute<RowDataPacket[]>(`
            SELECT * FROM quizzes WHERE uuid = ?
        `,[quizUuid]);

        res.status(201).json(await formatQuizJSON(quizzes[0]));
    } catch (error) {
        console.error("Error creating quiz:", error);
        res.status(500).json({ error: "Failed to create quiz" });
    }
});

/** get */
quizRoutes.get(`${quizRoute}/:quizUuid`, checkCourse, checkModule, checkQuiz, async (req, res) => {
    try {
        if (req.quiz == null) {
            res.status(404).json({"message":"Quiz not found"});
            return;
        }

        const [answers] = await pool.execute<RowDataPacket[]>(`
            SELECT * FROM answers WHERE quizUuid = ?
        `,[req.params.quizUuid]);
        
        req.quiz.answers = await formatAnswersJSON(answers);

        res.status(200).json(req.quiz);
    } catch (error) {
        console.error("Error fetching quiz:", error);
        res.status(500).json({ error: "Failed to fetch quiz" });
    }
});

/** put */
quizRoutes.put(`${quizRoute}/:quizUuid`, checkCourse, checkModule, checkQuiz, authenticate, async (req, res) => {
    try {
        if (req.module == null) {
            res.status(404).json({"message":"Module not found"});
            return;
        }
        if (req.quiz == null) {
            res.status(404).json({"message":"Quiz not found"});
            return;
        }

        const quizUuid : string = req.params.quizUuid;

        const result: z.ZodSafeParseResult<QuizUpdateRequest> = await QuizUpdateRequest.safeParseAsync(req.body);
        if (!result.success || result.data.questions.length == 0) {
            res.status(400).json({ message: "Invalid body" });
            return;
        }

        const title : string = result.data.title || req.quiz.title;
        const questions : RowDataPacket|QuestionCreateRequest[] = result.data.questions || req.quiz.questions;
        const desc : string|null = result.data.description || req.quiz.description || null;
        
        if (questions != req.quiz.questions) {
            /** Parse questions */
            for (const q of questions) {
                if (q.type != Types.QUESTION_SINGLE_CHOICE && q.type != Types.QUESTION_MULTIPLE_CHOICE) {
                    res.status(400).json({ message: "Invalid question type" });
                    return;
                }
                if (q.options.length == 0) {
                    res.status(400).json({ message: "Question options must not be empty" });
                    return;
                }
    
                const correctIndices : number[] = [];
                if (q.type == Types.QUESTION_SINGLE_CHOICE) {
                    if (q.correctIndex == null) {
                        res.status(400).json({ message: "Missing correct index" });
                        return;
                    }
    
                    if (q.correctIndex > q.options.length-1 || q.correctIndex < 0) {
                        res.status(400).json({ message: `Correct index must be within 0 and ${q.options.length-1}` });
                        return;
                    }
                    correctIndices.push(q.correctIndex);
                    delete q.correctIndex;
                } else {
                    if (q.correctIndices == null) {
                        res.status(400).json({ message: "Missing correct indices" });
                        return;
                    }
                    if (q.correctIndices.length == 0) {
                        res.status(400).json({ message: "Correct indices must not be empty" });
                        return;
                    }
    
                    for (const ci of q.correctIndices) {
                        if (ci > q.options.length-1 || ci < 0) {
                            res.status(400).json({ message: `Correct indices number must be within 0 and ${q.options.length-1}` });
                            return;
                        }
                        correctIndices.push(ci);
                    }
                    delete q.correctIndices;
                }
                q.correctIndices = correctIndices;
                questions.push(q);
            }

            await pool.execute(`
                DELETE FROM questions WHERE quizUuid = ?
            `,[quizUuid]);

            for (const q of questions) {
                const questionUuid : string = randomUUID();
                const type : string = q.type;
                const question : string = q.question;
                const correctIndices : number[]|null = q.correctIndices || null;
                const options : string[] = q.options;

                await pool.execute(`
                    INSERT INTO questions (uuid, quizUuid, type, question)
                    VALUES (?, ?, ?, ?)
                `,[questionUuid, quizUuid, type, question]);

                let idx=0;
                for (const o of options) {
                    await pool.execute(`
                        INSERT INTO options (uuid, questionUuid, idx, opt, correct)
                        VALUES (?, ?, ?, ?, ?)
                    `,[randomUUID(), questionUuid, idx, o, correctIndices != null ? correctIndices.indexOf(idx) != -1 : null]);
                    idx++;
                }
            }
        }

        await pool.execute(`
            UPDATE quizzes
            SET title = ?, updateCount = ?, description = ?
            WHERE uuid = ?
        `,[title, req.quiz.updateCount+1, desc, quizUuid]);

        const msg: string =
            `{
                "moduleUuid": "${req.params.moduleUuid}",
                "module": "${req.module.name}",
                "content": "Quiz '${req.quiz.title}'",
                "type": "${FeedMessages.EDIT}"
            }`
        await updateCourseByUUID(req.params.uuid, msg);

        const new_quiz = await findQuizByUUID(quizUuid);
        if (new_quiz == null) {
            res.status(404).json({"message":"Quiz not found"});
            return;
        }
        res.status(201).json(await formatQuizJSON(new_quiz));
    } catch (error) {
        console.error("Error updating quiz:", error);
        res.status(500).json({ error: "Failed to update quiz" });
    }
});

/** delete */
quizRoutes.delete(`${quizRoute}/:quizUuid`, checkCourse, checkModule, checkQuiz, authenticate, async (req, res) => {
    try {
        if (req.module == null) {
            res.status(404).json({"message":"Module not found"});
            return;
        }
        if (req.quiz == null) {
            res.status(404).json({"message":"Quiz not found"});
            return;
        }

        const quizUuid = req.params.quizUuid;

        await pool.execute(`
            DELETE FROM quizzes WHERE uuid = ?
        `,[quizUuid]);

        const msg: string =
            `{
                "moduleUuid": "${req.params.moduleUuid}",
                "module": "${req.module.name}",
                "content": "Quiz '${req.quiz.title}'",
                "type": "${FeedMessages.DELETE}"
            }`
        await updateCourseByUUID(req.params.uuid, msg);

        res.status(204).json(({ message: "Quiz deleted sucessfully" }));
    } catch (error) {
        console.error("Error deleting quiz:", error);
        res.status(500).json({ error: "Failed to delete quiz" });
    }
});

/** post question */
quizRoutes.post(`${quizRoute}/:quizUuid/questions`, checkCourse, checkModule, checkQuiz, authenticate, async (req, res) => {
    try {
        if (req.module == null) {
            res.status(404).json({"message":"Module not found"});
            return;
        }
        if (req.quiz == null) {
            res.status(404).json({"message":"Quiz not found"});
            return;
        }

        const quizUuid : string = req.params.quizUuid;

        const result: z.ZodSafeParseResult<QuestionCreateRequest> = await QuestionCreateRequest.safeParseAsync(req.body);
        if (!result.success) {
            res.status(400).json({ message: "Invalid body" });
            return;
        }

        if (result.data.type != Types.QUESTION_SINGLE_CHOICE && result.data.type != Types.QUESTION_MULTIPLE_CHOICE) {
            res.status(400).json({ message: "Invalid question type" });
            return;
        }
        if (result.data.options.length == 0) {
            res.status(400).json({ message: "Question options must not be empty" });
            return;
        }

        const correctIndices : number[] = [];
        if (result.data.type == Types.QUESTION_SINGLE_CHOICE) {
            if (result.data.correctIndex == null) {
                res.status(400).json({ message: "Missing question->correctIndex" });
                return;
            }

            if (result.data.correctIndex > result.data.options.length-1 || result.data.correctIndex < 0) {
                res.status(400).json({ message: `question->correctIndex must be within 0 and ${result.data.options.length-1}` });
                return;
            }
            correctIndices.push(result.data.correctIndex);
            delete result.data.correctIndex;
        } else {
            if (result.data.correctIndices == null) {
                res.status(400).json({ message: "Missing question->correctIndices" });
                return;
            }
            if (result.data.correctIndices.length == 0) {
                res.status(400).json({ message: "question->correctIndices must not be empty" });
                return;
            }

            for (const ci of result.data.correctIndices) {
                if (ci > result.data.options.length-1 || ci < 0) {
                    res.status(400).json({ message: `question->correctIndices->number must be within 0 and ${result.data.options.length-1}` });
                    return;
                }
                correctIndices.push(ci);
            }
            delete result.data.correctIndices;
        }
        result.data.correctIndices = correctIndices;

        const questionUuid = randomUUID();

        await pool.execute(`
            INSERT INTO questions (uuid, quizUuid, type, question)
            VALUES (?, ?, ?, ?)
        `,[questionUuid, quizUuid, result.data.type, result.data.question]);

        let idx=0;
        for (const o of result.data.options) {
            await pool.execute(`
                INSERT INTO options (uuid, questionUuid, idx, opt, correct)
                VALUES (?, ?, ?, ?, ?)
            `,[randomUUID(), questionUuid, idx, o, correctIndices.indexOf(idx) != -1]);
            idx++;
        }

        await pool.execute(`
            UPDATE quizzes
            SET updateCount = ?
            WHERE uuid = ?
        `,[req.quiz.updateCount+1, quizUuid]);

        const msg: string =
            `{
                "moduleUuid": "${req.params.moduleUuid}",
                "module": "${req.module.name}",
                "content": "Quiz '${req.quiz.title}'",
                "type": "${FeedMessages.EDIT}"
            }`
        await updateCourseByUUID(req.params.uuid, msg);

        const new_quiz = await findQuizByUUID(quizUuid);
        if (new_quiz == null) {
            res.status(404).json({"message":"Quiz not found"});
            return;
        }
        res.status(201).json(await formatQuizJSON(new_quiz));
    } catch (error) {
        console.error("Error creating question:", error);
        res.status(500).json({ error: "Failed to create question" });
    }
});

/** put question */
quizRoutes.put(`${quizRoute}/:quizUuid/questions/:questionUuid`, checkCourse, checkModule, checkQuiz, checkQuestion, authenticate, async (req, res) => {
    try {
        if (req.module == null) {
            res.status(404).json({"message":"Module not found"});
            return;
        }
        if (req.quiz == null) {
            res.status(404).json({"message":"Quiz not found"});
            return;
        }

        const quizUuid : string = req.params.quizUuid;
        const questionUuid : string = req.params.questionUuid;

        const result: z.ZodSafeParseResult<QuestionCreateRequest> = await QuestionCreateRequest.safeParseAsync(req.body);
        if (!result.success) {
            res.status(400).json({ message: "Invalid body" });
            return;
        }

        if (result.data.type != Types.QUESTION_SINGLE_CHOICE && result.data.type != Types.QUESTION_MULTIPLE_CHOICE) {
            res.status(400).json({ message: "Invalid question type" });
            return;
        }
        if (result.data.options.length == 0) {
            res.status(400).json({ message: "Question options must not be empty" });
            return;
        }

        const correctIndices : number[] = [];
        if (result.data.type == Types.QUESTION_SINGLE_CHOICE) {
            if (result.data.correctIndex == null) {
                res.status(400).json({ message: "Missing question->correctIndex" });
                return;
            }

            if (result.data.correctIndex > result.data.options.length-1 || result.data.correctIndex < 0) {
                res.status(400).json({ message: `question->correctIndex must be within 0 and ${result.data.options.length-1}` });
                return;
            }
            correctIndices.push(result.data.correctIndex);
            delete result.data.correctIndex;
        } else {
            if (result.data.correctIndices == null) {
                res.status(400).json({ message: "Missing question->correctIndices" });
                return;
            }
            if (result.data.correctIndices.length == 0) {
                res.status(400).json({ message: "question->correctIndices must not be empty" });
                return;
            }

            for (const ci of result.data.correctIndices) {
                if (ci > result.data.options.length-1 || ci < 0) {
                    res.status(400).json({ message: `question->correctIndices->number must be within 0 and ${result.data.options.length-1}` });
                    return;
                }
                correctIndices.push(ci);
            }
            delete result.data.correctIndices;
        }
        result.data.correctIndices = correctIndices;

        await pool.execute(`
            UPDATE questions
            SET type = ?, question = ?
            WHERE uuid = ?
        `,[result.data.type, result.data.question, questionUuid]);

        await pool.execute(`
            DELETE FROM options WHERE questionUuid = ?
        `,[questionUuid]);

        let idx=0;
        for (const o of result.data.options) {
            await pool.execute(`
                INSERT INTO options (uuid, questionUuid, idx, opt, correct)
                VALUES (?, ?, ?, ?, ?)
            `,[randomUUID(), questionUuid, idx, o, correctIndices.indexOf(idx) != -1]);
            idx++;
        }

        await pool.execute(`
            UPDATE quizzes
            SET updateCount = ?
            WHERE uuid = ?
        `,[req.quiz.updateCount+1, quizUuid]);

        const msg: string =
            `{
                "moduleUuid": "${req.params.moduleUuid}",
                "module": "${req.module.name}",
                "content": "Quiz '${req.quiz.title}'",
                "type": "${FeedMessages.EDIT}"
            }`
        await updateCourseByUUID(req.params.uuid, msg);

        const new_quiz = await findQuizByUUID(quizUuid);
        if (new_quiz == null) {
            res.status(404).json({"message":"Quiz not found"});
            return;
        }
        res.status(201).json(await formatQuizJSON(new_quiz));
    } catch (error) {
        console.error("Error updating question:", error);
        res.status(500).json({ error: "Failed to update question" });
    }
});

/** delete question */
quizRoutes.delete(`${quizRoute}/:quizUuid/questions/:questionUuid`, checkCourse, checkModule, checkQuiz, checkQuestion, authenticate, async (req, res) => {
    try {
        if (req.module == null) {
            res.status(404).json({"message":"Module not found"});
            return;
        }
        if (req.quiz == null) {
            res.status(404).json({"message":"Quiz not found"});
            return;
        }

        const quizUuid : string = req.params.quizUuid;
        const questionUuid: string = req.params.questionUuid;

        await pool.execute(`
            UPDATE quizzes
            SET updateCount = ?
            WHERE uuid = ?
        `,[req.quiz.updateCount+1, quizUuid]);

        await pool.execute(`
            DELETE FROM questions WHERE uuid = ?
        `,[questionUuid]);

        const msg: string =
            `{
                "moduleUuid": "${req.params.moduleUuid}",
                "module": "${req.module.name}",
                "content": "Quiz '${req.quiz.title}'",
                "type": "${FeedMessages.EDIT}"
            }`
        await updateCourseByUUID(req.params.uuid, msg);

        res.status(204).json(({ message: "Question deleted sucessfully" }));

    } catch (error) {
        console.error("Error deleting question:", error);
        res.status(500).json({ error: "Failed to delete question" });
    }
});

/** post answer */
quizRoutes.post(`${quizRoute}/:quizUuid/submit`, checkCourse, checkModule, checkQuiz, async (req, res) => {
    try {
        if (req.quiz == null) {
            res.status(404).json({"message":"Quiz not found"});
            return;
        }

        const quizUuid : string = req.params.quizUuid;

        const result: z.ZodSafeParseResult<QuizSubmitRequest> = await QuizSubmitRequest.safeParseAsync(req.body);
        if (!result.success) {
            res.status(400).json({ message: "Invalid body" });
            return;
        }

        const answers = result.data.answers;
        const ansCount = answers.length;

        const [questions] = await pool.execute<RowDataPacket[]>(`
            SELECT * FROM questions WHERE quizUuid = ?
        `,[quizUuid]);

        let score : number = 0, maxScore : number = 0;
        const correctPerQuestion : boolean[] = [];

        let correctAnsIdx = 0;
        for (const q of questions) {
            const [correctAnswers] = await pool.execute<RowDataPacket[]>(`
                SELECT * FROM options WHERE questionUuid = ? AND correct = ?
            `,[q.uuid, true]);
            maxScore+=correctAnswers.length;

            if (correctAnsIdx >= ansCount) {
                correctPerQuestion.push(false);
                continue;
            }
            correctAnsIdx++;

            let ans = null;
            for (const a of answers) {
                if (a.uuid == q.uuid) {
                    ans = a;
                }
            }
            if (ans == null) {
                res.status(404).json({ message: "Invalid question uuid" });
                return;
            }

            if (q.type == Types.QUESTION_SINGLE_CHOICE) {
                if (ans.selectedIndex == null) {
                    res.status(400).json({ message: "Missing selected index" });
                    return;
                }
                const isCorrect = ans.selectedIndex == correctAnswers[0].idx;
                if (isCorrect) {
                    score += 1;
                }
                correctPerQuestion.push(isCorrect);
            } else {
                if (ans.selectedIndices == null) {
                    res.status(400).json({ message: "Missing selected indices" });
                    return;
                }
                if (ans.selectedIndices.length == 0) {
                    correctPerQuestion.push(false);
                    continue;
                }
                ans.selectedIndices = [...new Set(ans.selectedIndices)];

                const correctIndices: number[] = [];
                for (const ci of correctAnswers) {
                    correctIndices.push(ci.idx);
                }

                let totalCorrect : number = 0;
                for (const a of ans.selectedIndices) {
                    totalCorrect += correctIndices.indexOf(a) != -1 ? 1 : 0;
                }

                const totalBad : number = ans.selectedIndices.filter(n => !correctIndices.includes(n)).length;
                let corrects : number = Math.max(0,totalCorrect-totalBad);
                score += corrects;
                correctPerQuestion.push(corrects == correctAnswers.length);
            }
        }

        const answerUuid : string = randomUUID();
        let cpq: string = "";
        for (const q of correctPerQuestion) cpq += q + ",";

        await pool.execute(`
            INSERT INTO answers (uuid, quizUuid, score, maxScore, correctPerQuestion)
            VALUES (?, ?, ?, ?, ?)
        `,[answerUuid, quizUuid, score, maxScore, cpq]);

        await pool.execute(`
            UPDATE quizzes
            SET attemptsCount = ?
            WHERE uuid = ?
        `,[req.quiz.attemptsCount+1, quizUuid]);

        const [db_answers] = await pool.execute<RowDataPacket[]>(`
            SELECT * FROM answers WHERE uuid = ?
        `,[answerUuid]);

        res.status(200).json((await formatAnswersJSON(db_answers))[0]);
    } catch (error) {
        console.error("Error submitting quiz:", error);
        res.status(500).json({ error: "Failed to submit quiz" });
    }
});


/** Functions */
async function checkQuiz(req : any, res : any, next : any): Promise<void> {
	try {
		const quiz = await findQuizByUUID(req.params.quizUuid);
		if (!quiz) {
			res.status(404).json({ message: "Quiz not found" });
			return;
		}
		req.quiz = quiz;
		next();
	} catch (error) {
		console.error("Error checking quiz:", error);
		res.status(500).json({ error: "Failed to check quiz" });
	}
}

async function checkQuestion(req : any, res : any, next : any): Promise<void> {
	try {
		const question = await findQuestionByUUID(req.params.questionUuid);
		if (!question) {
			res.status(404).json({ message: "Question not found" });
			return;
		}
		req.question = question;
		next();
	} catch (error) {
		console.error("Error checking question:", error);
		res.status(500).json({ error: "Failed to check question" });
	}
}

async function findQuizByUUID(uuid : string): Promise<RowDataPacket|null> {
    const [quizzes] = await pool.execute<RowDataPacket[]>(`
            SELECT * FROM quizzes WHERE uuid = ?
    `,[uuid]);
    return quizzes.length == 1 ? (await formatQuizJSON(quizzes[0])) : null;
};

async function findQuestionByUUID(uuid : string): Promise<RowDataPacket|null> {
	const [questions] = await pool.execute<RowDataPacket[]>(`
			SELECT * FROM questions WHERE uuid = ?
	`,[uuid]);
	return questions.length == 1 ? (questions[0]) : null;
};

async function formatQuizJSON(entry : RowDataPacket): Promise<RowDataPacket> {
    delete entry.moduleUuid;

    const [questions] = await pool.execute<RowDataPacket[]>(`
        SELECT * FROM questions WHERE quizUuid = ?
    `,[entry.uuid]);
    let qCount = 0;
    let maxScore = 0;
    for (const q of questions) {
        qCount++;
        delete q.quizUuid;

        const [db_options] = await pool.execute<RowDataPacket[]>(`
            SELECT * FROM options WHERE questionUuid = ? ORDER BY idx ASC
        `,[q.uuid]);

        const options : string[] = [];
        const correctIndices : number[] = [];

        for (const op of db_options) {
            options.push(op.opt);
            if (op.correct) {
                maxScore++;
                correctIndices.push(op.idx);
            }
        }
        q.options = options;

        if (q.type == Types.QUESTION_SINGLE_CHOICE) {
            q.correctIndex = correctIndices.at(0);
        } else {
            q.correctIndices = correctIndices;
        }
    };
    entry.maxScore = maxScore;
    entry.questionCount = qCount;
    entry.questions = questions;

    return entry;
};

async function formatAnswersJSON(entry : RowDataPacket[]): Promise<RowDataPacket[]> {
	for (const q of entry) {
		delete q.uuid;
		delete q.quizUuid;
		let cpq : Array<string> = q.correctPerQuestion.split(",");
		q.correctPerQuestion = [];
		for (const c of cpq) {
			if (c == "false") {
				q.correctPerQuestion.push(false);
			} else if (c == "true") {
				q.correctPerQuestion.push(true);
			}
		}
	}

	return entry;
};

export async function getQuizzesByModuleUUID(uuid : string): Promise<RowDataPacket[]|null> {
    if (!(await findModuleByUUID(uuid))) return null;
    const [quizzes] = await pool.execute<RowDataPacket[]>(`
            SELECT * FROM quizzes WHERE moduleUuid = ? ORDER BY createdAt DESC
    `,[uuid]);
    for (const entry of quizzes) {
        await formatQuizJSON(entry);
    };
    return quizzes;
};
