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
}

// Check if email used for registration already exist/used
const checkEmailAvailable = (newEmail) => {
  for (const user in users) {
    if (newEmail === users[user].email) {
      return users[user].id;
    }
  }
  return false;
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
  const templateVars = {
    urls: urlDatabase,
    user: req.cookies["user_id"]};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.status(401).send("Login to shorten URL");
  } else {
    const randomStr = generateRandomString();
    urlDatabase[randomStr] = {
      longURL: req.body.longURL,
      userID: req.cookies["user_id"]
    };
    res.redirect(`urls/${randomStr}`);
  }
});

app.get("/urls/new", (req,res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  }
  res.render("login", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {

  if (!urlDatabase[req.params.id]) {
    res.status(404).send("URL ID does not exist");
  }
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
  };
  if (templateVars.user) {
    res.redirect("/urls");
  }
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const registerEmail = req.body.email;
  const registerPassword = req.body.password;
  const id = generateRandomString();

  if (registerEmail === "" || registerPassword === "") {
    res.status(400).send("Please fill in the empty spaces");
  }

  if (checkEmailAvailable(registerEmail)) {
    res.status(400).send("That email is taken. Try another");
  }

  users[id] = {id: id, email: registerEmail, password: registerPassword};
  res.cookie('user_id', users[id].id);
  console.log('users', users);
  res.redirect("/urls");
});

// LOGIN
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const user = checkEmailAvailable(userEmail);
  
  if (!user) {
    res.status(403).send("User cannot be found");
  }

  if (userPassword !== users[user].password) {
    res.status(403).send("Incorrect password");
  }

  res.cookie("user_id", user);
  res.redirect("/urls");
});

// LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

