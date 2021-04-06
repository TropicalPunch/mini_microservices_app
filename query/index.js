// no axios needed in the query service
const express = require('express');
//const bodyPrser = require('body-parser'); -->deprecated
const cors = require('cors');
const axios = require('axios');


const app = express();
//app.use(bodyPrser.json());
app.use(express.json())
app.use(cors());

const posts = {}; //the query DB

const handleEvents = (type, data)=>{
   
    if(type === 'PostCreated'){
        const {id, title} = data;
        posts[id] = {id, title, comments:[]} //create the asset in the query DB! with an empty comments array!
    }

    if(type === 'CommentCreated'){
        const {id, comment, postId, status} = data;
        const post = posts[postId];  //from the query DB
        post.comments.push({id, comment, status});
        
        console.log(posts)        
    }

    //we got this data from the event bus
    if(type === 'CommentUpdated'){
        const {id, comment, postId, status} = data;
        const post = posts[postId];  //from the query DB
        const commentByid = post.comments.find(specificComment =>{
            return specificComment.id === id; 
        }) 
        //give it a new status !
       commentByid.status = status;
       //just in case the comment content was updated as well.
       commentByid.comment = comment;      
        
    } 
}


app.get('/posts', (req,res)=>{ //returns all the posts in the query DB
 res.send(posts);  

});

//post data to the query service DB
app.post('/events', (req,res)=>{
    const {type, data} = req.body;
    handleEvents(type, data)
   
    res.send({})
})

app.listen(4002,async ()=>{
    try{

        console.log('query service is listening on post 4002')
        //when the service will re launch, it will make a request to the event bus for all the events exists
        const res = await axios.get('http://event-bus-srv:4005/events')
       //iteratting over all the events we recieved:
        for (let event of res.data){
            console.log('processing event:', event.type);
            handleEvents(event.type, event.data)
        }
    }catch (err){
        console.error(err.message)
    } finally {
        console.log('query service is up after event sync');
    }

});