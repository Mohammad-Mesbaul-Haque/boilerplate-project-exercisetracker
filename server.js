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

// exercise  post endpoint
app.post('/api/users/:_id/exercises', (req, res)=>{
  let idJson = {"id": req.params._id};
  let checkedDate = new Date(req.body.date);
  let idToCheck = idJson.id;

  let noDateHandler = ()=>{
    if (checkedDate instanceof Date && !isNaN(checkedDate)) {
      return checkedDate;
    }else{
      return checkedDate = new Date();
    }
  }

  UserInfo.findById(idToCheck, (err, data)=>{
    noDateHandler(checkedDate)
    if (err) {
        console.log('Error with id', err); 
      } else {
         const test = new ExerciseInfo({
           "username": data.username,
           "description": req.body.description,
           "duration": req.body.duration,
           "date": checkedDate.toDateString()
         })

         test.save((err, data)=>{
           if (err) {
             console.log("error saving exercise", err);
           }else{
             console.log("Saved exercise successfully");
             res.json({
               "_id": idToCheck,
               "username": data.username,
               "description": data.description,
               "duration": data.duration,
               "date": data.date.toDateString()
             })
           }
         })
     }
  })

})

// Logs endpoint
app.get('/api/users/:_id/logs', (req, res)=>{
  // grab all the query params
  const {from, to, limit} = req.query;
   let idJson = {"id": req.params._id}
    let idToCheck = idJson.id

    // Check id and process
    UserInfo.findById(idToCheck, (err, data)=>{
      let query = {
        username: data.username,
      }
// Configuring from , to  query
      if(from !== undefined && to === undefined){
        query.date = { $gte : new Date(from)}
      } else if (to !== undefined && from === undefined){
        query.date = { $lte : new Date(to)}
      } else if(from !== undefined && to !== undefined) {
        query.date = { $gte: new Date(from), $lte: new Date(to)}
      }

      let limitChecker = (limit)=>{
        let maxLimit = 100;
        if (limit) {
          return limit; 
        } else {
          return maxLimit; 
        }
      }
if (err) {
  console.log(`Error happened in ${req.path} request err: ${err}`);
} else {
  ExerciseInfo.find((query), null, {limit: limitChecker(+limit)}, (err, doc)=>{
    let loggedArray = [];
    if (err) {
      console.log(`Error ${err}`);
    } else {
// two data parameter conflicting so parameter name changed to doc here.
      let document = doc;
      loggedArray = document.map((item)=>{
        return {
          "description": item.description,
          "duration": item.duration,
          "date": item.date.toDateString()
        }
      })

      const test  = new logInfo({
        "username": data.username,
        "count": loggedArray.length,
        "log": loggedArray
      })
      test.save((err, data)=>{
        if (err) {
          console.log(`error: ${err} in path: ${req.path}`);
        } else{
          console.log(`saved exercise successfully!`);
          res.json({
            "_id": idToCheck,
            "username": data.username,
            "count": data.count,
            "log": loggedArray
          })
        }
      })

    }  
  })
}
    }) 
})


//  Get all users endpoint
app.get('/api/users', (req, res)=>{
  UserInfo.find({},(err, data)=>{
    if (err) {
      res.send('No users found')
    }else{
      res.json(data)
    }
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
