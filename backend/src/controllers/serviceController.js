const { validationResult } = require('express-validator');
const Service = require('../models/Service');
const Category = require('../models/Category');
const Template = require('../models/Template');
const { generateUniqueSlug } = require('../utils/slugGenerator');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Create a new service
 * @route   POST /api/services
 * @access  Private (Admin)
 */
const createService = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { name, description, image, order, isActive } = req.body;

    // Duplicate name check (case-insensitive)
    const existing = await Service.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
    if (existing) {
      return sendError(res, 409, `Service '${name}' already exists`);
    }

    const service = await Service.create({
      name,
      description: description || '',
      image: image || '',
      order: order !== undefined ? order : 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    return sendSuccess(res, 201, 'Service created successfully', { service });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all services
 * @route   GET /api/services
 * @access  Public
 *
 * Query params:
 *   active=true   → only active services  (public default)
 *   active=false  → only inactive services
 *   active=all    → all services regardless of status (admin use)
 *   (omitted)     → only active services (same as true)
 */
const getServices = async (req, res, next) => {
  try {
    const { active } = req.query;

    const filter = {};
    if (active === 'all') {
      // No filter — return everything (admin use)
    } else if (active === 'false') {
      filter.isActive = false;
    } else {
      // Default: only active services (true or omitted)
      filter.isActive = true;
    }

    const services = await Service.find(filter)
      .populate('categoryCount')
      .populate('templateCount')
      .sort({ order: 1, name: 1 })
      .lean({ virtuals: true });

    return sendSuccess(res, 200, 'Services retrieved successfully', {
      count: services.length,
      services,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single service by ID or slug (with its categories)
 * @route   GET /api/services/:id
 * @access  Public
 */
const getService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };

    const service = await Service.findOne(query)
      .populate('categoryCount')
      .populate('templateCount');

    if (!service) {
      return sendError(res, 404, 'Service not found');
    }

    // Fetch categories belonging to this service
    const categories = await Category.find({ serviceId: service._id, isActive: true })
      .populate('templateCount')
      .sort({ order: 1, name: 1 });

    return sendSuccess(res, 200, 'Service retrieved successfully', {
      service,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update service
 * @route   PUT /api/services/:id
 * @access  Private (Admin)
 */
const updateService = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const service = await Service.findById(req.params.id);
    if (!service) {
      return sendError(res, 404, 'Service not found');
    }

    const { name, description, image, order, isActive } = req.body;

    // Duplicate name check (excluding self)
    if (name && name.toLowerCase() !== service.name.toLowerCase()) {
      const duplicate = await Service.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: service._id },
      });
      if (duplicate) {
        return sendError(res, 409, `Service '${name}' already exists`);
      }

      service.name = name;
      service.slug = await generateUniqueSlug(name, Service, service._id);
    }

    if (description !== undefined) service.description = description;
    if (image !== undefined) service.image = image;
    if (order !== undefined) service.order = order;
    if (isActive !== undefined) service.isActive = isActive;

    await service.save();

    return sendSuccess(res, 200, 'Service updated successfully', { service });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete service
 * @route   DELETE /api/services/:id
 * @access  Private (Admin)
 */
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return sendError(res, 404, 'Service not found');
    }

    // Guard: prevent delete if categories exist under this service
    const catCount = await Category.countDocuments({ serviceId: service._id });
    if (catCount > 0) {
      return sendError(
        res,
        400,
        `Cannot delete service. It has ${catCount} category/categories linked to it. Reassign or delete them first.`
      );
    }

    await service.deleteOne();

    return sendSuccess(res, 200, 'Service deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
};
