const Template = require('../models/Template');
const Category = require('../models/Category');
const Service = require('../models/Service');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private (Admin)
 *
 * Each query runs independently — one failing aggregate does NOT kill
 * the whole response. Falls back to 0 / [] on any individual failure.
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // Run all counts/queries in parallel for performance.
    // Each wrapped in a Promise.resolve().catch() so individual failures
    // return safe defaults rather than rejecting the whole Promise.all.
    const safeQuery = (promise, fallback) =>
      Promise.resolve(promise).catch((err) => {
        console.error(`[Dashboard] Query error: ${err.message}`);
        return fallback;
      });

    const [
      totalTemplates,       // All templates (active + inactive) — for admin overview
      activeTemplates,      // Only active templates
      totalServices,
      totalCategories,
      activeCategories,
      featuredTemplates,
      totalViewsResult,
      recentTemplates,
      topViewedTemplates,
      templatesByService,
      templatesByCategory,
    ] = await Promise.all([
      // Total templates (all, not just active) — useful for admin
      safeQuery(Template.countDocuments(), 0),

      // Active templates only
      safeQuery(Template.countDocuments({ isActive: true }), 0),

      // Total services
      safeQuery(Service.countDocuments(), 0),

      // Total categories
      safeQuery(Category.countDocuments(), 0),

      // Active categories
      safeQuery(Category.countDocuments({ isActive: true }), 0),

      // Featured + active templates count
      safeQuery(Template.countDocuments({ featured: true, isActive: true }), 0),

      // Total views across all active templates
      safeQuery(
        Template.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: null, total: { $sum: '$views' } } },
        ]),
        []
      ),

      // Recent 5 templates (all, not just active — admin can see drafts)
      safeQuery(
        Template.find()
          .populate('categoryId', 'name slug')
          .populate('serviceId', 'name slug')
          .sort({ createdAt: -1 })
          .limit(5)
          .select('title slug thumbnail featured views isActive type createdAt categoryId serviceId')
          .lean(),
        []
      ),

      // Top 5 most viewed active templates
      safeQuery(
        Template.find({ isActive: true })
          .populate('categoryId', 'name slug')
          .populate('serviceId', 'name slug')
          .sort({ views: -1 })
          .limit(5)
          .select('title slug thumbnail views type createdAt categoryId serviceId')
          .lean(),
        []
      ),

      // Templates count per service
      safeQuery(
        Template.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$serviceId', count: { $sum: 1 } } },
          {
            $lookup: {
              from: 'services',
              localField: '_id',
              foreignField: '_id',
              as: 'service',
            },
          },
          { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              serviceName: { $ifNull: ['$service.name', 'Uncategorised'] },
              serviceSlug: { $ifNull: ['$service.slug', null] },
              count: 1,
            },
          },
          { $sort: { count: -1 } },
        ]),
        []
      ),

      // Templates count per category
      safeQuery(
        Template.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$categoryId', count: { $sum: 1 } } },
          {
            $lookup: {
              from: 'categories',
              localField: '_id',
              foreignField: '_id',
              as: 'category',
            },
          },
          { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              categoryName: { $ifNull: ['$category.name', 'Uncategorised'] },
              categorySlug: { $ifNull: ['$category.slug', null] },
              count: 1,
            },
          },
          { $sort: { count: -1 } },
        ]),
        []
      ),
    ]);

    console.log(`[Dashboard] Stats fetched — Templates: ${totalTemplates}, Services: ${totalServices}, Categories: ${totalCategories}`);

    return sendSuccess(res, 200, 'Dashboard statistics retrieved successfully', {
      // Admin overview counts (use totalTemplates for the card — all templates)
      totalTemplates,
      activeTemplates,
      totalServices,
      totalCategories,
      activeCategories,
      featuredTemplates,
      totalViews: totalViewsResult[0]?.total || 0,
      // Lists
      recentTemplates,
      topViewedTemplates,
      templatesByService,
      templatesByCategory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
