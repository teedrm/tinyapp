const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

// ----------------- STORED DATA ----------------------
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  cheeto: {
    id: "cheeto",
    email: "to@example.com",
    password: "to123",
  },
  megatron: {
    id: "megatron",
    email: "meo@example.com",
    password: "meo123",
  },
  bumblebee: {
    id: "bumblebee",
    email: "bum@example.com",
    password: "bum123",
  }
};

// ----------------- HELPER FUNCTIONS ----------------------
function generateRandomString() {
  return (Math.random() + 1).toString(36).slice(2,8);
};

// Check if email used for registration already exist/used
function checkEmailAvailable(newEmail, storedData) {
  for (const user in storedData) {
    if (storedData[user].email === newEmail) {
      return false;
    }
  }
  return true;
};

//------------------------------------------------------------

app.get("/", (req, res) => {
  res.send("Hello!"); 
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// HOME
app.get("/urls", (req, res) => {
   const templateVars = { urls: urlDatabase, user: req.cookies["user_id"]};
    res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const randomStr = generateRandomString();
  urlDatabase[randomStr] = req.body.longURL;
  res.redirect(`urls/${randomStr}`);
});

app.get("/urls/new", (req,res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// REGISTRATION
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("register");
});

app.post("/register", (req, res) => {
  const registerEmail = req.body.email;
  const registerPassword = req.body.password;
  const id = generateRandomString();

  if (registerEmail === "" || registerPassword === "") {
    res.status(400).send("Please fill in the empty spaces");
  };

  if (!checkEmailAvailable(registerEmail, users)) {
    res.status(400).send("That email is taken. Try another")
  }

  users[id] = {id: id, email: registerEmail, password: registerPassword};
  res.cookie('user_id', users[id].id);
  console.log('users', users);
  res.redirect("/urls");
});

// LOGIN
app.get("/login", (req, res) => {
  res.render('login');
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    res.clearCookie('username', req.cookies["username"])
    res.redirect("/urls")
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

