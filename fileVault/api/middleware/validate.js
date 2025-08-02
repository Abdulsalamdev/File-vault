const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const value = req[source];
    const { error, value: sanitized } = schema.validate(value, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((e) => e.message),
      });
    }
    req[source] = sanitized; // sanitize input
    next();
  };
};

module.exports = {validate}
