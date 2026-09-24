import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const objectId = Joi.string().pattern(objectIdPattern).messages({
  "string.pattern.base": "Invalid ID format",
});

export const createEnrollmentRequestSchema = Joi.object({
  courseId: objectId.required().messages({ "any.required": "Course ID is required" }),
  note: Joi.string().trim().max(500).allow("").optional(),
});

export const rejectEnrollmentRequestSchema = Joi.object({
  reason: Joi.string().trim().max(500).allow("").optional(),
});
