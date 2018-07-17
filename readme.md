# Quote app
A quote app by Rob van der Pas 

![Quotes overview](https://github.com/rvdpas/quote-app/blob/master/public/images/github/quotes.jpg)

## What is this repository about?
This repository will showcase the Quote app I've build. You can see quotes about programming subjects that users found interesting and added them. You can register on the the page and create your own quote or post a quote that you think is inpiring. 

## Why did I build this app
I've made this app to learn about the subjects Nodejs, Mongodb, MVC Patterns. I wanted to get a good understanding on how to save data in a database and build an app with nodejs. To get a good understanding of the concepts I had to build something that I enjoy. When I'm reading about articles about coding, I find good quotes really inspiring. They can give you new insights, inspirire you, and motivate as well. That's the reason i've build this particular app. I wanted to create a place where everybody can create and / or post they're favourite quotes about programming. 

### Quotes overview
The first screen you will see is the overview of all the quotes that have been added. You can get inpspired as soon as you read the first quotes. You also have the posibility to see the quote in a for detailed way, by clicking on the name of the quote author. 

![Quotes overview](https://github.com/rvdpas/quote-app/blob/master/public/images/github/quotes.jpg)

### Quote detail
Here you can see the tags that have been given to the quote to see in what categories they are. For example a certain quote can have the subject Javascript, Programming or Errors. 

![Quote detail](https://github.com/rvdpas/quote-app/blob/master/public/images/github/quote-detail.jpg)

### Tags
On the tags pages you can find quotes filtered by subject. You can select a tag and it will only show you quotes about that subject. The tags are added when a quote is created, so you can make sure it's under the right category.

![Quote tags](https://github.com/rvdpas/quote-app/blob/master/public/images/github/tags.jpg)

### Login & Register
The login and register is very basic. You have to enter a username and password to login.

![Account register](https://github.com/rvdpas/quote-app/blob/master/public/images/github/register.jpg)

### Adding a quote
If you want to add a quote you need to be logged in and will be redirected to the login page if you are not logged in. 

![Adding a quote when you are not logged in](https://github.com/rvdpas/quote-app/blob/master/public/images/github/add-quote.jpg)

If you succesfully logged in your account you can create a quote. It has two main field, the name of the author and the quote textarea to enter the quote. After you've filled in these fields you can select a tag to categorize them.

![Adding a quote when you are logged in](https://github.com/rvdpas/quote-app/blob/master/public/images/github/add-quote-logged-in.jpg)

### Rate quotes
When you are logged in and you want to rate a quote someone else posted you have to go to the quote detail page by clicking the name of the author. In the bottom of the page there will be a review field where you can leave a review about the quote and give it a rating with stars.

![Review a quote](https://github.com/rvdpas/quote-app/blob/master/public/images/github/reviews.jpg)

### Hearted quotes
The hearted quotes functionality is only for logged in users. If you are logged in and click the heart on the quote you will like the quote. The quote will be saved on your hearted quotes page, where all your favourite quotes will be.

![Hearted quotes](https://github.com/rvdpas/quote-app/blob/master/public/images/github/hearted-quotes.jpg)

### The structure of the application 
The application is based on the MVC pattern which stand for model, view and controllers. 

- Model: Structures your data in a reliable form and prepares it based on controller’s instructions

- View: Displays data to user in easy-to-understand format, based on the user’s actions

- Controller: Takes in user commands, sends commands to the model for data updates, sends instructions to view to update interface.

![MVC pattern](https://github.com/rvdpas/quote-app/blob/master/public/images/github/mvc.png)

### Saving subjects in the database
To save a user or a quote in the database you need to create a collection. Mongodb has a good documentation page where they explain how to put this all in practise. Below you will find the code on how I saved a new user to the database.

```
const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please Supply an email address'
  },
  name: {
    type: String,
    required: 'Please supply a name',
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  hearts: [
    { type: mongoose.Schema.ObjectId, ref: 'Quote' }
  ]
});
```

### Routes
In the routes folder we create all the different routes a user can visit. An example of how this code looks is shown down below.
```
router.get('/quotes', catchErrors(quoteController.getQuotes));
```

I gave the route a callback to check if there are any errors before loading the content on the page. If a user for instance wants to add an quote, but he is not logged in, he will get a nicely displayed error.

### Wishlist
- Let user create their own tags

### Tooling
- [MVC](https://medium.freecodecamp.org/model-view-controller-mvc-explained-through-ordering-drinks-at-the-bar-efcba6255053)
- [Mongodb](https://docs.mongodb.com/manual/core/databases-and-collections/)
- [Nodejs](https://nodejs.org/en/)
- [Dotenv](https://www.npmjs.com/package/dotenv)
- [Express](https://expressjs.com/)
- [Async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [Pug](https://pugjs.org/api/getting-started.html)

### Installation
Clone or download the repository  
```
git clone https://github.com/rvdpas/quote-app.git
```

Run npm install in the root folder  
```
npm install
```

Create an .env file and make sure you have the correct details

Start the server and visit the chat app on localhost:3000
```
npm start
```
