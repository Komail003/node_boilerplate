import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    required: true,
  },
});

const Users = mongoose.model("Users", userSchema);
export default Users;
