const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username
  const password = req.body.password

  if (username && password) {
    if (!isValid(username)) {
      users.push({"username": username, "password": password});
      return res.json({message: `User ${username} has been successfully registered. Now you can log in!`});
    }
    return res.status(400).json({message: `User ${username} already exists!`});
  }
  return res.status(400).json({message: "Unable to register user!"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  let getBookList = new Promise((resolve, reject) => {
    if (books) {
      resolve()
    } else {
      reject("There are no books in the list!")
    }
  })

  getBookList.then(
    () => {
      return res.json(books);
    },
    (msg) => {
      return res.json({message: msg});
    }
  )
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  let getBookDetails = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn])
    } else {
      reject(`Book with ISBN ${isbn} not found!`)
    }
  })

  getBookDetails.then(
    (details) => {
      return res.json(details)
    },
    (msg) => {
      res.status(404).json({message: msg})
    }
  )
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let getBookDetailsAuthor = new Promise((resolve, reject) => {
    if (author) {
      resolve(author)
    } else {
      reject(`Error author!`)
    }
  })

  getBookDetailsAuthor.then(
    (author) => {
      let existedBooks = Object.entries(books).filter(([isbn, details]) => details.author === author)
      if (existedBooks.length > 0) {
        existedBooks = Object.fromEntries(existedBooks);
        return res.json(existedBooks);
      }
      return res.status(404).json({message: `Book with author ${author} not found!`});
    },
    (msg) => {
      res.status(404).json({message: msg})
    }
  )
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let getBookDetailsTitle = new Promise((resolve, reject) => {
    if (title) {
      resolve(title)
    } else {
      reject(`Error book title!`)
    }
  })

  getBookDetailsTitle.then(
    (title) => {
      let existedBooks = Object.entries(books).filter(([isbn, details]) => details.title === title)
      if (existedBooks.length > 0) {
        existedBooks = Object.fromEntries(existedBooks);
        return res.json(existedBooks);
      }
      return res.status(404).json({message: `Book with title ${title} not found!`});
    },
    (msg) => {
      res.status(404).json({message: msg})
    }
  )
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.json(books[isbn].reviews)
  }
  return res.status(404).json({message: `Book with ISBN ${isbn} not found!`});
});

module.exports.general = public_users;
