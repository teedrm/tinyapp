const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

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

function generateRandomString() {
  return (Math.random() + 1).toString(36).slice(2,8);
};

app.get("/", (req, res) => {
  res.send("Hello!"); 
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = req.cookies["user_id"]
  if (!user) {
    res.status(401)
  } else {
    const templateVars = { urls: urlDatabase, user: req.cookies["user_id"]};
    res.render("urls_index", templateVars);
  }

});

app.get("/urls/new", (req,res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log("REQ BODY", req.body);
  const randomStr = generateRandomString();
  urlDatabase[randomStr] = req.body.longURL;
  res.redirect(`urls/${randomStr}`);
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
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const id = generateRandomString();

  users[id] = {id: id, email: userEmail, password: userPassword};
  res.cookie('user_id', users[id].id);
  console.log('users', users);
  res.redirect("/urls");
});

// LOGIN
// app.get("/login", (req, res) => {
//   res.render('login');
// });

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

// app.post("/login", (req, res) => {

//   const testEmail = req.body.email;
//   const testPassword = req.body.password;

//   if (testPassword === users[testEmail].password)  {
//     res.setCookie('user', testEmail);
//     res.redirect("/urls");
//   } else {
//     res.redirect('/login');
//   }
// });

app.post("/logout", (req, res) => {
    res.clearCookie('username', req.cookies["username"])
    res.redirect("/urls")
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

