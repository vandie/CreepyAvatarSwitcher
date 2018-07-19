// Includes
const express = require('express')
const cookieParser = require('cookie-parser')
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

//set up server object and uses
const app = express()
app.use(cookieParser())

//hash Function for obsfication of cookies
function hashName(name) {
  let key = name.split("").reverse().join("")
  return crypto.createHmac('sha256', key)
    .update(name)
    .digest('hex')
}

//cache to disable caching
function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  res.header('Expires', '-1')
  res.header('Pragma', 'no-cache')
  next()
}

//Get Correct file and make use of cookies
function GetAvatar(req,res) {
  let fileName = req.params.img //get file name from URL
  let refrence = hashName(fileName); //get hash of file name as a refrence
  let cookie = req.cookies[refrence] //get any cookie that currently exists on that refrence
  if(
    fs.existsSync(path.join(__dirname, '/img/'+fileName+'.jpg')) &&
    fs.existsSync(path.join(__dirname, '/img/'+fileName+'.gif'))
  ){ // if both valid images exist on the system

    if(cookie){ //if the cookie exists
      res.sendFile('/img/'+fileName+'.jpg', { root: __dirname }) //send the standard image
    } else { //if the cookie does not currently exist
      let oneDay = (1000 * 60 * 60 * 24) //get the current length of a day in ms
      res.cookie(refrence, true, {expire: (oneDay * 5) + Date.now()})//set a cookie on the selected refrence that times out after 5 days
      res.sendFile('/img/'+fileName+'.gif', { root: __dirname })// send the "horrifying" gif instead of the standard image
    }

  } else {

    res.send('Error: No valid avatar stored on system...', 404) // send a 404 with an error message

  }

}

//set up route with nocache and the get Avatar function
app.get('/avatar/:img', nocache, GetAvatar);

//launch server
app.listen(3222, () => console.log('Gif Time'))
