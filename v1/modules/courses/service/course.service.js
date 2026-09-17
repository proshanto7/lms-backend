import mongoose from "mongoose";
import Course from "../model/courses.model.js";
import Category from "../../categories/model/category.model.js";
import User from "../../auth/model/user.model.js";                                  
import AppError from "../../../utils/appError.js";
import { deleteFromCloudinary } from "../../../utils/cloudinaryUpload.js";

const buildSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Internal: validate category exists
 */
const assertCategoryExists = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  return category;
};

/**
 * Internal: validate instructor exists and has mentor/admin role
 */
const assertValidInstructor = async (instructorId) => {
  const instructor = await User.findById(instructorId);
  if (!instructor) {
    throw new AppError("Instructor not found", 404);
  }
  if (!["mentor", "admin"].includes(instructor.role)) {
    throw new AppError("Selected user is not authorized to be an instructor", 400);
  }
  return instructor;
};

/**
 * Create a new course
 */
export const createCourse = async (payload) => {
  const { category, instructor, image } = payload;

  await assertCategoryExists(category);
  await assertValidInstructor(instructor);

  const existing = await Course.findOne({ title: payload.title });
  if (existing) {
    await deleteFromCloudinary(image?.publicId);
    throw new AppError("A course with this title already exists", 409);
  }

  const course = await Course.create(payload);
  return course.populate([
    { path: "category", select: "name slug color icon" },
    { path: "instructor", select: "name email avatar role" },
  ]);
};

/**
 * Get all courses — with filters, search, pagination
 */
export const getAllCourses = async ({
  page = 1,
  limit = 20,
  search,
  category,
  level,
  isFree,
  isPublished,
  minPrice,
  maxPrice,
}) => {
  const filter = {};

  if (search) filter.title = { $regex: search, $options: "i" };
  if (category) filter.category = category;
  if (level) filter.level = level;
  if (isFree !== undefined) filter.isFree = isFree === "true" || isFree === true;
  if (isPublished !== undefined) filter.isPublished = isPublished === "true" || isPublished === true;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("category", "name slug color icon")
      .populate("instructor", "name email avatar role")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Course.countDocuments(filter),
  ]);

  return {
    courses,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single course by id
 */
export const getCourseById = async (courseId) => {
  const course = await Course.findById(courseId)
    .populate("category", "name slug color icon")
    .populate("instructor", "name email avatar role");

  if (!course) {
    throw new AppError("Course not found", 404);
  }
  return course;
};

/**
 * Get single course by slug
 */
export const getCourseBySlug = async (slug) => {
  const course = await Course.findOne({ slug })
    .populate("category", "name slug color icon")
    .populate("instructor", "name email avatar role");

  if (!course) {
    throw new AppError("Course not found", 404);
  }
  return course;
};

/**
 * Update course
 */
export const updateCourse = async (courseId, updates) => {
  const allowedFields = [
    "title",
    "slug",
    "description",
    "category",
    "instructor",
    "level",
    "language",
    "price",
    "discountPrice",
    "isFree",
    "totalDuration",
    "totalLectures",
    "requirements",
    "whatYouWillLearn",
    "isPublished",
    "image",
  ];

  const filteredUpdates = {};
  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  const existingCourse = await Course.findById(courseId);
  if (!existingCourse) {
    await deleteFromCloudinary(filteredUpdates.image?.publicId);
    throw new AppError("Course not found", 404);
  }

  if (filteredUpdates.category) {
    await assertCategoryExists(filteredUpdates.category);
  }

  if (filteredUpdates.instructor) {
    await assertValidInstructor(filteredUpdates.instructor);
  }

  if (filteredUpdates.title && !filteredUpdates.slug) {
    filteredUpdates.slug = buildSlug(filteredUpdates.title);
  }

  if (filteredUpdates.title) {
    const duplicate = await Course.findOne({
      title: filteredUpdates.title,
      _id: { $ne: courseId },
    });
    if (duplicate) {
      await deleteFromCloudinary(filteredUpdates.image?.publicId);
      throw new AppError("A course with this title already exists", 409);
    }
  }

  // replace old Cloudinary image if a new one uploaded
  if (filteredUpdates.image && existingCourse.image?.publicId) {
    await deleteFromCloudinary(existingCourse.image.publicId);
  }

  const course = await Course.findByIdAndUpdate(courseId, filteredUpdates, {
    new: true,
    runValidators: true,
  })
    .populate("category", "name slug color icon")
    .populate("instructor", "name email avatar role");

  return course;
};

/**
 * Delete course
 */
export const deleteCourse = async (courseId) => {
  const course = await Course.findByIdAndDelete(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  await deleteFromCloudinary(course.image?.publicId);

  return course;
};