import { Schema } from "zod/v3";


const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formatted = result.error.format();

      const flatErrors = Object.values(formatted)
        .flat()
        .filter(Boolean)
        .map((err) => err._errors)
        .flat();

      const error = new Error(flatErrors.join(", "));
      error.statusCode = 400;

      return next(error);   // 🚨 THIS is the key line
    }

    req.body = result.data;
    next();
  };
};

export { validateRequest };