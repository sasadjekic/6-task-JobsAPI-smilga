const mongoose = require('mongoose')

const JobSchema = new mongoose.Schema(
    {
        company: {
            type: String,
            required: [true, 'Please provide company name'],
            maxlength: 50
        },
        position : {
            type: String,
            required: [true, 'Please provide position'],
            maxlength: 100
        },
        status: {
            type: String,
            //Enum je properti za niz opcija koje se mogu izabrati
            enum: ['interview', 'declined', 'pending'],
            //...a default opcija koja je default od tih ponudjenih (ili mozda neka druga)
            default: 'pending'
        },
        //Nova stvar - referenca na User schema radi dohvatanja Id-a usera
        createdBy: {
            //To je ovo gde biramo prvo tip podatka Id Objekta
            type: mongoose.Types.ObjectId,
            //Schema koja se referencira tj upucuje na nju gore 
            ref: 'User',
            required: [true, 'Please provide user']
        }
        //Ovo je novo timestamp... kao druga opcija u Schemi
}, {tumestamps: true}) 

module.exports = mongoose.model('Job', JobSchema)