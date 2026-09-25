import Category from "../model/category.model.js";
import Course from "../../courses/model/courses.model.js";
import AppError from "../../../utils/Apperror.js";
import { deleteFromCloudinary } from "../../../utils/cloudinaryUpload.js";

const buildSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Internal: attach live course count to a list of categories
 */
const attachCourseCounts = async (categories) => {
  const counts = await Course.aggregate([
    { $match: { category: { $in: categories.map((c) => c._id) } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const countMap = counts.reduce((acc, item) => {
    acc[item._id.toString()] = item.count;
    return acc;
  }, {});

  return categories.map((category) => ({
    ...category.toObject(),
    courseCount: countMap[category._id.toString()] || 0,
  }));
};

/**
 * Create a new category (icon = { url, publicId } from Cloudinary, set by controller)
 */
export const createCategory = async ({ name, description, icon, color }) => {
  const existing = await Category.findOne({ name });
  if (existing) {
    await deleteFromCloudinary(icon?.publicId); // rollback uploaded image
    throw new AppError("Category with this name already exists", 409);
  }

  const category = await Category.create({ name, description, icon, color });
  return category;
};

export const getAllCategories = async ({ page = 1, limit = 50, search }) => {
  const filter = {};
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    Category.find(filter).skip(skip).limit(Number(limit)).sort({ name: 1 }),
    Category.countDocuments(filter),
  ]);

  const categoriesWithCount = await attachCourseCounts(categories);

  return {
    categories: categoriesWithCount,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    },
  };
};

export const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const courseCount = await Course.countDocuments({ category: category._id });

  return { ...category.toObject(), courseCount };
};

export const getCategoryBySlug = async (slug) => {
  const category = await Category.findOne({ slug });
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const courseCount = await Course.countDocuments({ category: category._id });

  return { ...category.toObject(), courseCount };
};

/**
 * Update category — replaces old Cloudinary icon if a new one is uploaded
 */
export const updateCategory = async (categoryId, updates) => {
  const allowedFields = ["name", "description", "icon", "color", "slug"];
  const filteredUpdates = {};

  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  if (filteredUpdates.name && !filteredUpdates.slug) {
    filteredUpdates.slug = buildSlug(filteredUpdates.name);
  }

  if (filteredUpdates.name) {
    const duplicate = await Category.findOne({
      name: filteredUpdates.name,
      _id: { $ne: categoryId },
    });
    if (duplicate) {
      await deleteFromCloudinary(filteredUpdates.icon?.publicId);
      throw new AppError("Category with this name already exists", 409);
    }
  }

  const existingCategory = await Category.findById(categoryId);
  if (!existingCategory) {
    await deleteFromCloudinary(filteredUpdates.icon?.publicId);
    throw new AppError("Category not found", 404);
  }

  if (filteredUpdates.icon && existingCategory.icon?.publicId) {
    await deleteFromCloudinary(existingCategory.icon.publicId);
  }

  const category = await Category.findByIdAndUpdate(categoryId, filteredUpdates, {
    new: true,
    runValidators: true,
  });

  return category;
};
/**
 * Delete category — blocked unless force=true if courses are linked;
 * with force=true, cascade deletes all linked courses too
 */
export const deleteCategory = async (categoryId, force = false) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const linkedCourses = await Course.find({ category: categoryId });

  if (linkedCourses.length > 0 && !force) {
    throw new AppError(
      `Cannot delete category: ${linkedCourses.length} course(s) still linked to it. Pass force=true to delete them as well.`,
      409
    );
  }

  if (linkedCourses.length > 0) {
    // proti course er cloudinary image delete kora
    await Promise.all(
      linkedCourses.map((course) => deleteFromCloudinary(course.image?.publicId))
    );

    // sob course delete kora
    await Course.deleteMany({ category: categoryId });
  }

  // category ta delete kora
  await Category.findByIdAndDelete(categoryId);

  // category er icon o cloudinary theke delete kora
  await deleteFromCloudinary(category.icon?.publicId);

  return category;
};