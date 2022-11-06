//Contiene las rutas principales de la aplicación
// /about   /error  /<--Ruta raiz de la app

const express = require('express');
const router = express.Router();

//localhost:3000/
router.get('/', function(req, res){
    //res.send('<H1>Saludos Servidor Web</H1>');
    res.render('index');
});

//localhost:3000/about
router.get('/about', function(req, res){
    //res.send('Acerca de...');
    res.render('about');
});

module.exports = router;