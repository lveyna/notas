//Contiene el archivo principal y el servidor Web
const express = require('express');
const path = require('path'); //Para utilizar rutas de archivos
const { engine } = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session'); //Sesiones del usuario
const flash = require('connect-flash'); //Envio de mensajes entre vistas
const passport = require('passport'); //Manejo de sesiones de usuario
 
//Inicializaciones
const app = express();
require('./database');
require('./config/passport');

//Configuraciones
app.set('puerto', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views')); //  /src/views
app.engine('.hbs', engine({
    defaultLayout: 'main',
    defaultDir: path.join('views', 'layouts'),
    partiaslsDir: path.join('views', 'partials'),
    extname: 'hbs',
    runtimeOptions:{
        allowProtoPropertiesByDefault:true
     },
   },
));

app.set('view engine', '.hbs');

//Middleware
app.use(express.urlencoded({extended: false}));
app.use(methodOverride('_method'));//DELETE, POST, PUT, GET
app.use(session({
    secret: 'mysecretapp',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


//Variables Globales
app.use(function( req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.usuario = req.user || null;
    
    next();
});

//Rutas
app.use(require('./routes/index')); //Rutas principales de la app
app.use(require('./routes/notes')); //Rutas para las notas /notas/add
app.use(require('./routes/users')); //Rutas para usuario /login

//Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

//Servidor
app.listen(app.get('puerto'), function(){
    console.log('Servidor corriendo en el puerto: ' +  app.get('puerto'));
}); 