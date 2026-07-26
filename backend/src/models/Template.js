const mongoose = require('mongoose');
const slugify = require('slugify');

const templateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Template title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // ─── Type (inferred from media, but stored for filtering) ────
    type: {
      type: String,
      enum: ['static', 'video', 'website'],
      default: 'static',
    },
    // ─── Service / Category ───────────────────────
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    // ─── Media ────────────────────────────────────
    thumbnail: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    youtubeLink: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v) {
          if (!v) return true; // optional
          return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(v);
        },
        message: 'Please provide a valid YouTube URL',
      },
    },
    // ─── Content ──────────────────────────────────
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) => tags.map((tag) => tag.toLowerCase().trim()),
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
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

// Auto-generate unique slug before saving
templateSchema.pre('save', async function (next) {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    let slug = baseSlug;
    let count = 1;

    while (await mongoose.model('Template').exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    this.slug = slug;
  }
  next();
});

// Indexes for performance
// slug uniqueness is enforced by unique:true on the field definition above
templateSchema.index({ serviceId: 1 });
templateSchema.index({ categoryId: 1 });
templateSchema.index({ featured: 1 });
templateSchema.index({ isActive: 1 });
templateSchema.index({ views: -1 });
templateSchema.index({ createdAt: -1 });
templateSchema.index({ tags: 1 });
// Full-text search index
templateSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, description: 1 }, name: 'template_text_index' }
);

module.exports = mongoose.model('Template', templateSchema);
