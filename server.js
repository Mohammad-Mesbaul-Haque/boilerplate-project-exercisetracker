const express = require('express')
const app = express()


// Middleware
app.use(express.urlencoded({extended:false}));
app.use(express.json());
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

// models
const UserInfo = mongoose.model('UserInfo', userSchema);
const ExerciseInfo = mongoose.model('ExerciseInfo', exerciseSchema);
const logInfo = mongoose.model('LogInfo', logsSchema);

// connect with database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
    })
        .then(() => console.log("Connected to mongodb atlas!"))
        .catch((err) => console.log(err));


app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Api Endpoint

 app.post('/api/users', (req, res)=>{
   UserInfo.find({'username':req.body.username}, (err, userData)=>{
     if (err) {
       console.log("Error occur", err);
     } else{
       if (userData.length === 0) {
         const test = new UserInfo({
           "_id": req.body.id,
           "username": req.body.username
         })
         // Save to database
         test.save((err, data)=>{
           if (err) {
             console.log(`Error Saving data! ${err}`);
           } else {
             res.json({
               "_id": data.id,
               "username": data.username
             })
           }
         })
        }else{
          res.send('Username already exist!')
        }
     }
   })
 })



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
