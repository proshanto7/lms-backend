import { asyncHandler } from "../../../utils/asyncHandler.js";
import { apiResponse } from "../../../utils/apiResponse.js";
import * as dashboardService from "../service/dashboard.service.js";

/**
 * @route   GET /api/v1/dashboard/summary
 * @access  Private (admin)
 */
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getDashboardSummary();

  return apiResponse(res, 200, "Dashboard summary fetched successfully", summary);
});