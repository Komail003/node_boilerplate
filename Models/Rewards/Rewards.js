import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  rewardImageUrl: {
    type: String,
    required: true,
  },
});

const Rewards = mongoose.model("Rewards", rewardSchema);
export default Rewards;
