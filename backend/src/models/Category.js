const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    // Parent service (required for new categories; existing legacy docs may have none)
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
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
categorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});

// Virtual: template count (keyed on categoryId for new templates)
categorySchema.virtual('templateCount', {
  ref: 'Template',
  localField: '_id',
  foreignField: 'categoryId',
  count: true,
});

// Compound unique index: same slug allowed across different services, not within one
categorySchema.index({ serviceId: 1, slug: 1 }, { unique: true });
categorySchema.index({ isActive: 1 });
categorySchema.index({ serviceId: 1 });
categorySchema.index({ order: 1 });

module.exports = mongoose.model('Category', categorySchema);
