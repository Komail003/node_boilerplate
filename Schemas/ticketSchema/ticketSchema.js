import Joi from "joi";
import mongoose from "mongoose";

// Inside ticketValidationSchema
const ticketValidationSchema = (ticketData) => {
  const schema = Joi.object({
    correctAnswer: Joi.boolean().required(),
    user_FK: Joi.string().custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "User ObjectId validation").required(),
    reward_FK: Joi.string().custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "Reward ObjectId validation").required(),
    quantity: Joi.number().required(),  
    createdAt: Joi.date().default(() => new Date()), // Fixed: Removed 'current timestamp' string
  });

  return schema.validate(ticketData, { abortEarly: false }); // Added abortEarly: false to show all validation errors
};

export default ticketValidationSchema;
