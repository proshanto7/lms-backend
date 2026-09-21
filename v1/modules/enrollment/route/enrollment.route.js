import express from "express";
import * as enrollmentController from "../controller/enrollment.controller.js";
import { authorize } from "../../../middleware/authorize.js";
import { authorizeRole } from "../../../middleware/authorizeRole.js";
import { validate } from "../../../middleware/validate.middleware.js";
import { enrollStudentSchema } from "../validation/enrollment.validation.js";

const router = express.Router();

router.post(
  "/",
  authorize,
  authorizeRole("admin"),
  validate(enrollStudentSchema),
  enrollmentController.enrollStudent,
);
router.patch(
  "/:id/revoke",
  authorize,
  authorizeRole("admin"),
  enrollmentController.revokeEnrollment,
);
router.get(
  "/course/:courseId",
  authorize,
  authorizeRole("admin"),
  enrollmentController.getCourseEnrollments,
);
router.get(
  "/student/:studentId",
  authorize,
  authorizeRole("admin"),
  enrollmentController.getStudentEnrollments,
);
router.get("/my", authorize, enrollmentController.getMyEnrollments);

export default router;