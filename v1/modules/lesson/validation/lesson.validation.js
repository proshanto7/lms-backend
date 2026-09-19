import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const objectId = Joi.string().pattern(objectIdPattern).messages({
  "string.pattern.base": "Invalid ID format",
});

export const createLessonSchema = Joi.object({
  course: objectId.required().messages({ "any.required": "Course is required" }),
  title: Joi.string().trim().required().messages({
    "string.empty": "Title is required",
    "any.required": "Title is required",
  }),
  description: Joi.string().trim().allow("").optional(),
  order: Joi.number().min(1).required().messages({
    "any.required": "Order is required",
  }),
  isPreview: Joi.boolean().optional(),
});

export const updateLessonSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().trim().allow(""),
  order: Joi.number().min(1),
  isPreview: Joi.boolean(),
});