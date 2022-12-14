const Joi = require("joi");

const schemaPost = Joi.object().keys({
  name: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email({ tlds: false }).required(),
  phone: Joi.number().integer().required(),
});

const schemaPut = Joi.object().keys({
  name: Joi.string().alphanum().min(3).max(30),
  email: Joi.string().email({ tlds: false }),
  phone: Joi.number().integer(),
});

const schemaFavorite = Joi.object().keys({
  favorite: Joi.boolean(),
});
const schemaSubscritpion = Joi.object().keys({
  subscription: ("starter", "pro", "business"),
});

const schemaPageAndLimitAndFavorite = Joi.object().keys({
  page: Joi.number().integer(),
  limit: Joi.number().integer(),
  favorite: Joi.boolean(),
});

const schemaRegistration = Joi.object().keys({
  email: Joi.string().email({ tlds: false }),
  password: Joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/),
});

const schemaEmail = Joi.object().keys({
  email: Joi.string().email({ tlds: false }),
});

module.exports = {
  schemaPost,
  schemaPut,
  schemaFavorite,
  schemaRegistration,
  schemaSubscritpion,
  schemaPageAndLimitAndFavorite,
  schemaEmail,
};
