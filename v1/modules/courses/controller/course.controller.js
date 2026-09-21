import { asyncHandler } from "../../../utils/asyncHandler.js";
import { apiResponse } from "../../../utils/apiResponse.js";
import AppError from "../../../utils/Apperror.js";
import * as courseService from "../service/course.service.js";
import { uploadBufferToCloudinary } from "../../../utils/cloudinaryUpload.js";

/**
 * @route   POST /api/v1/courses
 * @access  Private (authorize + authorizeRole('admin'))
 */
export const createCourse = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Course image is required", 400);
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, "courses");

  const payload = {
    ...req.body,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  };

  const course = await courseService.createCourse(payload);

  return apiResponse(res, 201, "Course created successfully", { course });
});

/**
 * @route   GET /api/v1/courses
 * @access  Public
 */
export const getAllCourses = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    search,
    category,
    level,
    isFree,
    isPublished,
    minPrice,
    maxPrice,
  } = req.query;

  const result = await courseService.getAllCourses({
    page,
    limit,
    search,
    category,
    level,
    isFree,
    isPublished,
    minPrice,
    maxPrice,
  });

  return apiResponse(res, 200, "Courses fetched successfully", result);
});

/**
 * @route   GET /api/v1/courses/:id
 * @access  Public
 */
export const getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await courseService.getCourseById(id);

  return apiResponse(res, 200, "Course fetched successfully", { course });
});

/**
 * @route   GET /api/v1/courses/slug/:slug
 * @access  Public
 */
export const getCourseBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const course = await courseService.getCourseBySlug(slug);

  return apiResponse(res, 200, "Course fetched successfully", { course });
});

/**
 * @route   PATCH /api/v1/courses/:id
 * @access  Private (authorize + authorizeRole('admin'))
 */
export const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const hasBodyFields = Object.keys(req.body).length > 0;
  if (!hasBodyFields && !req.file) {
    throw new AppError("At least one field or an image is required to update", 400);
  }

  const updates = { ...req.body };

  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, "courses");
    updates.image = {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  const course = await courseService.updateCourse(id, updates);

  return apiResponse(res, 200, "Course updated successfully", { course });
});

/**
 * @route   DELETE /api/v1/courses/:id
 * @access  Private (authorize + authorizeRole('admin'))
 */
export const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await courseService.deleteCourse(id);

  return apiResponse(res, 200, "Course deleted successfully", null);
});