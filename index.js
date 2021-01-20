const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const User = require("./models/user");


mongoose.connect("mongodb://localhost:27017/authBcrypt", { useNewUrlParser: true , useUnifiedTopology: true })
    .then(() => {
        console.log("connected to db!");
    }).catch(err => {
        console.log("error", err);
    });

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
app.use(session({secret: "keepABetterSecretThanThis", resave: false, saveUninitialized: true}));

const isLogin = (req,res,next) => {
    if(!req.session.userId)
        res.redirect("/login");
    else
        next();
};

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const user = new User({username,password});
    await user.save();
    req.session.userId = user._id;
    res.redirect("/");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if(foundUser){
        req.session.userId = foundUser._id;
        res.redirect("/secret");
    }
    else{
        res.redirect("/login");
    }
});

app.get("/secret",isLogin, (req, res) => {
    res.render("secret");
});

app.get("/topsecret",isLogin, (req, res) => {
    res.render("topsecret");
});


app.post("/logout",(req,res)=>{
    req.session.userId = null;
    res.redirect("/login")
})
app.listen(3000, () => {
    console.log("Listening at 3000");
});