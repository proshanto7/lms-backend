import express from "express";
import * as courseController from "../controller/course.controller.js";
import { authorize } from "../../../middleware/authorize.js";
import { authorizeRole } from "../../../middleware/authorizeRole.js";
import { validate } from "../../../middleware/validate.middleware.js";
import UploadMiddleware from "../../../middleware/upload.middleware.js";
import {
  createCourseSchema,
  updateCourseSchema,
} from "../validation/course.validation.js";

const router = express.Router();

const uploadCourseImage = UploadMiddleware(["jpg", "png", "webp"], 3).single("image");

// ---------- Public routes ----------
router.get("/", courseController.getAllCourses);
router.get("/slug/:slug", courseController.getCourseBySlug);
router.get("/:id", courseController.getCourseById);

// ---------- Admin-only routes ----------
router.post(
  "/",
  authorize,
  authorizeRole("admin"),
  uploadCourseImage,
  validate(createCourseSchema),
  courseController.createCourse,
);
router.patch(
  "/:id",
  authorize,
  authorizeRole("admin"),
  uploadCourseImage,
  validate(updateCourseSchema),
  courseController.updateCourse,
);
router.delete(
  "/:id",
  authorize,
  authorizeRole("admin"),
  courseController.deleteCourse,
);

export default router;