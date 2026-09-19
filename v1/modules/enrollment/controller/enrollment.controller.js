import { asyncHandler } from "../../../utils/asyncHandler.js";
import { apiResponse } from "../../../utils/apiResponse.js";
import * as enrollmentService from "../service/enrollment.service.js";

/**
 * @route   POST /api/v1/enrollments
 * @access  Private (admin)
 */
export const enrollStudent = asyncHandler(async (req, res) => {
  const { studentId, courseId } = req.body;

  const enrollment = await enrollmentService.enrollStudent({
    studentId,
    courseId,
    adminId: req.user.id,
  });

  return apiResponse(res, 201, "Student enrolled successfully", { enrollment });
});

/**
 * @route   PATCH /api/v1/enrollments/:id/revoke
 * @access  Private (admin)
 */
export const revokeEnrollment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const enrollment = await enrollmentService.revokeEnrollment(id);

  return apiResponse(res, 200, "Enrollment revoked successfully", { enrollment });
});

/**
 * @route   GET /api/v1/enrollments/course/:courseId
 * @access  Private (admin)
 */
export const getCourseEnrollments = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const enrollments = await enrollmentService.getCourseEnrollments(courseId);

  return apiResponse(res, 200, "Enrollments fetched successfully", { enrollments });
});

/**
 * @route   GET /api/v1/enrollments/my
 * @access  Private (student)
 */
export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.getMyEnrollments(req.user.id);

  return apiResponse(res, 200, "Your enrollments fetched successfully", { enrollments });
});