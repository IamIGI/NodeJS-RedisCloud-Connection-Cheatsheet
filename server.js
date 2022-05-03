require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Redis = require('redis');




//-------------Redis connection
const redisClient = Redis.createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD
});

redisClient.on('error', err => {
    console.log( err);
});


//----------server config
const app = express()
app.use(express.urlencoded({ extended: true}))
app.use(cors())
LAN_PORT = 3000;

//----------website config
app.get('/photos', async( req, res) => {
    
    const albumId = req.query.albumId;
    const { data } = await axios.get(
        'https://jsonplaceholder.typicode.com/photos',
        { params: { albumId }}
        )


    //-----redis save data
    await redisClient.connect();
    await redisClient.set('photos', 'costamcostam');
    // await redisClient.set('photos', JSON.stringify(data));
    const value = await redisClient.get('photos')
    console.log(value);

    res.json(data)
})

app.get("/photos/:id", async(req, res) => {
    console.log(req.params.id);
    const { data } = await axios.get(
        "https://jsonplaceholder.typicode.com/photos/" + req.params.id
    )

    res.json(data)
})


//------------------SERVER CONFIG [ CLOSE CONNECTION ]----------------------
let port = process.env.PORT; 
if (port == null || port == ''){
    port = LAN_PORT;
}
app.listen(port, function(){
    console.log('Server has started successfuly on port '+ port);
});
