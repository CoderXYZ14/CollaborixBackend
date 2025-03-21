const asyncHandler = (fn) => async (req, res, next) => {
  try {
    return await fn(req, res, next);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "An unexpected error occurred",
      errors: err.errors || [],
    });
  }
};

export { asyncHandler };
