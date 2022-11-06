//Permite la conexión a la base de datos

const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.MONGODB_URL
mongoose.connect(url)
        .then( ()=>{
            console.log("Conectado a la base de datos")
        })
        .catch( (err)=>{
            console.log(err);
        })
        