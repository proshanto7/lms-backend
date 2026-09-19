import { asyncHandler } from "../../../utils/asyncHandler.js";
import { apiResponse } from "../../../utils/apiResponse.js";
import * as progressService from "../service/progress.service.js";

/**
 * @route   POST /api/v1/progress/complete
 * @access  Private (student)
 * body: { lessonId }
 */
export const markLessonComplete = asyncHandler(async (req, res) => {
  const { lessonId } = req.body;

  const progress = await progressService.markLessonComplete(req.user.id, lessonId);

  return apiResponse(res, 200, "Lesson marked as completed", { progress });
});

/**
 * @route   DELETE /api/v1/progress/:lessonId
 * @access  Private (student)
 */
export const markLessonIncomplete = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;

  await progressService.markLessonIncomplete(req.user.id, lessonId);

  return apiResponse(res, 200, "Lesson marked as incomplete", null);
});

/**
 * @route   GET /api/v1/progress/course/:courseId
 * @access  Private (student — own progress)
 */
export const getMyCourseProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const progress = await progressService.getCourseProgress(req.user.id, courseId);

  return apiResponse(res, 200, "Course progress fetched successfully", progress);
});

/**
 * @route   GET /api/v1/progress/my-overview
 * @access  Private (student)
 */
export const getMyOverallProgress = asyncHandler(async (req, res) => {
  const overview = await progressService.getMyOverallProgress(req.user.id);

  return apiResponse(res, 200, "Overall progress fetched successfully", { overview });
});

/**
 * @route   GET /api/v1/progress/course/:courseId/student/:studentId
 * @access  Private (admin)
 */
export const getStudentProgressForCourse = asyncHandler(async (req, res) => {
  const { courseId, studentId } = req.params;

  const progress = await progressService.getStudentProgressForCourse(studentId, courseId);

  return apiResponse(res, 200, "Student progress fetched successfully", progress);
});