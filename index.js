const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

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

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

// display all persons
app.get('/api/persons', (req, res) => {
    res.json(persons)
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
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(p => p.id !== id)

    res.status(204).end()
})

// make new resource and appropriate errors
app.post('/api/persons', (req, res) => {
    const body = req.body
    const name = req.body.name

    // console.log('value of name:', name)

    if (!body.number || !body.name) {
        return res.status(400).json({
            error: 'number or name is missing'
        })
    } else if (persons.find(p => p.name === name)) {
        return res.status(400).json({
            error: 'name already exists'
        })
    }

    const person = {
        id: Math.floor(Math.random() * 1000),
        name: body.name,
        number: body.number
    }
    
    persons = persons.concat(person)

    res.json(person)
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})