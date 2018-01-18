const mongoose = require('mongoose');
const Review = mongoose.model('Review');

exports.addReview = async (req, res) => {
  req.body.author = req.user._id;
  req.body.story = req.params.id;
  const newReview = new Review(req.body);
  await newReview.save();
  req.flash('success', 'Revivew Saved!');
  res.redirect('back');
};
