require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

app.use(cors());

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

// if post req and type is json, stringify and return the request body
morgan.token("postData", (req) => {
  if (
    req.method === "POST" &&
    req.headers["content-type"] === "application/json"
  ) {
    return JSON.stringify(req.body);
  }
  return "";
});

// middleware with custom token postData
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :postData"
  )
);

app.use(express.json());
app.use(express.static("dist"));

// display all persons
app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

// display amount and date of request
app.get("/info", (req, res, next) => {
  const timestamp = new Date();

  Person.countDocuments({})
    .then((count) => {
      const length = count;
      const htmlString = `<p>Phonebook has info for ${length} people</p><p>${timestamp}</p>`;
      res.send(htmlString);
    })
    .catch((error) => next(error));
});

// go to specific resource
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// delete resource
app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

// make new resource. Minimum length of name is 3 and number is 8. If an HTTP POST request tries to add a person with an invalid phone number, the server should respond with an appropriate status code and error message.
app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  if (body.name === undefined) {
    return res.status(400).json({ error: "name missing" });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      res.json(savedPerson);
    })
    .catch((error) => next(error));
});

// If new entry name is already in the phonebook, update the number by making an HTTP PUT request to the entry's unique URL. Optional { new: true } parameter will cause event handler to be called with the new modified document instead of the original.
app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
