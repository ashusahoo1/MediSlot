//?MIDDLEWARE TO AUTHORIZE ROLE OF USER AND RESTRICT ACCESS
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// accepts one or more allowed roles -- thats not spread operator there
const authorizeRole = (...allowedRoles) => {
  return asyncHandler(async (req, _, next) => {
    const userRole = req.user?.role; //makes middleware flexible for multiple role combi

    if (!allowedRoles.includes(userRole)) {
      throw new ApiError(403, "Access denied: unauthorized role");
    }

    next();
  });
};
export default authorizeRole
