const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(storyController.getStories));
router.get('/stories', catchErrors(storyController.getStories));
router.get('/stories/page/:page', catchErrors(storyController.getStories));
router.get('/add', authController.isLoggedIn, storyController.addStory);

router.post('/add',
  storyController.upload,
  catchErrors(storyController.resize),
  catchErrors(storyController.createStory)
);

router.post('/add/:id',
  storyController.upload,
  catchErrors(storyController.resize),
  catchErrors(storyController.updateStory)
);

router.get('/stories/:id/edit', catchErrors(storyController.editStory));
router.get('/stories/:slug', catchErrors(storyController.getStoryBySlug));

router.get('/tags', catchErrors(storyController.getStoriesByTag));
router.get('/tags/:tag', catchErrors(storyController.getStoriesByTag));

router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/register', userController.registerForm);

// 1. Validate the registration data
// 2. register the user
// 3. we need to log them in
router.post('/register',
  userController.validateRegister,
  userController.register,
  authController.login
);

router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token',
  authController.confirmedPasswords,
  catchErrors(authController.update)
);
router.get('/hearts', authController.isLoggedIn, catchErrors(storyController.getHearts));
router.post('/reviews/:id',
  authController.isLoggedIn,
  catchErrors(reviewController.addReview)
);

/*
  API
*/

router.get('/api/search', catchErrors(storyController.searchStories));
router.post('/api/stories/:id/heart', catchErrors(storyController.heartStory));

module.exports = router;
