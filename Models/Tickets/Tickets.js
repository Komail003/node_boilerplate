import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  correctAnswer: {
    type: Boolean,
    required: true,
  },
  reward_FK: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reward",
  },
  user_FK: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  quantity:{
    type: Number,
    required: true
},
ticketIds: {
  type: [String],  // Array of ticket IDs
  required: true,
},
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },

});

const Tickets = mongoose.model("Tickets", ticketSchema);

export default Tickets;
