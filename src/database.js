//Permite la conexión a la base de datos

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/notasdb')
        .then( ()=>{
            console.log("Conectado a la base de datos")
        })
        .catch( (err)=>{
            console.log(err);
        })