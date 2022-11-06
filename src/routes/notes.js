//Contiene las riutas del servidor para que el usuario
//pueda agregar notas, eliminar, modificar etc
//  /notas/add     /notas/delete
const express = require('express');
const router = express.Router();

//Importamos el modelo de datos
const Nota = require('../model/Notes');

//Importamos la autenticación de usuarios
const { isAuthenticated } = require('../helpers/auth');

//Ruta para agregar notas a la base de datos
router.get('/notes/add', isAuthenticated, function(req, res){
    res.render('notes/nueva-nota');
});

//Ruta para consultar todas las notas
router.get('/notes', isAuthenticated, async function(req, res){
    //res.send('Notas de la base de datos')
    //Select * from notas where usuario = req.user._id order by desc
    await Nota.find({usuario: req.user._id}).lean().sort({fecha: 'desc'}) 
          //Select * from notas order by fecha desc
               .then( (notas)=>{
                   //console.log(notas);
                   res.render('notes/consulta-notas', {notas})
               })
               .catch( (err)=>{
                   console.log(err);
                   res.redirect('/error');
               })
});//Fin de consultar todas las notas

//Ruta para guardar la nota en la base de datos. Cuando el usuario presione guardar
router.post('/notes/nueva-nota', isAuthenticated, async function(req, res){
    //req.body <-- Contiene todos los datos del formulario enviados al servidor
    //console.log(req.body);

    //Guardamos los datos en constantes
    const { titulo, descripcion} = req.body;
    const errores = [];

    if (!titulo){
        //push <-- inserta un elemento en un arreglo
        errores.push({text: 'Por favor inserta el título'});
    }
    if (!descripcion){
        errores.push({text: 'Por favor inserta la descripción'})
    }
    if (errores.length > 0){ //Si hay errores
        res.render('notes/nueva-nota', { //Se envia los errores y los datos del formulario
            errores,
            titulo,
            descripcion
        });
    }else{ //No hay errores
        const nuevaNota = new Nota({titulo, descripcion});
        //Asignamos a la nota el id del usuario que inició sesión
        nuevaNota.usuario = req.user._id;
        await nuevaNota.save() //await guarda la nota en la base de datos de manera asincrona
                       .then( ()=>{ //Si se guarda la nota correctamente
                           req.flash('success_msg', 'Nota agregada de manera exitosa');
                           res.redirect('/notes'); //redirigimos el flujo de la app a la lista de notas
                       })
                       .catch( (err)=>{ //Si existe algún error
                           console.log(err);
                           res.redirect('/error');
                       })
        //console.log(nuevaNota);
        //res.send("ok");
    }
});//Fin de guardar nota

//Ruta para editar notas
router.get('/notes/edit:id', isAuthenticated, async function (req, res){
    var _id = req.params.id;
    //console.log(_id);
    try {
        //Eliminar los dos puntos del id
        var len = req.params.id.length;
        _id = _id.substring(1,len);
        const nota= await Nota.findById(_id);
        //console.log(nota);
        var titulo = nota.titulo;
        var descripcion = nota.descripcion;
        res.render('notes/editar-nota', {titulo, descripcion, _id});
    } catch (error) {
        console.log(error);
        res.redirect('/error');
    }
}); //Fin de editar notas

//Metodo para actualizar una nota en la base de datos recibida del formulario
router.put('/notes/editar-nota/:id', isAuthenticated, async function(req, res){
    const { titulo, descripcion } = req.body;
    const id = req.params.id;
    //console.log(titulo);
    //console.log(descripcion)
    //console.log(id);

    //Actualizar en la base de datos
    //update notas set titulo.... where id = $id
    await Nota.findByIdAndUpdate(id, {titulo, descripcion})
              .then( (nota)=>{
                  req.flash('success_msg', 'Nota actualizada correctamente');
                  res.redirect('/notes')
              })
              .catch( (err)=>{
                  console.log(err);
                  res.redirect('/error');
              })
}); //Fin de editar-nota en base de datos

//Ruta eliminar una nota
router.get('/notes/delete:id', isAuthenticated, async function(req, res){
    //Eliminamos los dos puntos del ObjectId que se envian en la url
    var _id = req.params.id;
    try {
        //Eliminar los dos puntos del id
        var len = req.params.id.length;
        _id = _id.substring(1,len);
        //console.log(_id);
        await Nota.findByIdAndDelete(_id)
        req.flash('success_msg', 'Nota eliminada correctamente');
        res.redirect('/notes');
    } catch (error) {
        console.log(error);
        res.redirect('/error');
    }
});//Fin de eliminar una nota

//Ruta para renderizar la página de búsqueda de notas
router.get('/notes/search', isAuthenticated, (req, res)=>{ //Función declarada con operador flecha
    res.render('notes/buscar-notas');
});

//Ruta para la búsqueda de notas en el formulario
router.post('/notes/search', isAuthenticated, async (req, res)=>{
   //console.log(req.body.search);
   //res.send('WORKS');
   const user = req.user._id;
   const search = req.body.search;

    console.log(user);
   if (search){ //Si hay algo que buscar
      await Nota.find({ //Busca en cualquier atributo el texto, no es sensible a mayusculas
                           usuario: user, 
                           $text: {
                               $search: search,
                               $caseSensitive: false
                           }
                        })
                 .sort({date: 'desc'})
                 .exec( (err, notas)=>{
                     if (err){
                         console.log(err);
                         res.redirect('/error');
                     }
                     console.log(notas);
                     res.render('notes/buscar-notas',
                        {
                            search,
                            notas
                        }
                     );//render
                 });//exec
   }//if
}); //Fin de post /notes/search
module.exports = router;