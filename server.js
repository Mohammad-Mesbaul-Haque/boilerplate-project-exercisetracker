const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const {Schema } = mongoose;


// Schemas
const userSchema = new Schema({
  "username" : String,

})

const exerciseSchema = new Schema({
  "username" : String,
  "date" : Date,
  "duration" : Number,
  "description" : String
})

const logsSchema = new Schema({
  "username": String,
  "count": Number,
  "log" : Array
})



app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// My code starts here




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
