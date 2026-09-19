import { asyncHandler } from "../../../utils/asyncHandler.js";
import { apiResponse } from "../../../utils/apiResponse.js";
import AppError from "../../../utils/appError.js";
import * as lessonService from "../service/lesson.service.js";
import { uploadBufferToCloudinary } from "../../../utils/cloudinaryUpload.js";

/**
 * @route   POST /api/v1/lessons
 * @access  Private (admin)
 */
export const createLesson = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Lesson video is required", 400);
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, "lessons", "video");

  const lesson = await lessonService.createLesson({
    ...req.body,
    video: {
      url: result.secure_url,
      publicId: result.public_id,
      duration: Math.round(result.duration || 0),
    },
  });

  return apiResponse(res, 201, "Lesson created successfully", { lesson });
});

/**
 * @route   GET /api/v1/lessons/course/:courseId
 * @access  Public (video hidden unless access)
 */
export const getLessonsForCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // req.user is set only if a valid token was sent — optionalAuthorize middleware needed
  const user = req.user ? { id: req.user.id, role: req.user.safeData?.role } : null;

  const lessons = await lessonService.getLessonsForCourse(courseId, user);

  return apiResponse(res, 200, "Lessons fetched successfully", { lessons });
});

/**
 * @route   GET /api/v1/lessons/:id
 * @access  Private (checks enrollment inside service)
 */
export const getLessonById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = { id: req.user.id, role: req.user.safeData?.role };

  const lesson = await lessonService.getLessonById(id, user);

  return apiResponse(res, 200, "Lesson fetched successfully", { lesson });
});

/**
 * @route   PATCH /api/v1/lessons/:id
 * @access  Private (admin)
 */
export const updateLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updates = { ...req.body };

  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, "lessons", "video");
    updates.video = {
      url: result.secure_url,
      publicId: result.public_id,
      duration: Math.round(result.duration || 0),
    };
  }

  const lesson = await lessonService.updateLesson(id, updates);

  return apiResponse(res, 200, "Lesson updated successfully", { lesson });
});

/**
 * @route   DELETE /api/v1/lessons/:id
 * @access  Private (admin)
 */
export const deleteLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await lessonService.deleteLesson(id);

  return apiResponse(res, 200, "Lesson deleted successfully", null);
});