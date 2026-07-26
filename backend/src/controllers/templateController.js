const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');
const Template = require('../models/Template');
const Category = require('../models/Category');
const Service = require('../models/Service');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Create a new template
 * @route   POST /api/templates
 * @access  Private (Admin)
 */
const createTemplate = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const {
      title, serviceId, categoryId,
      type,
      youtubeLink, description, featured,
      tags, isActive, thumbnail, images,
    } = req.body;

    // Validate category exists
    const categoryDoc = await Category.findById(categoryId);
    if (!categoryDoc) {
      return sendError(res, 404, 'Category not found');
    }

    // Resolve serviceId: use provided value, else inherit from category
    const resolvedServiceId = serviceId || categoryDoc.serviceId || null;

    const template = await Template.create({
      title,
      type: type || 'static',
      serviceId: resolvedServiceId,
      categoryId,
      thumbnail: thumbnail || '',
      images: images || [],
      youtubeLink: youtubeLink || '',
      description: description || '',
      featured: featured || false,
      tags: tags || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    await template.populate([
      { path: 'categoryId', select: 'name slug' },
      { path: 'serviceId', select: 'name slug' },
    ]);

    return sendSuccess(res, 201, 'Template created successfully', { template });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all templates with pagination, sorting, filtering
 * @route   GET /api/templates
 * @access  Public
 */
const getTemplates = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = 'latest',
      category,    // categoryId or slug
      service,     // serviceId or slug
      featured,
      type,
      isActive,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    // isActive filter:
    //   undefined or missing → only active (public default)
    //   'true'              → only active
    //   'false'             → only inactive
    //   'all'               → no filter (admin: show everything)
    if (isActive === 'all') {
      // no filter — show all templates
    } else if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    } else {
      filter.isActive = true;
    }

    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }

    // Filter by type
    if (type && ['static', 'video', 'website'].includes(type)) {
      filter.type = type;
    }

    // Filter by service (slug or ID)
    if (service) {
      let serviceDoc;
      if (service.match(/^[0-9a-fA-F]{24}$/)) {
        serviceDoc = await Service.findById(service);
      } else {
        serviceDoc = await Service.findOne({ slug: service });
      }
      if (!serviceDoc) {
        return sendError(res, 404, 'Service not found');
      }
      filter.serviceId = serviceDoc._id;
    }

    // Filter by category (slug or ID)
    if (category) {
      let categoryDoc;
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        categoryDoc = await Category.findById(category);
      } else {
        categoryDoc = await Category.findOne({ slug: category });
      }
      if (!categoryDoc) {
        return sendError(res, 404, 'Category not found');
      }
      filter.categoryId = categoryDoc._id;
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
      case 'popular': sortOption = { views: -1, createdAt: -1 }; break;
      case 'oldest': sortOption = { createdAt: 1 }; break;
      case 'az': sortOption = { title: 1 }; break;
      case 'za': sortOption = { title: -1 }; break;
      case 'latest':
      default: sortOption = { createdAt: -1 }; break;
    }

    const [templates, total] = await Promise.all([
      Template.find(filter)
        .populate('categoryId', 'name slug')
        .populate('serviceId', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      Template.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return sendSuccess(res, 200, 'Templates retrieved successfully', {
      templates,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single template by slug (and increment view count)
 * @route   GET /api/templates/:slug
 * @access  Public
 */
const getTemplateBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const template = await Template.findOneAndUpdate(
      { slug, isActive: true },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('categoryId', 'name slug description')
      .populate('serviceId', 'name slug');

    if (!template) {
      return sendError(res, 404, 'Template not found');
    }

    return sendSuccess(res, 200, 'Template retrieved successfully', { template });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single template by MongoDB ObjectId (admin use — no isActive filter)
 * @route   GET /api/templates/id/:id
 * @access  Private (Admin)
 *
 * This endpoint exists because the public /:slug route filters by isActive:true
 * and matches on slug strings only. The admin edit page has a template's ObjectId
 * and needs to fetch regardless of active status.
 */
const getTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format before hitting the DB
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid template ID format');
    }

    const template = await Template.findById(id)
      .populate('categoryId', 'name slug description')
      .populate('serviceId', 'name slug');

    if (!template) {
      return sendError(res, 404, 'Template not found');
    }

    return sendSuccess(res, 200, 'Template retrieved successfully', { template });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured templates
 * @route   GET /api/templates/featured
 * @access  Public
 */
const getFeaturedTemplates = async (req, res, next) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit) || 8);

    const templates = await Template.find({ featured: true, isActive: true })
      .populate('categoryId', 'name slug')
      .populate('serviceId', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-__v');

    return sendSuccess(res, 200, 'Featured templates retrieved successfully', {
      count: templates.length,
      templates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search templates
 * @route   GET /api/templates/search?q=wedding
 * @access  Public
 */
const searchTemplates = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    if (!q || q.trim().length < 1) {
      return sendError(res, 400, 'Search query is required');
    }

    const searchTerm = q.trim();
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Matching categories and services (for name-based search)
    const [matchingCategories, matchingServices] = await Promise.all([
      Category.find({ name: { $regex: searchTerm, $options: 'i' }, isActive: true }).select('_id'),
      Service.find({ name: { $regex: searchTerm, $options: 'i' }, isActive: true }).select('_id'),
    ]);

    const categoryIds = matchingCategories.map((c) => c._id);
    const serviceIds = matchingServices.map((s) => s._id);

    const searchQuery = {
      isActive: true,
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } },
        ...(categoryIds.length > 0 ? [{ categoryId: { $in: categoryIds } }] : []),
        ...(serviceIds.length > 0 ? [{ serviceId: { $in: serviceIds } }] : []),
      ],
    };

    const [templates, total] = await Promise.all([
      Template.find(searchQuery)
        .populate('categoryId', 'name slug')
        .populate('serviceId', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      Template.countDocuments(searchQuery),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return sendSuccess(res, 200, 'Search results retrieved successfully', {
      query: searchTerm,
      templates,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update template
 * @route   PUT /api/templates/:id
 * @access  Private (Admin)
 */
const updateTemplate = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const template = await Template.findById(req.params.id);
    if (!template) {
      return sendError(res, 404, 'Template not found');
    }

    // Validate category if changing
    if (req.body.categoryId) {
      const categoryDoc = await Category.findById(req.body.categoryId);
      if (!categoryDoc) {
        return sendError(res, 404, 'Category not found');
      }
    }

    // Validate service if changing
    if (req.body.serviceId) {
      const serviceDoc = await Service.findById(req.body.serviceId);
      if (!serviceDoc) {
        return sendError(res, 404, 'Service not found');
      }
    }

    const allowedFields = [
      'title', 'type', 'serviceId', 'categoryId',
      'youtubeLink', 'description',
      'featured', 'tags', 'isActive',
      'thumbnail', 'images',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        template[field] = req.body[field];
      }
    });

    await template.save();
    await template.populate([
      { path: 'categoryId', select: 'name slug' },
      { path: 'serviceId', select: 'name slug' },
    ]);

    return sendSuccess(res, 200, 'Template updated successfully', { template });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete template
 * @route   DELETE /api/templates/:id
 * @access  Private (Admin)
 */
const deleteTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return sendError(res, 404, 'Template not found');
    }

    // Delete associated thumbnail from disk
    if (template.thumbnail) {
      const thumbnailPath = path.join(
        __dirname, '../../uploads/templates',
        path.basename(template.thumbnail)
      );
      if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
    }

    // Delete gallery images from disk
    if (template.images && template.images.length > 0) {
      template.images.forEach((imgUrl) => {
        const imgPath = path.join(
          __dirname, '../../uploads/templates',
          path.basename(imgUrl)
        );
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });
    }

    await template.deleteOne();

    return sendSuccess(res, 200, 'Template deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload single template image
 * @route   POST /api/upload/template-image
 * @access  Private (Admin)
 */
const uploadTemplateImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No image file uploaded');
    }
    const imageUrl = `/uploads/templates/${req.file.filename}`;
    return sendSuccess(res, 200, 'Image uploaded successfully', { imageUrl });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload multiple template gallery images (max 10)
 * @route   POST /api/upload/template-images
 * @access  Private (Admin)
 */
const uploadTemplateImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 400, 'No image files uploaded');
    }
    const images = req.files.map((file) => `/uploads/templates/${file.filename}`);
    return sendSuccess(res, 200, 'Images uploaded successfully', { images });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete uploaded image
 * @route   DELETE /api/upload/:filename
 * @access  Private (Admin)
 */
const deleteUploadedImage = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(__dirname, '../../uploads/templates', safeFilename);

    if (!fs.existsSync(filePath)) {
      return sendError(res, 404, 'File not found');
    }
    fs.unlinkSync(filePath);
    return sendSuccess(res, 200, 'Image deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  getTemplateBySlug,
  getTemplateById,
  getFeaturedTemplates,
  searchTemplates,
  updateTemplate,
  deleteTemplate,
  uploadTemplateImage,
  uploadTemplateImages,
  deleteUploadedImage,
};
