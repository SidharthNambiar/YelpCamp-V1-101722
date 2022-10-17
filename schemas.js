const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)



  // not a mongoose schema, this will validate the data before it even hits Mongoose validation
  module.exports.campgroundSchema  = Joi.object({
    campground: Joi.object({
      title: Joi.string().trim().min(1).required().escapeHTML(),
      price: Joi.number().min(0).required(),
      description: Joi.string().trim().min(1).required().escapeHTML(),
      location: Joi.string().trim().min(1).required().escapeHTML(),
      // image: Joi.string().trim().min(1).required(),
      
    }).required(),
    deleteImages: Joi.array()
  });

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().trim().min(1).required().escapeHTML()
  }).required()
})