const mongoose = require('mongoose');
const slugify = require('slugify');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [150, 'Service name cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate slug before saving
serviceSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});

// Virtual: category count under this service
serviceSchema.virtual('categoryCount', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'serviceId',
  count: true,
});

// Virtual: template count under this service
serviceSchema.virtual('templateCount', {
  ref: 'Template',
  localField: '_id',
  foreignField: 'serviceId',
  count: true,
});

// slug uniqueness is enforced by unique:true on the field definition above
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ order: 1 });

module.exports = mongoose.model('Service', serviceSchema);
