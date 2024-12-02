import mongoose from 'mongoose';

// Define the schema for the form data
const formSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
});

// Export the model using ES module syntax
const Form = mongoose.model('Form', formSchema);
export default Form;
