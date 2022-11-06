//Sirve par asegurar las rutas con el inicio de sesión del usuario
const helpers = {};

helpers.isAuthenticated = function (req, res, next){
    if (req.isAuthenticated()){
        return next();
    }else {
        req.flash('error_msg', 'No autorizado');
        res.redirect('/users/signin');
    }
}; //fin de isAuthenticated 

module.exports = helpers;