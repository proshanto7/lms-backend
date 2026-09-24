import EnrollmentRequest from "../model/enrollmentRequest.model.js";
import Course from "../../courses/model/courses.model.js";
import AppError from "../../../utils/Apperror.js";
import * as enrollmentService from "../../enrollment/service/enrollment.service.js";

/**
 * Student: request enrollment in a course
 */
export const createRequest = async ({ studentId, courseId, note }) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const alreadyEnrolled = await enrollmentService.hasActiveAccess(studentId, courseId);
  if (alreadyEnrolled) {
    throw new AppError("You are already enrolled in this course", 409);
  }

  const existingPending = await EnrollmentRequest.findOne({
    student: studentId,
    course: courseId,
    status: "pending",
  });
  if (existingPending) {
    throw new AppError("You already have a pending request for this course", 409);
  }

  const request = await EnrollmentRequest.create({
    student: studentId,
    course: courseId,
    note: note || "",
  });

  return request;
};

/**
 * Student: cancel their own pending request
 */
export const cancelRequest = async (requestId, studentId) => {
  const request = await EnrollmentRequest.findOne({ _id: requestId, student: studentId });
  if (!request) {
    throw new AppError("Enrollment request not found", 404);
  }
  if (request.status !== "pending") {
    throw new AppError("Only pending requests can be cancelled", 400);
  }

  await request.deleteOne();
  return request;
};

/**
 * Student: get their own requests
 */
export const getMyRequests = async (studentId) => {
  const requests = await EnrollmentRequest.find({ student: studentId })
    .populate("course", "title slug image price isFree level")
    .sort({ createdAt: -1 });

  return requests;
};

/**
 * Admin (dashboard): list requests, optionally filtered by status.
 * Defaults to "pending" since that's what the dashboard needs to action.
 */
export const getAllRequests = async ({ status } = {}) => {
  const filter = status ? { status } : {};

  const requests = await EnrollmentRequest.find(filter)
    .populate("student", "name email avatar")
    .populate("course", "title slug image price isFree")
    .populate("reviewedBy", "name")
    .sort({ createdAt: -1 });

  return requests;
};

/**
 * Admin (dashboard): count of pending requests — for a badge/stat card
 */
export const getPendingCount = async () => {
  return EnrollmentRequest.countDocuments({ status: "pending" });
};

/**
 * Admin: approve a request -> actually enrolls the student via the
 * enrollment module, then marks the request approved.
 */
export const approveRequest = async (requestId, adminId) => {
  const request = await EnrollmentRequest.findById(requestId);
  if (!request) {
    throw new AppError("Enrollment request not found", 404);
  }
  if (request.status !== "pending") {
    throw new AppError("Only pending requests can be approved", 400);
  }

  const enrollment = await enrollmentService.enrollStudent({
    studentId: request.student,
    courseId: request.course,
    adminId,
  });

  request.status = "approved";
  request.reviewedBy = adminId;
  request.reviewedAt = new Date();
  await request.save();

  return { request, enrollment };
};

/**
 * Admin: reject a request
 */
export const rejectRequest = async (requestId, adminId, reason) => {
  const request = await EnrollmentRequest.findById(requestId);
  if (!request) {
    throw new AppError("Enrollment request not found", 404);
  }
  if (request.status !== "pending") {
    throw new AppError("Only pending requests can be rejected", 400);
  }

  request.status = "rejected";
  request.reviewedBy = adminId;
  request.reviewNote = reason || "";
  request.reviewedAt = new Date();
  await request.save();

  return request;
};
