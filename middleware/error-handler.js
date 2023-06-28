/////OVO JE POSTALO NEPOTREBNO const { CustomAPIError } = require('../errors')
const { StatusCodes } = require('http-status-codes')
const errorHandlerMiddleware = (err, req, res, next) => {

  //NOVO RESENJE customError objekat
  let customError = {
    //Propertiji error objekta - za status i poruku
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong try again later'
  }



  //OVO DOLE HENDLUJE GRESKU - a ako ne, uvodimo customError objekat 
  //Ovde cemo videti gresku tj log, ako uklonimo BadRequestError u kontroleru za proveru praznih polja
  console.log(err)
  /////OVO JE POSTALO NEPOTREBNO
  //if (err instanceof CustomAPIError) { 
    //return res.status(err.statusCode).json({ msg: err.message })
    /**
     * primer Custom error greske od npr:  throw new UnauthenticatedError('Authentication invalid') ILI
     *   throw new UnauthenticatedError('Invalid Credentials (PW)')
    
     * {
        "msg": "Invalid Credentials (PW)"
        } 
    */ 
  //}

  //NOVO DODATO MONGOSE VALIDATION ERROR handler - prover ako je ime ove greske - REGISTRACIJA
  if(err.name === 'ValidationError') {
    console.log(Object.values(err.errors))
    //kreiramo poruku o greski iz meassages propertija Error objekta
    customError.msg = Object.values(err.errors) //pristupamo vrednostima (a ne kljucevima!) errors objekta
      .map((item) => item.message) // pravimo niz od message propertija Vrednosti errors objekti (isto objekti)
      .join(' A BRE I ') // i sklapamo ih u string kao jedinstvenu poruku... 
      /**
       * {
            "msg": "Please provide valid password, Please provide email" // dve poruke zajedno
          }
       */
  }

  

  //NOVO DODATO - lovimo propertije Error objekta da bi podesili porurku i statuscode (code 11000 vraca Mongo)
  //Mongo duplicate error
  if(err.code && err.code === 11000) {
    //Menjamo propertije  custom objekta koji smo dole upotrebili
    customError.msg = `Duplicate value entered for -${Object.keys(err.keyValue)}- field, please choose another value` 
    // na osnovu "keyValue": { "email": "djeka4@gmail.com"}
    customError.statusCode = 400
    
  }

  //Mongo Casterrors
  if(err.name === "CastError") {
    customError.msg = `No item found with id: ${err.value}` //"value": "64936faf5c0df02a6c1ba42",
    customError.statusCode = 404
    let a = {
      a: 5,
      b: 6
  }
  console.log({d: a.c})
    //I onda upotrebimo donju liniju za customizovanu poruku o njemanju joba sa tim ID-om
  }

    //OVE DVE LINIJE NAIZMENICNO KORISTIMO DA BI TESTIRALI HENDL GRESAKA I VIDELI STA KOJA BACA! - Postman
    //return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json( {err }) //DOLE JE ERR Obj kada ovo hendluje gresku!
    return res.status(customError.statusCode).json({msg: customError.msg, add: "Probamo samo handler... GSJ..",
      ErrorName: err.name, dodatak: typeof(err.d)}) //Ispod toga msg i ERROR objekta
      //OVO dodatak je dodeljeno bese Unatorhiz... klasi zato ga nema u ostalim porukama jer oni ne sadrze taj properti
      //Vidi se u resposnu (osim u toj klasi greske) i ako npr stavimo typeof(err.d) ili err.d + 1 npr
      //Inace pristup nepostojecem propertiju u objektu vraca undefined...
    // {
    //   "msg": "E11000 duplicate key error collection: 06-JOBS-Api.users index: email_1 dup key: { email: \"djeka4@gmail.com\" }"
    // }

  /**
   * primer Mongoerror tj kada nije ispunjen uslov iz valiadatora Mongo Scheme 
   * {
    "err": {
        "driver": true,
        "name": "MongoError",
        "index": 0,
        "code": 11000,
        "keyPattern": {
            "email": 1
        },
        "keyValue": {
            "email": "djeka4@gmail.com"
        }
    }
}
   */
}

module.exports = errorHandlerMiddleware





//STARO RESENJE KOJE SMO SACUVALI zbog uvodjenja customError objekta i drugog
 //OVO DOLE HENDLUJE GRESKU - a ako ne, uvodimo customError objekat 
  //Ovde cemo videti gresku tj log, ako uklonimo BadRequestError u kontroleru za proveru praznih polja
  ///// console.log(err)
  ///// if (err instanceof CustomAPIError) {
  /////   return res.status(err.statusCode).json({ msg: err.message })
    /**
     * primer Custom error greske od npr:  throw new UnauthenticatedError('Authentication invalid') ILI
     *   throw new UnauthenticatedError('Invalid Credentials (PW)')
    
     * {
        "msg": "Invalid Credentials (PW)"
        } 
    */ 
  ///// }
  ///// return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err }) //ovo menjamo sa objektom customError
  /**
   * primer Mongoerror tj kada nije ispunjen uslov iz valiadatora Mongo Scheme 
   * {
    "err": {
        "driver": true,
        "name": "MongoError",
        "index": 0,
        "code": 11000,
        "keyPattern": {
            "email": 1
        },
        "keyValue": {
            "email": "djeka4@gmail.com"
        }
    }
}
   */


//return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err })
/*
Ceo Error tj err objekat kada njega samog posaljemo 
Ovo je Mongoose Validation error - iz Scheme Usera za registraciju
Ovo je slucaj kaa nismo uneli ni password ni email!
{
  "err": {
      "errors": {
          "password": {
              "name": "ValidatorError",
              "message": "Please provide valid password",
              "properties": {
                  "message": "Please provide valid password",
                  "type": "required",
                  "path": "password"
              },
              "kind": "required",
              "path": "password"
          },
          "email": {
              "name": "ValidatorError",
              "message": "Please provide email",
              "properties": {
                  "message": "Please provide email",
                  "type": "required",
                  "path": "email"
              },
              "kind": "required",
              "path": "email"
          }
      },
      "_message": "User validation failed",
      "name": "ValidationError",
      "message": "User validation failed: password: Please provide valid password, email: Please provide email"
  }
}
*/

//Dakle ovo su greske o kojima vodi Mongoose racuna

//OVO message: smo imali u customError objektu -  msg: err.message || 'Something went wrong try again later'
//"message": "User validation failed: password: Please provide valid password, email: Please provide email"
//a nakon ovog hendla:
//return res.status(customError.statusCode).json({msg: customError.msg}) //Ispod toga msg i ERROR objekta

//msg: err.message -> msg: customError.msg - prvo je customError obj a drugo poruka koju saljemo 

/*
CASTERROR - kada ID posla nije ispravan - get single job - name CastError
return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json( {err }) - ova linija
"err": {
  "stringValue": "\"64936faf5c0df02a6c1ba42\"",
  "valueType": "string",
  "kind": "ObjectId",
  "value": "64936faf5c0df02a6c1ba42",
  "path": "_id",
  "reason": {},
  "name": "CastError",
  "message": "Cast to ObjectId failed for value \"64936faf5c0df02a6c1ba42\" (type string) at path \"_id\" for model \"Job\""
}
*/