const Job = require('../models/Job')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')


const getAllJobs = async(req, res) => {
    //res.send('all jobs')
    const jobs = await Job.find({ createdBy: req.user.userId}).sort('createdAt')
    res.status(StatusCodes.OK).json({jobs, count: jobs.length})
}

const getJob = async(req, res) => {
    //res.send('single job')
    //Nested destructuring - vadimo userId iz REQ.USER i idJob iz REQ.PARAMS
    const {
        user: { userId }, //iz req.user izvadi userId po istim imenom 
        params: { id: jobId } //iz req.params izvadi id pod imenom jobId
    } = req //i to sve iz REQ objekta

    const job = await Job.findOne({
        _id: jobId, //filter po id posla izvucen iz req.params
        createdBy: userId // user id izvucen iz req.user
    })
    //ako nema posla...
    if(!job) {
        let er = new NotFoundError(`No job with id ddddd${jobId}`)
        //console.log(er)
        throw new NotFoundError(`No job with id ddddd${jobId}`)
    }   //status code 404 i ova poruka
    //!!!Kada izbaci gresku onda se ona hendluje i to salje kao respons umesto ovog sto je predvidjeno
    //kada je uspesno nesto izvrseno
    res.status(StatusCodes.OK).json({ job })
}

const createJob = async(req, res) => {
    //res.json(req.body)//(req.user)
    /**
     * U Req.Body koji smo dobili iz forme ubacujemo ID od logovanog usera, a koji smo 
     * dobili iz TOKENA pri verifikaciji. (ID smo ubacili izmedju ostalog pri kreiranju tokena) i nazvali ga
     * userId. A taj ID je ubacen u REQ.USER objekat te ga odatle povlacimo i koristimo! evo za kreiranje novog
     * JOB-a a to je po uslovu Scheme Job koja ukljucuje tu referencu (na USER-a iz USER Scheme)
     * 
     */
    console.log(req.user)
    req.body.createdBy = req.user.userId
    const job = await Job.create(req.body)
    console.log(job)
    res.status(StatusCodes.CREATED).json({ job })
    /* Ovo dobijemo pri kreiranju job-a
    "job": {
        "status": "pending", // default opcija
        "_id": "64936453e6007b14686eee6f", //ID Job-a dodeljuje MongoDb
        "company": "google",
        "position": "intern",
        "createdBy": "6490b024b9ad8b3adc644588", //ID logovanog usera koji je kreirao job - iz REQ.USERA
        "createdAt": "2023-06-21T21:03:37.592Z", //ovo je ono timestamps: true u Model/Job
        "updatedAt": "2023-06-21T21:03:37.592Z", // --//--
        "__v": 0
    }*/

}

const updateJob = async(req, res) => {
    //res.send('update job')
    const {
        body: { company, position}, //Dodatno, vadimo iz req.body objekta ono sto updajtujemo
        user: { userId }, //iz req.user izvadi userId po istim imenom 
        params: {id : jobId} ////iz req.params izvadi id pod imenom jobId
    } = req //i to sve iz REQ objekta
    //provera ako polja za update nisu popunjena TJ Ako saljemo prazna! Ako ih skroz izosatavimo to je ok
    //jr je ovo PATCH menja samo one koje je dobio
    if(company === '' || position === '') {
        throw new BadRequestError('Please provide company and position to update')
    }

    const job = await Job.findByIdAndUpdate({
        _id: jobId, //filter po id posla izvucen iz req.params
        createdBy: userId, // user id izvucen iz req.user
    }, 
    req.body, //Drugi parametar metoda je za update
    {new: true, runValidators: true} //Treci param - opcije - salje izmenjeni obj, i ukljucuue validacije
    //da nam ne ubacuju svasta - al zar ne treba model to da radi sam?
    )
    if(!job) {
        throw new NotFoundError(`No job with id ${jobId}`)
    }
    res.status(StatusCodes.OK).json({job}) //new: true nam odmah salje updateovani objekat tj dokument
    

}

const deleteJob = async(req, res) => {
    //res.send('delete job')
    const {
        user: { userId},
        params: {id: jobId}
    } = req

    const job = await Job.findByIdAndRemove({ //a ima ...Delete
        _id: jobId,
        createdBy: userId
    })
    if(!job) {
        throw new NotFoundError(`No job with id ${jobId}`)
    }

    res.status(StatusCodes.OK).send() //Ovo send() je pravilo problem sa ...Delete
}

module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob
}