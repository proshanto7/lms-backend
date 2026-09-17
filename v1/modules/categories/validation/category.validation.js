import Joi from "joi";

const hexColorPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().max(100).required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
  description: Joi.string().trim().allow("").optional(),
  color: Joi.string().pattern(hexColorPattern).optional().messages({
    "string.pattern.base": "Color must be a valid hex code, e.g. #7c6fe8",
  }),
  // icon intentionally excluded — comes from req.file via multer, not req.body
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().max(100),
  slug: Joi.string().trim().lowercase(),
  description: Joi.string().trim().allow(""),
  color: Joi.string().pattern(hexColorPattern).messages({
    "string.pattern.base": "Color must be a valid hex code, e.g. #7c6fe8",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required to update",
  });