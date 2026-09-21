import Progress from "../model/progress.model.js";
import Lesson from "../../lesson/model/lesson.model.js";
import Course from "../../courses/model/courses.model.js";
import AppError from "../../../utils/Apperror.js";
import { hasActiveAccess } from "../../enrollment/service/enrollment.service.js";

/**
 * Student marks a lesson as completed (idempotent — re-marking doesn't error)
 */
export const markLessonComplete = async (studentId, lessonId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  const isPreview = lesson.isPreview;
  const enrolled = await hasActiveAccess(studentId, lesson.course);

  if (!isPreview && !enrolled) {
    throw new AppError("You must be enrolled in this course to track progress", 403);
  }

  const progress = await Progress.findOneAndUpdate(
    { student: studentId, lesson: lessonId },
    { student: studentId, lesson: lessonId, course: lesson.course, completed: true, completedAt: new Date() },
    { new: true, upsert: true, runValidators: true },
  );

  return progress;
};

/**
 * Student unmarks a lesson (undo complete)
 */
export const markLessonIncomplete = async (studentId, lessonId) => {
  const progress = await Progress.findOneAndDelete({ student: studentId, lesson: lessonId });
  if (!progress) {
    throw new AppError("No progress record found for this lesson", 404);
  }
  return progress;
};

/**
 * Get a student's progress summary for a course: percentage + completed lesson ids
 */
export const getCourseProgress = async (studentId, courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const totalLessons = await Lesson.countDocuments({ course: courseId });

  const completedRecords = await Progress.find({
    student: studentId,
    course: courseId,
    completed: true,
  }).select("lesson completedAt");

  const completedCount = completedRecords.length;
  const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return {
    courseId,
    totalLessons,
    completedCount,
    percentage,
    completedLessons: completedRecords.map((r) => ({
      lessonId: r.lesson,
      completedAt: r.completedAt,
    })),
  };
};

/**
 * Admin: view a specific student's progress for a course
 */
export const getStudentProgressForCourse = async (studentId, courseId) => {
  return getCourseProgress(studentId, courseId);
};

/**
 * Student: overview of progress across all enrolled courses
 */
export const getMyOverallProgress = async (studentId) => {
  const distinctCourses = await Progress.distinct("course", { student: studentId });

  const results = await Promise.all(
    distinctCourses.map((courseId) => getCourseProgress(studentId, courseId)),
  );

  return results;
};