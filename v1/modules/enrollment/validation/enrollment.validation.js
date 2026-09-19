import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const objectId = Joi.string().pattern(objectIdPattern).messages({
  "string.pattern.base": "Invalid ID format",
});

export const enrollStudentSchema = Joi.object({
  studentId: objectId.required().messages({ "any.required": "Student ID is required" }),
  courseId: objectId.required().messages({ "any.required": "Course ID is required" }),
});