import Enrollment from "../model/enrollment.model.js";
import Course from "../../courses/model/courses.model.js";
import User from "../../auth/model/user.model.js";
import AppError from "../../../utils/appError.js";

/**
 * Admin: enroll a student in a course
 */
export const enrollStudent = async ({ studentId, courseId, adminId }) => {
  const student = await User.findById(studentId);
  if (!student) {
    throw new AppError("Student not found", 404);
  }
  if (student.role !== "student") {
    throw new AppError("Only users with role 'student' can be enrolled", 400);
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const existing = await Enrollment.findOne({ student: studentId, course: courseId });
  if (existing) {
    if (existing.status === "active") {
      throw new AppError("Student is already enrolled in this course", 409);
    }
    // re-activate a previously revoked enrollment
    existing.status = "active";
    existing.enrolledBy = adminId;
    await existing.save();
    return existing;
  }

  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    enrolledBy: adminId,
  });

  // increment course.students count
  await Course.findByIdAndUpdate(courseId, { $inc: { students: 1 } });

  return enrollment;
};

/**
 * Admin: revoke a student's access without deleting the record
 */
export const revokeEnrollment = async (enrollmentId) => {
  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) {
    throw new AppError("Enrollment not found", 404);
  }

  if (enrollment.status === "active") {
    await Course.findByIdAndUpdate(enrollment.course, { $inc: { students: -1 } });
  }

  enrollment.status = "revoked";
  await enrollment.save();

  return enrollment;
};

/**
 * Get all enrollments for a course (admin view)
 */
export const getCourseEnrollments = async (courseId) => {
  const enrollments = await Enrollment.find({ course: courseId, status: "active" }).populate(
    "student",
    "name email avatar"
  );
  return enrollments;
};

/**
 * Get logged-in student's own enrollments
 */
export const getMyEnrollments = async (studentId) => {
  const enrollments = await Enrollment.find({ student: studentId, status: "active" }).populate(
    "course",
    "title slug image price level"
  );
  return enrollments;
};

/**
 * Internal: check if a student has active access to a course
 */
export const hasActiveAccess = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: "active",
  });
  return Boolean(enrollment);
};