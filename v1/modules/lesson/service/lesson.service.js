import Lesson from "../model/lesson.model.js";
import Course from "../../courses/model/courses.model.js";
import AppError from "../../../utils/Apperror.js";
import { deleteFromCloudinary } from "../../../utils/cloudinaryUpload.js";
import { hasActiveAccess } from "../../enrollment/service/enrollment.service.js";

/**
 * Create a lesson under a course
 */
export const createLesson = async ({ course, title, description, video, order, isPreview }) => {
  const courseDoc = await Course.findById(course);
  if (!courseDoc) {
    await deleteFromCloudinary(video?.publicId, "video");
    throw new AppError("Course not found", 404);
  }

  const lesson = await Lesson.create({ course, title, description, video, order, isPreview });

  await Course.findByIdAndUpdate(course, { $inc: { totalLectures: 1 } });

  return lesson;
};

/**
 * Get all lessons for a course, filtered by whether the requester has access.
 * user: { id, role } | null (public/unauthenticated)
 */
export const getLessonsForCourse = async (courseId, user) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const isOwnerOrAdmin =
    user && (user.role === "admin" || String(course.instructor) === String(user.id));

  let hasAccess = isOwnerOrAdmin;
  if (!hasAccess && user && user.role === "student") {
    hasAccess = await hasActiveAccess(user.id, courseId);
  }

  const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });

  // strip video url for lessons the user can't access
  return lessons.map((lesson) => {
    const canWatch = hasAccess || lesson.isPreview;
    return {
      _id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      order: lesson.order,
      isPreview: lesson.isPreview,
      duration: lesson.video?.duration || 0,
      video: canWatch ? lesson.video : null,
      locked: !canWatch,
    };
  });
};

/**
 * Get a single lesson — throws 403 if the user has no access
 */
export const getLessonById = async (lessonId, user) => {
  const lesson = await Lesson.findById(lessonId).populate("course", "instructor");
  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  const isOwnerOrAdmin =
    user && (user.role === "admin" || String(lesson.course.instructor) === String(user.id));

  let hasAccess = isOwnerOrAdmin || lesson.isPreview;
  if (!hasAccess && user && user.role === "student") {
    hasAccess = await hasActiveAccess(user.id, lesson.course._id);
  }

  if (!hasAccess) {
    throw new AppError("You do not have access to this lesson. Please enroll first.", 403);
  }

  return lesson;
};

/**
 * Update a lesson
 */
export const updateLesson = async (lessonId, updates) => {
  const allowedFields = ["title", "description", "order", "isPreview", "video"];
  const filteredUpdates = {};

  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  const existingLesson = await Lesson.findById(lessonId);
  if (!existingLesson) {
    await deleteFromCloudinary(filteredUpdates.video?.publicId, "video");
    throw new AppError("Lesson not found", 404);
  }

  if (filteredUpdates.video && existingLesson.video?.publicId) {
    await deleteFromCloudinary(existingLesson.video.publicId, "video");
  }

  const lesson = await Lesson.findByIdAndUpdate(lessonId, filteredUpdates, {
    new: true,
    runValidators: true,
  });

  return lesson;
};

/**
 * Delete a lesson
 */
export const deleteLesson = async (lessonId) => {
  const lesson = await Lesson.findByIdAndDelete(lessonId);
  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  await deleteFromCloudinary(lesson.video?.publicId, "video");
  await Course.findByIdAndUpdate(lesson.course, { $inc: { totalLectures: -1 } });

  return lesson;
};