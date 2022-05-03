require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Redis = require('redis');




//-------------Redis config
// const redisClient = Redis.createClient({
//     //When commented data will be saved on local Redis instance (there should be much faster response)
//     url: process.env.REDIS_URL,
//     password: process.env.REDIS_PASSWORD,
//     legacyMode: true            //Need this 1 -this is connected
// });

const redisClient = Redis.createClient({
    legacyMode: true
});

redisClient.on('error', err => {
    console.log( err);
});

redisClient.connect();          //Need this 2  - this is connected


//----------server config
const app = express()
app.use(express.urlencoded({ extended: true}))
app.use(cors())
LAN_PORT = 3000;

//----------website config
app.get('/photos', async( req, res) => {

    const albumId = req.query.albumId;

    redisClient.get('photos', async (error, photos) => {
        if(error) console.log(error)
        if(photos != null) {
            console.log('Cache hit');
            return res.json(JSON.parse(photos));
        }else {
            console.log('Cache Miss');
            const { data } = await axios.get(
                'https://jsonplaceholder.typicode.com/photos',
                { params: { albumId }}
            )
             //-----redis save data
            redisClient.set('photos', JSON.stringify(data));
            res.json(data)
        }
    })
})

app.get("/photos/:id", async(req, res) => {
    console.log(req.params.id);
    const { data } = await axios.get(
        "https://jsonplaceholder.typicode.com/photos/" + req.params.id
    )

    res.json(data)
})


//------------------SERVER CONFIG ----------------------
let port = process.env.PORT; 
if (port == null || port == ''){
    port = LAN_PORT;
}
app.listen(port, function(){
    console.log('Server has started successfuly on port '+ port);
});
