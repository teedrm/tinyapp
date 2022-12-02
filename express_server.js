const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

// ----------------- STORED DATA ----------------------
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.lighthouselabs.ca",
    userID: "aJ46lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  aJ46lW: {
    id: "aJ46lW",
    email: "to@example.com",
    password: "to123",
  },
  aJ48lW: {
    id: "aJ48lW",
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

const urlsForUser = (id) => {
  const userURL = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userURL[key] = urlDatabase[key];
    }
  }
  return userURL;
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
  const id = req.cookies.user_id;
  const user = users[id];
  if (!user) {
    return res.status(401).send("Please log in to view URLs");
  }

  const urls = urlsForUser(id);
  console.log(urls);

  const templateVars = {urls, user};

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  if (!user) {
    return res.status(401).send("Login to shorten URL");
  }

  // console.log('postURLs', req.body);

  const randomStr = generateRandomString();
  urlDatabase[randomStr] = {
    longURL: req.body.longURL,
    userID
  };

  console.log(urlDatabase);

  res.redirect(`urls/${randomStr}`);
});

// ADD NEW URL
app.get("/urls/new", (req,res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  if (templateVars.user) {
    return res.render("urls_new", templateVars);
  }
  res.render("login", templateVars);
});

// LINK TO ID-WEBSITE
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const currentUserID = req.cookies.user_id;

  if (!urlDatabase[id]) {
    return res.status(404).send("URL ID does not exist");
  }
  if (!currentUserID) {
    return res.status(401).send("Log in to view URLs");
  }
  if (urlDatabase[id].userID !== currentUserID) {
    return res.status(401).send("Do not have permission to view URL");
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {

  const id = req.params.id;
  const currentUserID = req.cookies.user_id;

  if (!urlDatabase[id]) {
    return res.status(404).send("URL ID does not exist");
  }
  if (!currentUserID) {
    return res.status(401).send("Log in to view URLs");
  }
  if (urlDatabase[id].userID !== currentUserID) {
    return res.status(401).send("Do not have permission to view URL");
  }

  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

// ACCESSING WEBSITE LINK
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  
  if (!urlDatabase[id]) {
    return res.status(404).send("URL ID does not exist");
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});


app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const currentUserID = req.cookies.user_id;

  if (urlDatabase[id].userID !== currentUserID) {
    return res.status(401).send("Do not have permission to view URL");
  }

  if (!urlDatabase[id]) {
    return res.status(404).send("URL ID does not exist");
  }
  if (!currentUserID) {
    return res.status(401).send("Log in to view URLs");
  }


  delete urlDatabase[id];
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

