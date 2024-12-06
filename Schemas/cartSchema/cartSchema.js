import Joi from "joi";
import mongoose from "mongoose";

const cartValidationSchema = (cartSchema) => {
  const schema = Joi.object({
    user_FK: Joi.string()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid", {
            message: "Invalid User ObjectId",
          });
        }
        return value;
      }, "User ObjectId validation")
      .required(),
    reward_FK: Joi.array()
      .items(
        Joi.string().custom((value, helpers) => {
          if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error("any.invalid", {
              message: "Invalid Reward ObjectId",
            });
          }
          return value;
        }, "Reward ObjectId validation")
      )
      .required(),
  });

  return schema.validate(cartSchema, { abortEarly: false });
};

export default cartValidationSchema;
