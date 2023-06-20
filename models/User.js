const mongoose = require('mongoose')

//Prenosimo hashovanje u model pa uvozimo bcrypt
const bcrypt = require('bcryptjs')

//Prenosimo pravljenje tokena u model pa uvozimo jsonwebtoken
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        minlength: 3,
        maxlength: 50,
        unique: true
    },
    email: {
        type: String,
        unique: true,//nije validator - kreira unique indeks
        required: [true, 'Please provide email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide valid email'
        ],
        
    },
    password: {
        type: String,
        required: [true, 'Please provide valid password'],
        minlength: 6,
        //Ovo ce biti uklonjeno jer ce password biti heshovan
        //maxlength: 12
    }
})

//Primena MD metoda PRE na schemu koju smo definisali - "preradjujemo" password u hodu 
UserSchema.pre('save', async function(){//(next){ - next je u v7 a u v5 dovoljno async/await tj promise
    const salt = await bcrypt.genSalt(10)
    //Iskoristili smo klasicnu funkciju zbog scopea THIS koji se odnosi na Schema objekat u ovo slucaju a ne na global objekat
    //izmenjali smo sam parametar scheme i vratili ga nazad i prosledili sve dalje sa next.
    //AWAITTTTTT!!! kad imas async! funkciju - upamti to 
    this.password = await bcrypt.hash(this.password, salt)
    //next()
})

//Primer i primena instance metode
//Na schemu chainujemo .methods pa onda .imeMetoda = function() {...}
UserSchema.methods.getName = function() {
    return this.name
    //Koristimo function keyword zbog THIS, da bi se to uvek odnosilo na Instancu tj Dokument ove Scheme 
}

UserSchema.methods.createJWT = function() {
    //odnosimo se sa this na sam objekat tj dokument
    return jwt.sign({userId: this._id, name: this.name}, 
        process.env.JWT_SECRET, 
        {expiresIn: process.env.JWT_LIFETIME})//'30d'})
}

UserSchema.methods.comparePasswords = function(candidatePassword) {
    const isMatched = bcrypt.compare(candidatePassword, this.password)
    return isMatched
}


module.exports = mongoose.model('User', UserSchema)