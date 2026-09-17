import express from "express";
import * as categoryController from "../controller/category.controller.js";
import { authorize } from "../../../middleware/authorize.js";
import { authorizeRole } from "../../../middleware/authorizeRole.js";
import { validate } from "../../../middleware/validate.middleware.js";
import UploadMiddleware from "../../../middleware/upload.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validation/category.validation.js";

const router = express.Router();

const uploadCategoryIcon = UploadMiddleware(["jpg", "png", "webp", "svg"], 2).single("icon");

// ---------- Public routes ----------
router.get("/", categoryController.getAllCategories);
router.get("/slug/:slug", categoryController.getCategoryBySlug);
router.get("/:id", categoryController.getCategoryById);

// ---------- Admin-only routes ----------
router.post(
  "/",
  authorize,
  authorizeRole("admin"),
  uploadCategoryIcon,
  validate(createCategorySchema),
  categoryController.createCategory,
);
router.patch(
  "/:id",
  authorize,
  authorizeRole("admin"),
  uploadCategoryIcon,
  validate(updateCategorySchema),
  categoryController.updateCategory,
);
router.delete(
  "/:id",
  authorize,
  authorizeRole("admin"),
  categoryController.deleteCategory,
);

export default router;