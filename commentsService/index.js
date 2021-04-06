const express = require('express');
//const bodyParser = require('body-parser');-->deprecated
const {randomBytes} = require('crypto');
const cors = require('cors'); //cors allow us to make rquests with different url/ localhost with different port number
const app = express();
const axios = require('axios');

//app.use(bodyParser.json()); ==>deprecated
app.use(express.json()); 
app.use(cors());

//each comment will have {id:,content:}
const commentsByPostId = {}; //specific comment will have a set of specific comments, each has an id

app.get('/posts/:id/comments',(req,res)=>{

    res.status(200).send(commentsByPostId[req.params.id] || []);
})

app.post('/posts/:id/comments',async (req,res)=>{
 const commentId = randomBytes(4).toString('hex');
 const {comment} = req.body; //extract from the body of the request
 
 const comments = commentsByPostId[req.params.id] || []; //req.params.id --> will give us access to the /:id in the url--> the specific post id if it has any comments
 
 comments.push({id: commentId, comment, status:'PendingCommentModeration'});
 commentsByPostId[req.params.id] = comments; //re asign with the new comments array!
 console.log(comments)

 //emitting an event to the eventbus, as soon as a comment is created!
 await axios.post('http://event-bus-srv:4005/events', {
     type:"CommentCreated",
     data:{
        id: commentId,
        comment,
        postId: req.params.id,
        status:'PendingCommentModeration'
     }
 })

 res.status(200).send(comments);
});

app.post('/events', async (req,res)=>{
    console.log('recieved event with type of :', req.body.type);
    
    const {type, data} = req.body;
    if(type === 'CommentModerated'){
        //pull data from the event sent regarding a new comment
        const {postId, id , status, comment} = data;
        //get specific comments from the DB by post id!
        const comments = commentsByPostId[postId];

        const specificComment = comments.find( obj =>{
            return obj.id === id;
        });
        //update status of the comment by the data sent from the event bus
        specificComment.status = status;
        //send the updated post (moderated comment) to our event bus 
        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentUpdated',
            data:{
                id,
                status,
                postId,
                comment
            }
        })


    }

    res.send({})
})

app.listen(4001, ()=>{
    console.log('comment service is listening on port 4001')
})