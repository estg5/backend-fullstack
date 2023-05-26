/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.MONGODB_URI;

mongoose
  .connect(url)
  .then(() => console.log('Connected to mongodb'))
  .catch((err) => console.log(err.message));

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    validate: {
      validator(v) {
        return /^\d{2,3}-\d*$/.test(v);
      },
      message: (props) => `${props.data} is not a valid phone number!`,
    },
    minLength: 8,
    required: [true, 'User phone number required'],
  },
});

personSchema.set('toJSON', {
  transform: (_, obj) => {
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
  },
});

const Person = mongoose.model('Person', personSchema);

export default Person;
