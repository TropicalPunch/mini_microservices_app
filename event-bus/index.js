const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
 //important**we must catch error so server wont crash when we take down a server to test the event syncing machanisem
const app = express();
app.use(express.json());

//implementing event sync- if a service is down it can check which events it missed during that time
const allEvents = [];

app.post('/events', (req,res)=>{
    const event = req.body;

    //filling the events DB with data
    allEvents.push(event)

    //emitting event to all services 
    //emitting event to posts pod in kubernetes by emitting it to the cluster ip service!!! instead of local host
    axios.post('http://posts-clusterip-srv:4000/events', event).catch((err)=>{
        console.log(err.message)
    });
    axios.post('http://comments-srv:4001/events', event).catch((err)=>{
        console.log(err.message)
    });
    axios.post('http://query-srv:4002/events', event).catch((err)=>{
        console.log(err.message)
    });
    axios.post('http://moderation-srv:4003/events', event).catch((err)=>{
        console.log(err.message)
    });
    
    res.send({status: 'OK'});
});
//a service will make this request if he was doen and need to check for events he missed
app.get('/events',(req,res)=>{
res.send(allEvents)
})

app.listen(4005, ()=>{
    console.log('event bus is listening on port 4005 and posting events to all microservices!')
})