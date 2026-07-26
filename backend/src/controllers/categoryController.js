const { validationResult } = require('express-validator');
const Category = require('../models/Category');
const Service = require('../models/Service');
const Template = require('../models/Template');
const { generateUniqueSlug } = require('../utils/slugGenerator');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private (Admin)
 */
const createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { name, serviceId, description, image, order, isActive } = req.body;

    // Validate service exists if provided
    if (serviceId) {
      const serviceExists = await Service.findById(serviceId);
      if (!serviceExists) {
        return sendError(res, 404, 'Service not found');
      }
    }

    // Duplicate name check within same service (case-insensitive)
    const dupQuery = { name: { $regex: new RegExp(`^${name}$`, 'i') } };
    if (serviceId) dupQuery.serviceId = serviceId;

    const existingCategory = await Category.findOne(dupQuery);
    if (existingCategory) {
      return sendError(res, 409, `Category '${name}' already exists`);
    }

    const category = await Category.create({
      name,
      serviceId: serviceId || null,
      description: description || '',
      image: image || '',
      order: order !== undefined ? order : 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    await category.populate('serviceId', 'name slug');

    return sendSuccess(res, 201, 'Category created successfully', { category });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all categories (optionally filter by service)
 * @route   GET /api/categories
 * @access  Public
 *
 * Query params:
 *   active=true   → only active categories
 *   active=false  → only inactive categories
 *   active=all    → all categories regardless of status (admin use)
 *   (omitted)     → only active categories
 *   serviceId     → filter by service ObjectId
 */
const getCategories = async (req, res, next) => {
  try {
    const { active, serviceId } = req.query;

    const filter = {};
    if (active === 'all') {
      // No filter — return everything (admin use)
    } else if (active === 'false') {
      filter.isActive = false;
    } else {
      // Default: only active
      filter.isActive = true;
    }

    if (serviceId) filter.serviceId = serviceId;

    const categories = await Category.find(filter)
      .populate('serviceId', 'name slug')
      .populate('templateCount')
      .sort({ order: 1, name: 1 });

    return sendSuccess(res, 200, 'Categories retrieved successfully', {
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get categories under a specific service
 * @route   GET /api/categories/service/:serviceId
 * @access  Public
 */
const getCategoriesByService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;

    // Support service slug or ObjectId
    let service;
    if (serviceId.match(/^[0-9a-fA-F]{24}$/)) {
      service = await Service.findById(serviceId);
    } else {
      service = await Service.findOne({ slug: serviceId });
    }

    if (!service) {
      return sendError(res, 404, 'Service not found');
    }

    const categories = await Category.find({ serviceId: service._id, isActive: true })
      .populate('templateCount')
      .sort({ order: 1, name: 1 });

    return sendSuccess(res, 200, 'Categories retrieved successfully', {
      service: { id: service._id, name: service.name, slug: service.slug },
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single category by ID or slug
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };

    const category = await Category.findOne(query)
      .populate('serviceId', 'name slug')
      .populate('templateCount');

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    return sendSuccess(res, 200, 'Category retrieved successfully', { category });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private (Admin)
 */
const updateCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { name, serviceId, description, image, order, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    // Validate service if changing
    if (serviceId !== undefined) {
      if (serviceId) {
        const serviceExists = await Service.findById(serviceId);
        if (!serviceExists) {
          return sendError(res, 404, 'Service not found');
        }
      }
      category.serviceId = serviceId || null;
    }

    // Duplicate name check when name changes
    if (name && name.toLowerCase() !== category.name.toLowerCase()) {
      const duplicate = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: category._id },
      });
      if (duplicate) {
        return sendError(res, 409, `Category '${name}' already exists`);
      }
      category.name = name;
      category.slug = await generateUniqueSlug(name, Category, category._id);
    }

    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    await category.populate('serviceId', 'name slug');

    return sendSuccess(res, 200, 'Category updated successfully', { category });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin)
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    // Guard: templates linked via categoryId
    const templateCount = await Template.countDocuments({ categoryId: category._id });
    if (templateCount > 0) {
      return sendError(
        res,
        400,
        `Cannot delete category. It has ${templateCount} template(s) associated with it. Reassign or delete the templates first.`
      );
    }

    await category.deleteOne();

    return sendSuccess(res, 200, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoriesByService,
  getCategory,
  updateCategory,
  deleteCategory,
};
