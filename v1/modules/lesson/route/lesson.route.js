import express from "express";
import * as lessonController from "../controller/lesson.controller.js";
import { authorize } from "../../../middleware/authorize.js";
import { authorizeRole } from "../../../middleware/authorizeRole.js";
import { optionalAuthorize } from "../../../middleware/optionalAuthorize.js";
import { validate } from "../../../middleware/validate.middleware.js";
import UploadMiddleware from "../../../middleware/upload.middleware.js";
import { createLessonSchema, updateLessonSchema } from "../validation/lesson.validation.js";

const router = express.Router();

const uploadLessonVideo = UploadMiddleware(["mp4", "webm", "mov", "quicktime"], 100).single("video");

// public list (metadata only unless enrolled/preview)
router.get("/course/:courseId", optionalAuthorize, lessonController.getLessonsForCourse);

// requires login — access itself checked inside service
router.get("/:id", authorize, lessonController.getLessonById);

// admin only
router.post(
  "/",
  authorize,
  authorizeRole("admin"),
  uploadLessonVideo,
  validate(createLessonSchema),
  lessonController.createLesson,
);
router.patch(
  "/:id",
  authorize,
  authorizeRole("admin"),
  uploadLessonVideo,
  validate(updateLessonSchema),
  lessonController.updateLesson,
);
router.delete("/:id", authorize, authorizeRole("admin"), lessonController.deleteLesson);

export default router;