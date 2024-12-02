import express from 'express';
import mongoose from 'mongoose';
import Form from '../Models/Form.js'; 
import formValidationSchema from '../Schemas/formSchema.js';

const router = express.Router();


router.post('/add', async (req, res) => {
  const { error } = formValidationSchema(req.body);  
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // If data is valid, create a new form document using the Mongoose model
  const newForm = new Form(req.body);

  try {
    await newForm.save();
    res.status(201).json(newForm);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET route to fetch all forms
router.get('/get', async (req, res) => {
  try {
    const forms = await Form.find();
    res.json(forms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH route to update form data (using PATCH instead of PUT)
router.patch('/update/:id', async (req, res) => {
  const { id } = req.params;

  // Validate request body using Joi schema
  const { error } = formValidationSchema(req.body); // Use the schema directly, no need to call `.validate()`
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const updatedForm = await Form.findByIdAndUpdate(id, req.body, {
      new: true, 
      runValidators: true
    });

    if (!updatedForm) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.json(updatedForm);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// DELETE route to delete a form
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const deletedForm = await Form.findByIdAndDelete(id);

    if (!deletedForm) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.json({ message: 'Form deleted successfully', deletedForm });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;