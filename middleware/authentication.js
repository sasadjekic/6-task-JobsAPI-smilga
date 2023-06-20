const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors')

const auth = async (req, res, next) => {
    //check header - vadimo header sa imenom authorisation
    const authHeader = req.headers.authorization
    console.log(authHeader)
    //proveravamo da li je authorisation uopste setovan i da li pocinje sa Bearer sto je vezano za token
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthenticatedError('Authentication invalid')
    }
    const token = authHeader.split(' ')[1] // Bearer [token] zato [1] kad se string podeli u niz stringova 

    try {
        //Verifikacija "uzvracenog" tokena uz token i secret na osnovu kog je i napravljen
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        //atach the user to the job routes - REQ.USER
        //Ove smo vrednosti smo tako i nazvali i tako ih pakujemo u USER objekat koji posle prosledjujemo dalje i
        //koristimo za pretragu po Id npr odnosno potvrdu da je taj user koji nam treba
        req.user = {userId: payload.userId, name: payload.name}

        /**Alternativa ovome da direktno kreiramo REQ.USER iz tokena je da koristimo izvuceni ID i tokena
         * da trazimo usera u bazi pa onda tek kreiramo REQ.USER. Ono select je za izbacivanje polja iz objekta
         */
        const user = User.findById(payload.id).select('-password') //ceo document usera samo bez passworda
        //req.user = user - da nam ne brka ono gore

        //tako napakovan req objekat se prosleduje dalje sledecoj funkciji (npr ovde za /jobs vezane rute)
        next()
    } catch(error) {
        throw new UnauthenticatedError('Authentication invalid')
    }
}


//Eksportuj covece funkciju akoj enegde importujes
module.exports = auth