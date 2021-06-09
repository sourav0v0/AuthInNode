//jshint esversion:6
require('dotenv').config();
const express  = require('express');
const bodyParser = require('body-parser');
const ejs =require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const app = express();
const bcrypt = require('bcrypt');
const salt = 10 ;
app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
  extended:true
}));

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true,useUnifiedTopology: true });
const modeUser = new mongoose.Schema({
  name:String,
  password:String
});
const User =new mongoose.model('user',modeUser);

app.get("/",(req,resp)=>{
  resp.render('home.ejs');
});
app.get("/home",(req,resp)=>{
  resp.render('home.ejs');
});
app.get("/login",(req,resp)=>{
  resp.render('login.ejs');
});
app.get('/logout',(req,resp) => {
  resp.render('home.ejs');
});
app.get("/register",(req,resp) =>{
  resp.render('register.ejs');
});
app.post("/register",(req,resp)=>{
  var name =req.body.username;
  bcrypt.hash(req.body.password,salt,(err,hash)=>{
    if(err)
    console.log(err);
    else{
    const userNew = new User({
      name : name,
      password : hash
    });
    userNew.save((err)=>{
      if(err)
      console.log(err);
      resp.render('secrets.ejs');
    });
  }
  });
});

app.post("/login",(req,resp)=>{
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({name:username},(err,data)=>{
    if(err)
    console.log(err);
    else{
      if(data){
        bcrypt.compare(password,data.password,(err,result)=>{
          if(err)
          console.log(err);
          else{
            if ( result === true)
            resp.render('secrets.ejs');
            else
            {
              console.log('fail to login ');
              resp.render('login.ejs');
            }
          }
        });
      }
      else {
        console.log("No data Found");
        resp.render('login.ejs');
      }
    }
  });
});

app.listen('3000',()=>{
  console.log(" Listening at port 3000");
  console.log(mongoose. connection. readyState);
});
