import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const objectId = Joi.string().pattern(objectIdPattern).messages({
  "string.pattern.base": "Invalid ID format",
});

export const markLessonCompleteSchema = Joi.object({
  lessonId: objectId.required().messages({
    "any.required": "Lesson ID is required",
  }),
});