const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a story name!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Define our indexes
storySchema.index({
  name: 'text',
  description: 'text'
});

storySchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next(); // skip it
    return; // stop this function from running
  }
  this.slug = slug(this.name);
  // find other storys that have a slug of wes, wes-1, wes-2
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storysWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (storysWithSlug.length) {
    this.slug = `${this.slug}-${storysWithSlug.length + 1}`;
  }
  next();
  // TODO make more resiliant so slugs are unique
});

storySchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

storySchema.statics.getTopStorys = function() {
  return this.aggregate([
    // Lookup Storys and populate their reviews
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'story', as: 'reviews' }},
    // filter for only items that have 2 or more reviews
    { $match: { 'reviews.1': { $exists: true } } },
    // Add the average reviews field
    { $project: {
      photo: '$$ROOT.photo',
      name: '$$ROOT.name',
      reviews: '$$ROOT.reviews',
      slug: '$$ROOT.slug',
      averageRating: { $avg: '$reviews.rating' }
    } },
    // sort it by our new field, highest reviews first
    { $sort: { averageRating: -1 }},
  ]);
}

// find reviews where the storys _id property === reviews story property
storySchema.virtual('reviews', {
  ref: 'Review', // what model to link?
  localField: '_id', // which field on the story?
  foreignField: 'story' // which field on the review?
});

function autopopulate(next) {
  this.populate('reviews');
  next();
}

storySchema.pre('find', autopopulate);
storySchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Story', storySchema);
