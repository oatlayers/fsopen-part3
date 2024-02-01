require('dotenv').config()
const mongoose = require('mongoose')

// when no password is given, ask for one
if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}
// variables
const password = process.argv[2]
const theName = process.argv[3]
const theNumber = process.argv[4]

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
mongoose.connect(url)

// define schema
const personSchema = new mongoose.Schema({
    name: String, 
    number: Number,
})

//define model
const Person = mongoose.model('Person', personSchema)

const person = new Person({
        name: theName,
        number: theNumber,
})

// console.log('valuess:', theName, theNumber) 
// console.log('value of person:', person)

// if there's no name and number display all entries
// else display message
if (!theName && !theNumber) {
    Person.find({}).then(persons => {
        persons.forEach(person => {
            console.log(person)
        })
        mongoose.connection.close()
    })
} else if (theName && theNumber) {
    person.save().then(result => {
        console.log(`added ${theName} number ${theNumber} to phonebook`)
        mongoose.connection.close()
    })
}