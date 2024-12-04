import Joi from "joi";

const rewardValidationSchema = (rewardSchema) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    rewardImageUrl: Joi.string().required(),
  });

  return schema.validate(rewardSchema);
};

export default rewardValidationSchema;
