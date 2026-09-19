import express from "express";
import * as dashboardController from "../controller/dashboard.controller.js";
import { authorize } from "../../../middleware/authorize.js";
import { authorizeRole } from "../../../middleware/authorizeRole.js";

const router = express.Router();

router.get(
  "/summary",
  authorize,
  authorizeRole("admin"),
  dashboardController.getDashboardSummary,
);

export default router;