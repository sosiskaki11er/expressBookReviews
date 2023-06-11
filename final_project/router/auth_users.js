const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  {"username": "admin", "password": "admin"},
];

const isValid = (username)=>{ 
  let existedUser = users.filter((user) => {
    return user.username === username;
  });
  return existedUser.length > 0 ? true : false;
}

const authenticatedUser = (username,password)=>{ 
  let validUsers = users.filter((user) => user.username === username && user.password === password);
  return validUsers.length > 0 ? true : false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Error logging in. Please check username and password!"})
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', {expiresIn: 60 * 60});

    req.session.authorization = { accessToken, username }
    return res.json({message: "User successfully logged in!"})
  }
  return res.status(208).json({message: "Invalid Login. Please check username and password!"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    const reviewer = req.session.authorization['username'];
    const newReview = req.query.review;
    let bookReviews = books[isbn].reviews; 
    bookReviews[reviewer] = newReview;
    return res.json({message: `Review has been added successfully!`, 
                     currentUser: reviewer, 
                     bookDetails: {"isbn": isbn, ...books[isbn]}});
  }
  return res.status(404).json({message: `Book with ISBN ${isbn} not found!`});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    const reviewer = req.session.authorization['username'];
    let bookReviews = books[isbn].reviews; 
    delete bookReviews[reviewer];
    return res.json({message: `Review has been deleted successfully!`, 
                     currentUser: reviewer, 
                     bookDetails: {"isbn": isbn, ...books[isbn]}});
  }
  return res.status(404).json({message: `Book with ISBN ${isbn} not found!`}); 
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
