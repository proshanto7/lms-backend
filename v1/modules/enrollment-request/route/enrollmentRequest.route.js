import express from "express";
import * as enrollmentRequestController from "../controller/enrollmentRequest.controller.js";
import { authorize } from "../../../middleware/authorize.js";
import { authorizeRole } from "../../../middleware/authorizeRole.js";
import { validate } from "../../../middleware/validate.middleware.js";
import {
  createEnrollmentRequestSchema,
  rejectEnrollmentRequestSchema,
} from "../validation/enrollmentRequest.validation.js";

const router = express.Router();

// student
router.post(
  "/",
  authorize,
  authorizeRole("student"),
  validate(createEnrollmentRequestSchema),
  enrollmentRequestController.createRequest,
);
router.get("/my", authorize, authorizeRole("student"), enrollmentRequestController.getMyRequests);
router.delete(
  "/:id",
  authorize,
  authorizeRole("student"),
  enrollmentRequestController.cancelRequest,
);

// admin (dashboard)
router.get("/", authorize, authorizeRole("admin"), enrollmentRequestController.getAllRequests);
router.patch(
  "/:id/approve",
  authorize,
  authorizeRole("admin"),
  enrollmentRequestController.approveRequest,
);
router.patch(
  "/:id/reject",
  authorize,
  authorizeRole("admin"),
  validate(rejectEnrollmentRequestSchema),
  enrollmentRequestController.rejectRequest,
);

export default router;
