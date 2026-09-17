import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const objectId = Joi.string().pattern(objectIdPattern).messages({
  "string.pattern.base": "Invalid ID format",
});

export const createCourseSchema = Joi.object({
  title: Joi.string().trim().max(150).required().messages({
    "string.empty": "Title is required",
    "any.required": "Title is required",
  }),
  description: Joi.string().trim().required().messages({
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),
  category: objectId.required().messages({
    "any.required": "Category is required",
  }),
  instructor: objectId.required().messages({
    "any.required": "Instructor is required",
  }),
  level: Joi.string().valid("beginner", "intermediate", "advanced").optional(),
  language: Joi.string().trim().optional(),
  price: Joi.number().min(0).required().messages({
    "any.required": "Price is required",
    "number.min": "Price cannot be negative",
  }),
  discountPrice: Joi.number().min(0).optional().allow(null),
  isFree: Joi.boolean().optional(),
  totalDuration: Joi.number().min(0).optional(),
  totalLectures: Joi.number().min(0).optional(),
  requirements: Joi.array().items(Joi.string().trim()).optional(),
  whatYouWillLearn: Joi.array().items(Joi.string().trim()).optional(),
  isPublished: Joi.boolean().optional(),
});

export const updateCourseSchema = Joi.object({
  title: Joi.string().trim().max(150),
  slug: Joi.string().trim().lowercase(),
  description: Joi.string().trim(),
  category: objectId,
  instructor: objectId,
  level: Joi.string().valid("beginner", "intermediate", "advanced"),
  language: Joi.string().trim(),
  price: Joi.number().min(0),
  discountPrice: Joi.number().min(0).allow(null),
  isFree: Joi.boolean(),
  totalDuration: Joi.number().min(0),
  totalLectures: Joi.number().min(0),
  requirements: Joi.array().items(Joi.string().trim()),
  whatYouWillLearn: Joi.array().items(Joi.string().trim()),
  isPublished: Joi.boolean(),
});