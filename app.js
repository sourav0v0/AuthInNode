//jshint esversion:6
require('dotenv').config();
const express  = require('express');
const bodyParser = require('body-parser');
const ejs =require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
  extended:true
}));
app.use(session({
  secret : "env.SECRET",
  resave : false,
  saveUninitialized : true,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true,useUnifiedTopology: true });
mongoose.set("useCreateIndex",true);
const userSchema = new mongoose.Schema({
  email:String,
  password:String,
  googleId:String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User =new mongoose.model('user',userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
     // findOrCreate is a user defined function to handel create or use
     // we havnt implemented STACKOVERFLOW has it for ref . We have used a package for this specific funtion
     console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user){
      return cb(err, user);
    });
  }
));
app.get("/",(req,res)=>{
  res.render('home.ejs');
});
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect("/secret");
  });
app.get("/home",(req,res)=>{
  res.render('home.ejs');
});
app.get("/login",(req,res)=>{
  res.render('login.ejs');
});
app.get('/logout',(req,res) => {
  req.logout();
  res.render('home.ejs');
});
app.get("/register",(req,res) =>{
  res.render('register');
});
app.get("/secret",(req,res)=>{
  if(req.isAuthenticated()){
    res.render("secrets");
  }
  else{
    console.log("Fail to Authentiacte");
    res.redirect("/register");
  }
});
app.post("/register",(req,res)=>{
  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secret");
      });
    }
  });
});
app.post("/login",(req,res)=>{
  var username = req.body.username;
  var password = req.body.password;
  const user = new User({
    username:username,
    password:password
  });
  req.login(user,function(err){
    if(err){
      console.log(err);
    }
    else {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secret");
      });
    }
  });
});

app.listen('3000',()=>{
  console.log(" Listening at port 3000");
  console.log(mongoose. connection. readyState);
});
