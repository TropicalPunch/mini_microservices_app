const express = require('express');
const bodyParser = require('body-parser');
const {randomBytes} = require('crypto'); // crypto is a node package used to generate random id numbers (like uuid)
const cors = require('cors');//cors allow us to make rquests with different url/ localhost with different port number
const axios = require('axios');

const app = express();
app.use(express.json()); //will parse all the Json data that's sent to the server
app.use(cors());

const posts = {}; //here we will store our posts (will bedeleted on each run but it's ok for now)
//a post will be ==> {title: 'string'}

// app.get('/posts',(req,res)=>{
//  res.send(posts);
//  console.log(posts)
// });

app.post('/posts/create',async (req,res)=>{
 const id = randomBytes(4).toString('hex') //4- 4 bytes of random data
 const {title} = req.body; // extrct the title from the body.

 posts[id] = { //add a new key[value] pair {id :{ id: ,title: }} to the collection of all the posts.
     id,
     title
 };

    //emitting an event to the event bus as soon as a post is added to the DB
    //  await axios.post('http://localhost:4005/events',{
    //      type:'PostCreated',
    //      data:{ id , title}
    //  });

 //emitting the event to the kubernetes event-bus cluster ip service!!! its url is its metadata given name:
 //terminal in k8 folder--> kubectl get services==> event-bus-srv 
 await axios.post('http://event-bus-srv:4005/events',{
     type:'PostCreated',
     data: { id , title}
 });

 res.status(201).send(posts[id,title])
 console.log(posts)
});

app.post('/events', (req,res)=>{
    console.log('recieved event with type of :', req.body.type);
    res.send({})
})

app.listen(4000, ()=>{
    console.log('listening on port 4000')
    console.log('an update to posts- will be pushed ')
});