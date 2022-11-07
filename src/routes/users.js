//Contiene las rutas para el manejo de usuarios
//autenticarse  /login   /signing   /signout 

const express = require('express');
const passport = require('passport');

const router = express.Router();

const Usuario = require('../model/Users');

//Importamos la autenticación de usuarios
const { isAuthenticated } = require('../helpers/auth');

//Ruta para iniciar sesión
router.get('/users/signin', function(req, res){
    res.render('users/signin')
});

//Routa para registrarse en la app
router.get('/users/signup', function(req, res){
    res.render('users/signup')
})

//Ruta para guardar el formulario de registro en la base de datos
router.post('/users/signup', async function(req, res){
    const { nombre, email, password, confirmarpassword} = req.body;
    //console.log(req.body);
    const errores = []; //Arreglo para los errores en el registro de usuarios

    if (!nombre)
        errores.push({text: 'Por favor inserta el nombre'});
    if (!email)
        errores.push({text: 'Por favor inserta el email'});
    if (!password)
        errores.push({text: 'Por favor inserta el password'})
    if (password.length < 4)
        errores.push({text: 'La contraseña debe tener al menos 4 caracteres'});
    if (password != confirmarpassword)
        errores.push({text: 'Los passwords no coinciden'})
    if (errores.length > 0){ //Existe al menos un error en el formulario
        res.render('users/signup', 
                    {
                      errores,
                      nombre,
                      email,
                      password,
                      confirmarpassword
                    })
    }else { //No hay errores
        //Comprobamos que el email del usuario no exista en la base de datos
        const userEmail = await Usuario.findOne({email: email});
        if (userEmail){ //Si el userEmail existe en la base de datos
            errores.push({
                text: 'El email ya esta en uso, por favor elija uno diferente'
            });
            res.render('users/signup',
            {
                errores,
                nombre,
                email,
                password,
                confirmarpassword
            })
            return; //finaliza la función
        } //if userEmail
        const newUser = new Usuario({
            nombre,
            email,
            password,
            tipo: 1    //Usuario regular
        });

        //Encriptamos la contraseña
        newUser.password = await newUser.encryptPassword(password);

        //console.log(newUser);
        //Guardar el usuario en la base de datos
        await newUser.save()
                     .then( ()=>{
                         req.flash('success_msg', 'Usuario registrado de manera exitosa');
                         //Redirigimos el flujo de la app a iniciar sesión
                         res.redirect('/users/signin'); 
                       })
                     .catch( (err)=>{
                        console.log(err);
                        res.redirect('/error')
                     });
        //res.send("ok");
    }  
});//Fin del post /users/signup

//Ruta para autenticar usuarios del formulario
router.post('/users/signin', passport.authenticate('local', {
    //Si todo va bien, redireccionamos el flujo de la app a notas
    successRedirect: '/notes',
    //Si hay algún error en el inicio de sesión, lo redireccionamos a signin
    failureRedirect: '/users/signin',

    //Para enviar mensajes de error
    failureFlash: true
}));//Fin de post /users/signin

//Ruta para finalizar la sesión
router.get('/users/logout', function(req, res){
    //req.logout();
    //res.redirect('/');
    req.session.destroy(function (err) {
        if (err) {
            return next(err);
        }

        //Destruir los datos de la sesión
        req.session = null;

        //Hacer un redirect a la página principal
        res.redirect('/');
    });
});//Fin de /users/logout

//Ruta para mostrar todos los usuarios de la base de datos
router.get('/users', isAuthenticated, async function(req, res){
    await Usuario.find()
                 .then( (users)=>{
                     //console.log(users);
                     res.render('users/listar-usuarios', {users});
                 })
                 .catch( (err)=>{
                     console.log(err);
                     res.redirect('/error');
                 })
});//Fin de mostar todos los usuarios

//Ruta eliminar un usuario
router.get('/users/delete:id', isAuthenticated, async function(req, res){
    //Eliminamos los dos puntos del ObjectId que se envian en la url
    var _id = req.params.id;
    var len = req.params.id.length;
    _id = _id.substring(1,len);
    try {
        await Usuario.findByIdAndDelete(_id)
        req.flash('success_msg', 'Usuario eliminado correctamente');
        res.redirect('/users');
    } catch (error) {
        console.log(error);
        res.redirect('/error');
    }
});//Fin de eliminar un usuario


//Ruta para editar usuarios
router.get('/users/edit:id', isAuthenticated, async function (req, res){
    //Eliminamos los dos puntos del ObjectId que se envian en la url
    var _id = req.params.id;
    var len = req.params.id.length;
    _id = _id.substring(1,len);
    try {
        const usuario= await Usuario.findById(_id);
        var nombre = usuario.nombre;
        var email = usuario.email;
        var password = usuario.password;
        var tipo = usuario.tipo
        res.render('users/editar-usuario', {nombre, email, password, tipo, _id});
    } catch (error) {
        console.log(error);
        res.redirect('/error');
    }
}); //Fin de editar usuarios

//Metodo para actualizar un usuario en la base de datos recibida del formulario
router.post('/users/update/', isAuthenticated, async function(req, res){    
    let { nombre, email, password, tipo, id } = req.body;
    const errores = []; //Arreglo para los errores en el registro de usuarios

    if (!nombre)
        errores.push({text: 'Por favor inserta el nombre'});
    if (!password)
        errores.push({text: 'Por favor inserta el password'})
    if (password.length < 4)
        errores.push({text: 'La contraseña debe tener al menos 4 caracteres'});
    if (errores.length > 0){ //Existe al menos un error en el formulario
        const _id = id
        res.render('users/editar-usuario', 
                    {
                      errores,
                      nombre,
                      email,
                      password,
                      tipo,
                      _id
                    })
    }else { //No hay errores
        const newUser = new Usuario({
            nombre,
            email,
            password,
            tipo
        });
        //Encriptamos la contraseña
        newUser.password = await newUser.encryptPassword(password);
        password = newUser.password;
        //Actualizar en la base de datos
        await Usuario.findByIdAndUpdate(id, {nombre, email, password, tipo})
                .then( ( )=>{
                    req.flash('success_msg', 'Usuario actualizado correctamente');
                    res.redirect('/users')
                })
                .catch( (err)=>{
                    console.log(err);
                    res.redirect('/error');
                })
    }  
}); //Fin de editar-usuarios en base de datos

//Routa para agregar usuarios
router.get('/users/add', function(req, res){
    res.render('users/agregar-usuario')
})

//Ruta para guardar el formulario en la base de datos desde agregar usuarios
router.post('/users/add', async function(req, res){
    let { nombre, email, password, confirmarpassword, tipo} = req.body;
    const errores = []; //Arreglo para los errores en el registro de usuarios
    if (!nombre)
        errores.push({text: 'Por favor inserta el nombre'});
    if (!email)
        errores.push({text: 'Por favor inserta el email'});
    if (!password)
        errores.push({text: 'Por favor inserta el password'})
    if (password.length < 4)
        errores.push({text: 'La contraseña debe tener al menos 4 caracteres'});
    if (password != confirmarpassword)
        errores.push({text: 'Los passwords no coinciden'})
    if (errores.length > 0){ //Existe al menos un error en el formulario
        if (tipo == 0)
            tipo = null
        res.render('users/agregar-usuario', 
                    {
                      errores,
                      nombre,
                      email,
                      password,
                      confirmarpassword,
                      tipo
                    })
    }else { //No hay errores
        //Comprobamos que el email del usuario no exista en la base de datos
        const userEmail = await Usuario.findOne({email: email});
        if (userEmail){ //Si el userEmail existe en la base de datos
            errores.push({
                text: 'El email ya esta en uso, por favor elija uno diferente'
            });
            res.render('users/agregar-usuario',
            {
                errores,
                nombre,
                email,
                password,
                confirmarpassword,
                tipo
            })
            return; //finaliza la función
        } //if userEmail
        const newUser = new Usuario({
            nombre,
            email,
            password,
            tipo
        });

        //Encriptamos la contraseña
        newUser.password = await newUser.encryptPassword(password);

        //console.log(newUser);
        //Guardar el usuario en la base de datos
        await newUser.save()
                     .then( ()=>{
                         req.flash('success_msg', 'Usuario guardado de manera exitosa');
                         //Redirigimos el flujo de la app a iniciar sesión
                         res.redirect('/users'); 
                       })
                     .catch( (err)=>{
                        console.log(err);
                        res.redirect('/error')
                     });
    }  
});//Fin del post /users/add desde el formulario


module.exports = router;