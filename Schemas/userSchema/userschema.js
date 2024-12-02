import Joi from "joi";

const userValidationSchema = (userSchema) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    phoneNumber:Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().max(50).email().required(),
  });

  return schema.validate(userSchema);
};

export default userValidationSchema;