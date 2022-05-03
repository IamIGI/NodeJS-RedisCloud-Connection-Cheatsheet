require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Redis = require('redis');




//-------------Redis config
//---------------CLOUD REDIS------------------------------------
const redisClient = Redis.createClient({
    //When commented data will be saved on local Redis instance (there should be much faster response)
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
    legacyMode: true            //Need this 1 -this is connected
});
//--------------------------------------------------------

//---------------LOCAL REDIS------------------------------
// const redisClient = Redis.createClient({
//     legacyMode: true
// });
//--------------------------------------------------------

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
    const photos = await getOrSetCache('photos/albumId='+ albumId, async () => {
        const { data } = await axios.get(
            'https://jsonplaceholder.typicode.com/photos',
            { params: { albumId }}
        )
        return data
    })
    res.json(photos)
})

app.get("/photos/:id", async(req, res) => {
    console.log(req.params.id);

    const photo = await getOrSetCache('photos:' + req.params.id, async () => {
        const { data } = await axios.get(
            "https://jsonplaceholder.typicode.com/photos/" + req.params.id
        )
        return data
    })

    res.json(photo)
})


function getOrSetCache(key, callback){
    return new Promise((resolve, reject) => {
        redisClient.get(key, async (error, data) => {
            if (error) return reject(error)
            if (data != null) {
                console.log('Cache HIT');
                return resolve(JSON.parse(data))
            } else {
                console.log('Cache MISS');
                const freshData = await callback()
                redisClient.set(key, JSON.stringify(freshData))
                resolve(freshData)
            }
            
        })
    })
}

//------------------SERVER CONFIG ----------------------
let port = process.env.PORT; 
if (port == null || port == ''){
    port = LAN_PORT;
}
app.listen(port, function(){
    console.log('Server has started successfuly on port '+ port);
});
