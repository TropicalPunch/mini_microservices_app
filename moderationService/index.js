const express = require('express');
//const bodyParser = require('body-parser');==>deprecated
const axios = require('axios');

const app = express();
//app.use(bodyParser.json());
app.use(express.json()); 

app.post('/events', async (req,res)=>{
    const { type, data} = req.body;
    if(type === "CommentCreated"){
        const status = data.comment.includes('fuck') ? 'CommentRejected' : 'CommentApproved';
     //post the the moderated -comment- data to the event bus
        await axios.post('http://event-bus-srv:4005/events' ,{
            type: 'CommentModerated',
            data:{
                id: data.id,
                postId: data.postId,
                status,
                comment: data.comment
            }
        })
    }
    res.send({})
})

app.listen(4003 , ()=>{
    console.log('comment moderator service is running and listenning on port 4003')
})
