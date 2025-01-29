export const RESPONSE = {
  SUCCESS: {
    code: 200,
    message: "Everything worked as expected.",
  },
  REQUIRED: {
    code: 201,
    message: "is mandatory parameter.",
  },
  INVALID: {
    code: 202,
    message: "is invalid.",
  },
  ALRDY_EXIST: {
    code: 204,
    message: "already exist.",
  },
  NOT_FOUND: {
    code: 205,
    message: "not found.",
  },
  FILE_SIZE: {
    code: 205,
    message: "and file size cannot exceed 2MB",
  },
  SGERR: {
    code: 206,
    message: "",
  },
  NOT_EMPTY: {
    code: 207,
    message: "Image field should not be empty!",
  },
  MULTER_ERROR: {
    code: 208,
    message: "",
  },
  INVALID_TOKEN: {
    code: 400,
    message: "Invalid token",
  },
  ACCESS_DENIED: {
    code: 401,
    message: "Access denied. Unauthorized user",
  },
  UNKNOWN_ERROR: {
    code: 500,
    message: "Something went wrong, Please try again!",
  },
};
