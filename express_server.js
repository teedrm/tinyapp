const express = require("express");
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
// Setting ejs as the view engine to tell EXpress app to use EJS as its templating engine
app.set("view engine", "ejs");

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
    res.send("Hello!"); // Welcome page/ root path will say Hello
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req,res) => {
    res.render("urls_new");
})

app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
    res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id]
    res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id]
    res.redirect("/urls");
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

// implement a function that returns a string of 6 random alphanumeric characters
function generateRandomString() {
    return Math.random().toString(36).slice(2,8);
};

console.log(generateRandomString())