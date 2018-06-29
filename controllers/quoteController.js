const mongoose = require('mongoose');
const Quote = mongoose.model('Quote');
const User = mongoose.model('User');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    } else {
      next({ message: 'That filetype isn\'t allowed!' }, false);
    }
  }
};

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addQuote = (req, res) => {
  res.render('editQuote', { title: 'Add Quote' });
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); // skip to the next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we have written the photo to our filesystem, keep going!
  next();
};

exports.createQuote = async (req, res) => {
  req.body.author = req.user._id;
  const quote = await (new Quote(req.body)).save();
  req.flash('success', `Successfully Created ${quote.name}. Care to leave a review?`);
  res.redirect(`/quotes/${quote.slug}`);
};

exports.getQuotes = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 20;
  const skip = (page * limit) - limit;

  // 1. Query the database for a list of all quotes
  const quotesPromise = Quote
    .find()
    .skip(skip)
    .limit(limit)
    .sort({ created: 'desc' });

  const countPromise = Quote.count();

  const [quotes, count] = await Promise.all([quotesPromise, countPromise]);
  const pages = Math.ceil(count / limit);
  if (!quotes.length && skip) {
    req.flash('info', `Hey! You asked for page ${page}. But that doesn't exist. So I put you on page ${pages}`);
    res.redirect(`/quotes/page/${pages}`);
    return;
  }

  res.render('quotes', { title: 'Quotes', quotes, page, pages, count });
};

const confirmOwner = (quote, user) => {
  if (!quote.author.equals(user._id)) {
    throw Error('You must own a quote in order to edit it!');
  }
};


exports.editQuote = async (req, res) => {
  // 1. Find the quote given the ID
  const quote = await Quote.findOne({ _id: req.params.id });
  // 2. confirm they are the owner of the quote
  confirmOwner(quote, req.user);
  // 3. Render out the edit form so the user can update their quote
  res.render('editQuote', { title: `Edit ${quote.name}`, quote });
};

exports.updateQuote = async (req, res) => {
  // find and update the quote
  const quote = await Quote.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new quote instead of the old one
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${quote.name}</strong>. <a href="/quotes/${quote.slug}">View Quote →</a>`);
  res.redirect(`/quotes/${quote._id}/edit`);
  // Redriect them the quote and tell them it worked
};

exports.getQuoteBySlug = async (req, res, next) => {
  const quote = await Quote.findOne({ slug: req.params.slug }).populate('author reviews');
  if (!quote) return next();
  res.render('quote', { quote, title: quote.name });
};

exports.getQuotesByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };

  const tagsPromise = Quote.getTagsList();
  const quotesPromise = Quote.find({ tags: tagQuery });
  const [tags, quotes] = await Promise.all([tagsPromise, quotesPromise]);


  res.render('tag', { tags, title: 'Tags', tag, quotes });
};


exports.searchQuotes = async (req, res) => {
  const quotes = await Quote
  // first find quotes that match
  .find({
    $text: {
      $search: req.query.q
    }
  }, {
    score: { $meta: 'textScore' }
  })
  // the sort them
  .sort({
    score: { $meta: 'textScore' }
  })
  res.json(quotes);
};

exports.heartQuote = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());

  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User
    .findByIdAndUpdate(req.user._id,
      { [operator]: { hearts: req.params.id } },
      { new: true }
    );
  res.json(user);
};

exports.getHearts = async (req, res) => {
  const quotes = await Quote.find({
    _id: { $in: req.user.hearts }
  });
  res.render('quotes', { title: 'Hearted Quotes', quotes });
};
