import Joi from "joi";

const formValidationSchema = (formData) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    age: Joi.number().min(18).required(),
  });

  return schema.validate(formData);
};

export default formValidationSchema;