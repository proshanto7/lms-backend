import User from "../../auth/model/user.model.js";
import Course from "../../courses/model/courses.model.js";
import Category from "../../categories/model/category.model.js";
import Enrollment from "../../enrollment/model/enrollment.model.js";
import Lesson from "../../lesson/model/lesson.model.js";

/**
 * Overview cards — total counts for the dashboard homepage
 */
export const getOverviewStats = async () => {
  const [
    totalStudents,
    totalMentors,
    totalCourses,
    totalCategories,
    totalActiveEnrollments,
    totalLessons,
  ] = await Promise.all([
    User.countDocuments({ role: "student", isActive: true }),
    User.countDocuments({ role: "mentor", isActive: true }),
    Course.countDocuments(),
    Category.countDocuments(),
    Enrollment.countDocuments({ status: "active" }),
    Lesson.countDocuments(),
  ]);

  // estimated revenue = sum of course price for each active enrollment
  const revenueResult = await Enrollment.aggregate([
    { $match: { status: "active" } },
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseInfo",
      },
    },
    { $unwind: "$courseInfo" },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$courseInfo.price" },
      },
    },
  ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  return {
    totalStudents,
    totalMentors,
    totalCourses,
    totalCategories,
    totalActiveEnrollments,
    totalLessons,
    totalRevenue,
  };
};

/**
 * Most recent 5 enrollments (for "recent activity" feed)
 */
export const getRecentEnrollments = async () => {
  const enrollments = await Enrollment.find({ status: "active" })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("student", "name email avatar")
    .populate("course", "title slug price")
    .populate("enrolledBy", "name");

  return enrollments;
};

/**
 * Top 5 courses by active enrollment count
 */
export const getTopCourses = async () => {
  const result = await Enrollment.aggregate([
    { $match: { status: "active" } },
    {
      $group: {
        _id: "$course",
        enrollmentCount: { $sum: 1 },
      },
    },
    { $sort: { enrollmentCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $project: {
        _id: 0,
        courseId: "$course._id",
        title: "$course.title",
        slug: "$course.slug",
        price: "$course.price",
        image: "$course.image",
        enrollmentCount: 1,
      },
    },
  ]);

  return result;
};

/**
 * Enrollment count grouped by month — last 6 months (for a line/bar chart)
 */
export const getEnrollmentTrend = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const result = await Enrollment.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return result.map((item) => ({
    year: item._id.year,
    month: item._id.month,
    count: item.count,
  }));
};

/**
 * Combined dashboard payload — one call, everything the homepage needs
 */
export const getDashboardSummary = async () => {
  const [overview, recentEnrollments, topCourses, enrollmentTrend] = await Promise.all([
    getOverviewStats(),
    getRecentEnrollments(),
    getTopCourses(),
    getEnrollmentTrend(),
  ]);

  return { overview, recentEnrollments, topCourses, enrollmentTrend };
};