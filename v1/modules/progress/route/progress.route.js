import express from "express";
import * as progressController from "../controller/progress.controller.js";
import { authorize } from "../../../middleware/authorize.js";
import { authorizeRole } from "../../../middleware/authorizeRole.js";
import { validate } from "../../../middleware/validate.middleware.js";
import { markLessonCompleteSchema } from "../validation/progress.validation.js";

const router = express.Router();

// ---------- Student routes ----------
router.post(
  "/complete",
  authorize,
  validate(markLessonCompleteSchema),
  progressController.markLessonComplete,
);
router.delete("/:lessonId", authorize, progressController.markLessonIncomplete);
router.get("/course/:courseId", authorize, progressController.getMyCourseProgress);
router.get("/my-overview", authorize, progressController.getMyOverallProgress);

// ---------- Admin routes ----------
router.get(
  "/course/:courseId/student/:studentId",
  authorize,
  authorizeRole("admin"),
  progressController.getStudentProgressForCourse,
);

export default router;