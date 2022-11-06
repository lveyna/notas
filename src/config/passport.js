//Manejo de sesiones de usuario
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//Importamos el modelo de datos
const Usuario = require('../model/Users');

passport.use(new LocalStrategy(
     {
       usernameField: 'email' 
     },
     //done es la variable donde regresamos la información de la autenticación

     async function(email, password, done){
         //Buscamos el usuario en la base de datos
         const usuario = await Usuario.findOne({email: email});
         if (!usuario){
             //null indica que no hay ningun error
             //false indica que no se encontro el usuario en la base de datos
             return done(null, false, {message: 'No se encontro el usuario'});
         }else {
             const coincide = await usuario.matchPassword(password);
             if (coincide){ //Si el password enviado coincide con el de la bd
                 //null indica que no hay ningún error
                 //usuario indica que se encontro un usuario con el email en la bd
                 //y que coincide con el password el formulario
                 return done(null, usuario);
             }else { //Contraseña incorrecta
                   //false es para indicar que el password es incorrecto
                return done(null, false, {message: 'Password incorecto'});
             }
         }//else
     }//async function
   )//new LocalStrategy
);

//función que serializa un usuario, crea una variable de sesión con los datos
//del usuario ya validado
passport.serializeUser( function (usuario, done){
    done(null, usuario._id);
});

//función que dado un id nos regrese sus datos del usuario
//obteniendoslos de la base de datos
passport.deserializeUser( function (id, done){
    //Obtenemos el usuario de la base de datos
    Usuario.findById(id, function(error, usuario){
        done(error, usuario);
    });
});
