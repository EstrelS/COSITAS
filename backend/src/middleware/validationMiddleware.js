const Joi = require('joi');

const validateBody = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
        const messages = error.details.map(d => d.message);
        return res.status(400).json({ success: false, errors: messages });
        }
        
        req.validatedBody = value;
        next();
    };
};

module.exports = { validateBody };
