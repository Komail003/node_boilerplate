import express from "express";
import mongoose from "mongoose";
import ticketValidationSchema from "../../Schemas/ticketSchema/ticketSchema.js";
import Tickets from "../../Models/Tickets/Tickets.js";
import  generateUniqueTicketIds from "./utils.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  console.log("Ticket data:", req.body);

  try {
    const { error } = ticketValidationSchema(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    let newTicket = req.body;

    // Generate unique ticketIds based on quantity
    newTicket.ticketIds = generateUniqueTicketIds(req.body.quantity);

    // Save new ticket with generated ticketIds
    newTicket = new Tickets(newTicket);
    await newTicket.save();

    res.status(200).send({ message: "Ticket added successfully", newTicket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all tickets
router.get("/get", async (req, res) => {
  try {
    const tickets = await Tickets.find();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
  
    try {
      const deletedForm = await Tickets.findByIdAndDelete(id);
  
      if (!deletedForm) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({ message: "ticket deleted successfully", deletedForm });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });



export default router;
