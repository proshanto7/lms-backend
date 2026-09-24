import { asyncHandler } from "../../../utils/asyncHandler.js";
import { apiResponse } from "../../../utils/apiResponse.js";
import * as enrollmentRequestService from "../service/enrollmentRequest.service.js";

/**
 * @route   POST /api/v1/enrollment-requests
 * @access  Private (student)
 */
export const createRequest = asyncHandler(async (req, res) => {
  const { courseId, note } = req.body;

  const request = await enrollmentRequestService.createRequest({
    studentId: req.user.id,
    courseId,
    note,
  });

  return apiResponse(res, 201, "Enrollment request submitted successfully", { request });
});

/**
 * @route   DELETE /api/v1/enrollment-requests/:id
 * @access  Private (student)
 */
export const cancelRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await enrollmentRequestService.cancelRequest(id, req.user.id);

  return apiResponse(res, 200, "Enrollment request cancelled successfully", { request });
});

/**
 * @route   GET /api/v1/enrollment-requests/my
 * @access  Private (student)
 */
export const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await enrollmentRequestService.getMyRequests(req.user.id);

  return apiResponse(res, 200, "Your enrollment requests fetched successfully", { requests });
});

/**
 * @route   GET /api/v1/enrollment-requests?status=pending
 * @access  Private (admin)
 */
export const getAllRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const requests = await enrollmentRequestService.getAllRequests({ status });

  return apiResponse(res, 200, "Enrollment requests fetched successfully", { requests });
});

/**
 * @route   PATCH /api/v1/enrollment-requests/:id/approve
 * @access  Private (admin)
 */
export const approveRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { request, enrollment } = await enrollmentRequestService.approveRequest(
    id,
    req.user.id,
  );

  return apiResponse(res, 200, "Enrollment request approved successfully", {
    request,
    enrollment,
  });
});

/**
 * @route   PATCH /api/v1/enrollment-requests/:id/reject
 * @access  Private (admin)
 */
export const rejectRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const request = await enrollmentRequestService.rejectRequest(id, req.user.id, reason);

  return apiResponse(res, 200, "Enrollment request rejected successfully", { request });
});
