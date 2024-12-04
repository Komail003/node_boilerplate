import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now, // Automatically sets the current timestamp
  },
});

// Create a model
const Tickets = mongoose.model("Tickets", ticketSchema);

export default Tickets;
