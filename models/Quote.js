const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const quoteSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a quote name!'
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
quoteSchema.index({
  name: 'text',
  description: 'text'
});

quoteSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next(); // skip it
    return; // stop this function from running
  }
  this.slug = slug(this.name);
  // find other quotes that have a slug of wes, wes-1, wes-2
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const quotesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (quotesWithSlug.length) {
    this.slug = `${this.slug}-${quotesWithSlug.length + 1}`;
  }
  next();
  // TODO make more resiliant so slugs are unique
});

quoteSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

quoteSchema.statics.getTopQuotes = function() {
  return this.aggregate([
    // Lookup Quotes and populate their reviews
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'quote', as: 'reviews' }},
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

// find reviews where the quotes _id property === reviews quote property
quoteSchema.virtual('reviews', {
  ref: 'Review', // what model to link?
  localField: '_id', // which field on the quote?
  foreignField: 'quote' // which field on the review?
});

function autopopulate(next) {
  this.populate('reviews');
  next();
}

quoteSchema.pre('find', autopopulate);
quoteSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Quote', quoteSchema);
