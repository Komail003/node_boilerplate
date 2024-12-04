import Joi from "joi";

const ticketValidationSchema = (ticketSchema) => {
  const schema = Joi.object({
    price: Joi.number().required(),
    createdAt: Joi.date().default(() => new Date(), "current timestamp"),
  });

  return schema.validate(ticketSchema);
};

export default ticketValidationSchema;
