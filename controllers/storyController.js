const mongoose = require('mongoose');
const Story = mongoose.model('Story');
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

exports.addStory = (req, res) => {
  res.render('editStory', { title: 'Add Story' });
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

exports.createStory = async (req, res) => {
  req.body.author = req.user._id;
  const story = await (new Story(req.body)).save();
  req.flash('success', `Successfully Created ${story.name}. Care to leave a review?`);
  res.redirect(`/stories/${story.slug}`);
};

exports.getStories = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 20;
  const skip = (page * limit) - limit;

  // 1. Query the database for a list of all stories
  const storiesPromise = Story
    .find()
    .skip(skip)
    .limit(limit)
    .sort({ created: 'desc' });

  const countPromise = Story.count();

  const [stories, count] = await Promise.all([storiesPromise, countPromise]);
  const pages = Math.ceil(count / limit);
  if (!stories.length && skip) {
    req.flash('info', `Hey! You asked for page ${page}. But that doesn't exist. So I put you on page ${pages}`);
    res.redirect(`/stories/page/${pages}`);
    return;
  }

  res.render('stories', { title: 'Stories', stories, page, pages, count });
};

const confirmOwner = (story, user) => {
  if (!story.author.equals(user._id)) {
    throw Error('You must own a story in order to edit it!');
  }
};


exports.editStory = async (req, res) => {
  // 1. Find the story given the ID
  const story = await Story.findOne({ _id: req.params.id });
  // 2. confirm they are the owner of the story
  confirmOwner(story, req.user);
  // 3. Render out the edit form so the user can update their story
  res.render('editStory', { title: `Edit ${story.name}`, story });
};

exports.updateStory = async (req, res) => {
  // find and update the story
  const story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new story instead of the old one
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${story.name}</strong>. <a href="/stories/${story.slug}">View Story →</a>`);
  res.redirect(`/stories/${story._id}/edit`);
  // Redriect them the story and tell them it worked
};

exports.getStoryBySlug = async (req, res, next) => {
  const story = await Story.findOne({ slug: req.params.slug }).populate('author reviews');
  if (!story) return next();
  res.render('story', { story, title: story.name });
};

exports.getStoriesByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };

  const tagsPromise = Story.getTagsList();
  const storiesPromise = Story.find({ tags: tagQuery });
  const [tags, stories] = await Promise.all([tagsPromise, storiesPromise]);


  res.render('tag', { tags, title: 'Tags', tag, stories });
};


exports.searchStories = async (req, res) => {
  const stories = await Story
  // first find stories that match
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
  res.json(stories);
};

exports.heartStory = async (req, res) => {
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
  const stories = await Story.find({
    _id: { $in: req.user.hearts }
  });
  res.render('stories', { title: 'Hearted Stories', stories });
};
