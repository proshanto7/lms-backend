import { asyncHandler } from "../../../utils/asyncHandler.js";
import { apiResponse } from "../../../utils/apiResponse.js";
import AppError from "../../../utils/Apperror.js";
import * as categoryService from "../service/category.service.js";
import { uploadBufferToCloudinary } from "../../../utils/cloudinaryUpload.js";

/**
 * @route   POST /api/v1/categories
 * @access  Private (authorize + authorizeRole('admin'))
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, color } = req.body;

  if (!req.file) {
    throw new AppError("Category icon image is required", 400);
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, "categories");

  const icon = {
    url: result.secure_url,
    publicId: result.public_id,
  };

  const category = await categoryService.createCategory({ name, description, icon, color });

  return apiResponse(res, 201, "Category created successfully", { category });
});

/**
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getAllCategories = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;

  const result = await categoryService.getAllCategories({ page, limit, search });

  return apiResponse(res, 200, "Categories fetched successfully", result);
});

/**
 * @route   GET /api/v1/categories/:id
 * @access  Public
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await categoryService.getCategoryById(id);

  return apiResponse(res, 200, "Category fetched successfully", { category });
});

/**
 * @route   GET /api/v1/categories/slug/:slug
 * @access  Public
 */
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await categoryService.getCategoryBySlug(slug);

  return apiResponse(res, 200, "Category fetched successfully", { category });
});

/**
 * @route   PATCH /api/v1/categories/:id
 * @access  Private (authorize + authorizeRole('admin'))
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const hasBodyFields = Object.keys(req.body).length > 0;

  if (!hasBodyFields && !req.file) {
    throw new AppError("At least one field or an image is required to update", 400);
  }

  const updates = { ...req.body };

  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, "categories");
    updates.icon = {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  const category = await categoryService.updateCategory(id, updates);

  return apiResponse(res, 200, "Category updated successfully", { category });
});

/**
 * @route   DELETE /api/v1/categories/:id
 * @access  Private (authorize + authorizeRole('admin'))
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const force = req.query.force === "true";

  await categoryService.deleteCategory(id, force);

  return apiResponse(res, 200, "Category deleted successfully", null);
});