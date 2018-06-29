const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(quoteController.getQuotes));
router.get('/quotes', catchErrors(quoteController.getQuotes));
router.get('/quotes/page/:page', catchErrors(quoteController.getQuotes));
router.get('/add', authController.isLoggedIn, quoteController.addQuote);

router.post('/add',
  quoteController.upload,
  catchErrors(quoteController.resize),
  catchErrors(quoteController.createQuote)
);

router.post('/add/:id',
  quoteController.upload,
  catchErrors(quoteController.resize),
  catchErrors(quoteController.updateQuote)
);

router.get('/quotes/:id/edit', catchErrors(quoteController.editQuote));
router.get('/quotes/:slug', catchErrors(quoteController.getQuoteBySlug));

router.get('/tags', catchErrors(quoteController.getQuotesByTag));
router.get('/tags/:tag', catchErrors(quoteController.getQuotesByTag));

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
router.get('/hearts', authController.isLoggedIn, catchErrors(quoteController.getHearts));
router.post('/reviews/:id',
  authController.isLoggedIn,
  catchErrors(reviewController.addReview)
);

/*
  API
*/

router.get('/api/search', catchErrors(quoteController.searchQuotes));
router.post('/api/quotes/:id/heart', catchErrors(quoteController.heartQuote));

module.exports = router;
