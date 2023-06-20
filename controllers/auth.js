const User = require('../models/User')
//Uvozimo izdvojeni objekat izz modula
const { StatusCodes } = require('http-status-codes')

const { BadRequestError, UnauthenticatedError } = require('../errors')

//const bcrypt = require('bcryptjs') - ne treba posto je prebaceno u model hashovanje

//import JWT-a za token
//const jwt = require('jsonwebtoken') - ne treba posto je prebaceno u model tokenizovanje


const register = async (req, res) => {
    //Primer validacije u kontroleru - a inace je imamo u Mongo schemi
    /*const {name, password, email} = req.body
    if(!name || !email || !password) {
        throw new BadRequestError('Please provide name, email and password')
    }*/

    /* 
    //Ovo smo prebacili u Model tj Schemu u Mongoose MD funkciju
    const {name, email, password} = req.body
    //HASHOVANJE password - prvo kreiramo Temp objekat za sve iz req.body-a pa onda radimo na passwordu
    //1. Kreiramo salt 
    //2. Zatim hashujemo password i salt zajedno u mat. func
    //3. N kraju pakujemo tempUser objekat sa hashedPassword umesto string passworda
    const salt = await bcrypt.genSalt(10) //10 random bajta koji se dodaju u hash funkciji
    const hashedPassword = await bcrypt.hash(password, salt)

    const tempUser = {name, email, password: hashedPassword} // name: name, email: email, password: hashedPassword

    //user objekat koji sadrzi kreirani objekat/red/item u MongoDB bazi a na osnovu destruktuiranog req.body objekta
    const user = await User.create({...tempUser})//umesto ovog({...req.body})  //User model - create metod 
    */

    //res.json(req.body)
    //Kako smo Hashovanje prebacili u Model tj Schemu kreiramo USER-a tj dokument na osnovu original req.body obj
    //Sto je mnogo elegantnije...
    const user = await User.create({...req.body})
    console.log({user})
    //Token
    //const token = "fsdf"
    //const token = jwt.sign({userId: user._id, name: user.name}, 'procces.env.JWT_TOKEN', {expiresIn: '30d'})
    //Ovo gore smo preneli u Instance metod Scheme User i tamo kreirali funkciju tj metod za token na user obj/doc
    //a ovde samo pozvali tu funkciju tj metod na SAM kreirani objekat
    const token = user.createJWT()
    res.status(StatusCodes.CREATED).json({user: {name: user.name}, token}) //Created - 201
    //Ako bi primenili instance metod ovde bilo bi: {name: user.getName()} - na objekat koji smo dobili pri kreiranju
}

const login = async (req, res) => {
    //res.send('login user')
    const {email, password} = req.body

    //Hedlujemo error ovde u kontroleru umesto u MD/error-handleru! samo se greska handluje tehnicki u error
    if(!email || !password) {
        throw new BadRequestError("Please provide email or password")
    }
    //FinOne Mongosee metod vraca Query objekat i asihrono izgleda mora da se hendluje
    const user = await User.findOne( {email}) //obrati paznju na {} za conditions - email...
    console.log({user}) //Ovde mozemo da chainujemo .then()
    if(!user){
        //Posebna greska ako nije autentikacija prosla
        throw new UnauthenticatedError('Invalid Credentials (EM)')
    }
    
    //compare password
    const isCorrectPassword = await user.comparePasswords(password)
    console.log({isCorrectPassword})
    if(!isCorrectPassword) {
        throw new UnauthenticatedError('Invalid Credentials (PW)')
    }

    //Koristimo Instance metod iz modela za kreiranje tokena
    const token = user.createJWT()
    console.log({token})
    res.status(StatusCodes.OK).json({user: {name: user.name}, token})

}

module.exports = {
    register,
    login
}