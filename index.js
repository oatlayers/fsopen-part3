require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// if post req and type is json, stringify and return the request body
morgan.token('postData', (req, res) => {
    if (req.method === 'POST' && req.headers['content-type'] === 'application/json') {
      return JSON.stringify(req.body)
    }
    return ''
})

// middleware with custom token postData
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'))

app.use(express.json())
app.use(express.static('dist'))

// display all persons
app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

// display amount and date of request
app.get('/info', (req, res) => {
    const timestamp = new Date()
    const length = persons.length
    const htmlString = `<p>Phonebook has info for ${length} people</p><p>${timestamp}</p>`
  
    res.send(htmlString)
})

// go to specific resource
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)

    if (person) {
        res.json(person)
    } else {
        res.statusMessage = "Can't find it"
        res.status(404).end()
    }
})

// delete resource
app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
      .then(result => {
        res.status(204).end()
      })
      .catch(error => next(error))
})

// make new resource and appropriate errors
// "At this stage, you can ignore whether there is already a person in the database with the same name as the person you are adding."

// if (!body.number || !body.name) {
//     return res.status(400).json({
//         error: 'number or name is missing'
//     })
// } else if (persons.find(p => p.name === name)) {
//     return res.status(400).json({
//         error: 'name already exists'
//     })
// }

app.post('/api/persons', (req, res) => {
    const body = request.body
    
    if (body.content === undefined) {
        return res.status(400).json({ error: 'content missing' })
    }
    
    const person = new Person({
        name: body.name,
        number: body.number,
    })
    
    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
})

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})