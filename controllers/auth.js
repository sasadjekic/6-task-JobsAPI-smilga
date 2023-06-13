const User = require('../models/User')
//Uvozimo izdvojeni objekat izz modula
const { StatusCodes } = require('http-status-codes')

const { BadRequestError } = require('../errors')

//const bcrypt = require('bcryptjs') - ne treba posto je prebaceno u model hashovanje

//import JWT-a za token
const jwt = require('jsonwebtoken')


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

    //Token
    //const token = "fsdf"
    const token = jwt.sign({userId: user._id, name: user.name}, 'procces.env.JWT_TOKEN', {expiresIn: '30d'})
    res.status(StatusCodes.CREATED).json({user: {name: user.name}, token}) //Created - 201
}

const login = async(req, res) => {
    res.send('login user')
}

module.exports = {
    register,
    login
}