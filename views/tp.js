//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parse');
const ejs = require('ejs');
const mongoos = require('mongoose');

express.use(bodyParser.urlencoded({
  extended:true
}));
express.use('view engine','ejs');
const modelUser ={
  Name :String,
  Id: Number
};
userDB = mongoos.Model('user',modelUser);
