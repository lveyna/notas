const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new Schema ({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type:String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    tipo: {
        type: Number,
        default: 1      //0 - Usuario administrador, 1 - Usuario regular
    } 
});

UserSchema.method({
    //Función que encripta un password 10 veces y retorna el password ya encriptado
    async encryptPassword(password) {
        //Aplicamos un hash 10 veces
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }, //Fin de encryptPassword

    //Función para comparar la contraseña cuando el usuario inicie sesión
    //La conraseña se compara de la base de datos
    async matchPassword(password){
        return await bcrypt.compare(password, this.password);
    }, //Fin de matchPassword
});

module.exports = mongoose.model('User', UserSchema);