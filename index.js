import express, { json } from "express";
import morgan from "morgan";
import cors from "cors";
import Person from "./models/person.js";

const app = express();
morgan.token("data", (req) => {
  return JSON.stringify(req.body);
});

app.use(express.static("build"));
app.use(json());
app.use(cors());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :data",
    {
      skip: function (req, res) {
        return req.method != "POST";
      },
    }
  )
);

app.use(
  morgan("tiny", {
    skip: function (req, res) {
      return req.method == "POST";
    },
  })
);

app.get("/info", (req, res) => {
  const html = `<p>Phonebook has info for ${Person.length} people</p>
    <p>${new Date()}</p>
    `;
  res.send(html);
});

app.get("/api/persons", (req, res) => Person.find({}).then((p) => res.json(p)));

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.status(200).json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => next(err));
});

app.delete("/api/persons/:id", (req, res) => {
  Person.findByIdAndRemove(req.params.id).then((result) =>
    res.status(204).end()
  );
});

app.post("/api/persons", (req, res, next) => {
  const data = req.body;

  if (!(data.name && data.number)) {
    return res.status(400).json({ error: "name and number are required" });
  }

  Person.findOne({ name: data.name }).then((p) => {
    if (p !== null) {
      return res.status(400).json({ error: "name must be unique" });
    }

    const person = new Person({
      name: data.name,
      number: data.number,
    });

    person
      .save()
      .then((savedPerson) => res.status(200).json(savedPerson))
      .catch((err) => next(err));
  });
});

app.put("/api/persons/:id", (req, res, next) => {
  const data = req.body;

  const person = {
    name: data.name,
    number: data.number,
  };

  Person.findByIdAndUpdate(req.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((err) => next(err));
});

const errorHandler = (error, req, res, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).send({ error: error.message });
  }

  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT);
