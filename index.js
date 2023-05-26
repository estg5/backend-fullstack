import express, { json } from "express";
import morgan from "morgan";
import cors from "cors";
import Person from "./models/person.js";

const app = express();
morgan.token("data", (req) => {
  return JSON.stringify(req.body);
});

app.use(cors());
app.use(express.static("build"));
app.use(json());
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

let db = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generateId = () => {
  const maxId = Math.max(...db.map((p) => p.id));
  return maxId + 1;
};

app.get("/info", (req, res) => {
  const html = `<p>Phonebook has info for ${db.length} people</p>
    <p>${new Date()}</p>
    `;
  res.send(html);
});

app.get("/api/persons", (req, res) => Person.find({}).then((p) => res.json(p)));

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = db.find((p) => p.id === id);

  if (!person) {
    res.status(404).end();
  }

  res.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  db = db.filter((p) => p.id !== id);

  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const data = req.body;

  if (!(data.name && data.number)) {
    return res.status(400).json({ error: "name and number are required" });
  }

  const exists = db.find((p) => p.name === data.name);
  if (exists) {
    return res.status(400).json({ error: "name must be unique" });
  }

  const person = {
    id: generateId(),
    name: data.name,
    number: data.number,
  };

  db = db.concat(person);
  res.status(200).json(person);
});

const PORT = process.env.PORT;
app.listen(PORT);
