const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;
const { checkEmailAvailable } = require("./helpers");

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

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
    password: bcrypt.hashSync("to123", 10)
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "meo@example.com",
    password: bcrypt.hashSync("meo123", 10)
  },
  bumblebee: {
    id: "bumblebee",
    email: "bum@example.com",
    password: bcrypt.hashSync("bum123", 10)
  }
};

// ----------------- HELPER FUNCTIONS ----------------------
function generateRandomString() {
  return (Math.random() + 1).toString(36).slice(2,8);
}



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
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// HOME - URL PAGE
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
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
  const userID = req.session.user_id;
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
    user: users[req.session.user_id]
  };
  if (templateVars.user) {
    return res.render("urls_new", templateVars);
  }
  res.render("login", templateVars);
});

// LINK TO ID-WEBSITE
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const currentUserID = req.session.user_id;

  if (urlDatabase[id].userID !== currentUserID) {
    return res.status(401).send("Do not have permission to view URL");
  }
  if (!urlDatabase[id]) {
    return res.status(404).send("URL ID does not exist");
  }
  if (!currentUserID) {
    return res.status(401).send("Log in to view URLs");
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {

  const id = req.params.id;
  const currentUserID = req.session.user_id;

  if (urlDatabase[id].userID !== currentUserID) {
    return res.status(401).send("Do not have permission to view URL");
  }
  if (!urlDatabase[id]) {
    return res.status(404).send("URL ID does not exist");
  }
  if (!currentUserID) {
    return res.status(401).send("Log in to view URLs");
  }

  urlDatabase[id] = { longURL: req.body.longURL, userID: req.session.user_id};
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


// DELETE
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const currentUserID = req.session.user_id;

  if (urlDatabase[id].userID !== currentUserID) {
    return res.status(401).send("Do not have permission to view URL");
  }

  if (!urlDatabase[id]) {
    return res.status(404).send("URL ID does not exist");
  }
  if (!currentUserID) {
    return res.status(401).send("Log in to delete URL");
  }


  delete urlDatabase[id];
  res.redirect("/urls");
});

// REGISTRATION
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (templateVars.user) {
    res.redirect("/urls");
  }
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const registerEmail = req.body.email;
  const registerPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(registerPassword, 10);
  const id = generateRandomString();

  if (checkEmailAvailable(registerEmail, users)) {
    res.status(400).send("Email is taken. Try another");
  }

  if (registerEmail === "" || registerPassword === "") {
    res.status(400).send("Please fill in the empty spaces");
  }

  users[id] = {
    id: id,
    email: registerEmail,
    password: hashedPassword
  };

  req.session.user_id = users[id].id;
  // console.log('users', users);
  res.redirect("/urls");
});

// LOGIN
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
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
  const user = checkEmailAvailable(userEmail, users);

  if (!user) {
    return res.status(403).send("User cannot be found");
  }

  if (!bcrypt.compareSync(userPassword, users[user].password)) {
    return res.status(403).send("Incorrect password");
  }

  req.session.user_id = user;
  res.redirect("/urls");
});

// LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

