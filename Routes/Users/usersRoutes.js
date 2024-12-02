import express from 'express';
import mongoose from 'mongoose'; 
import bcrypt from "bcrypt";
import Users from "../../Models/Users/users.js"
import userValidationSchema from "../../Schemas/userSchema/userschema.js"
const router = express.Router();


router.post('/add', async (req, res) => {
  // console.log("im here")
    const { error } = userValidationSchema(req.body);  
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    try {
      let User = await Users.findOne({ email: req.body.email });
      if (User) {
        return res.status(400).send("User already exists.");
      }
      let newUser = req.body;
      let hashedPwd = await bcrypt.hash(newUser.password, 10);
      newUser.password = hashedPwd;
      newUser = new Users(req.body);
      // console.log("hello")

      await newUser.save();
      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

router.get('/get', async (req, res) => {
  try {
    const users = await Users.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// login for user
router.post("/login", async (req, res) => {
  // console.log("goku")
  try {
    const userCredentials = req.body;
    console.log(userCredentials);

    const foundUser = await Users.findOne({
      email: userCredentials.email,
    });
    if (foundUser) {
      const passwordMatch = await bcrypt.compare(
        userCredentials.password,
        foundUser.password
      );
      if (passwordMatch) {
        return res
          .status(200)
          .send({ message: "Login successful", user: foundUser });
      } else {
        return res.status(400).send("Email or password is incorrect");
      }
    } else {
      return res.status(400).send("Email or password is incorrect");
    }
  } catch (err) {
    return res.status(500).send("Error: " + err);
  }
});

router.patch('/update/:id', async (req, res) => {
  const { id } = req.params;
// console.log("i am running ")
  const { error } = userValidationSchema(req.body); 
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const updatedUser = await Users.findByIdAndUpdate(id, req.body, {
      new: true, 
      runValidators: true
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// delete user
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const deletedForm = await Users.findByIdAndDelete(id);

    if (!deletedForm) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', deletedForm });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;