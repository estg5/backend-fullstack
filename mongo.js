import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.MONGODB_URI;

mongoose.connect(url);

const schema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", schema);

if (process.argv.length < 4) {
  Person.find({}).then((res) => {
    res.forEach((p) => console.log(`${p.name} ${p.number}`));
    mongoose.connection.close();
  });
} else {
  const name = process.argv[2];
  const number = process.argv[3];

  const newPerson = new Person({
    name,
    number,
  });

  newPerson.save().then((res) => {
    console.log(`added ${name} number ${number} to phonebook`);
  });
}
