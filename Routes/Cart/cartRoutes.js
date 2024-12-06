import express from "express";
import mongoose from "mongoose";
import CartItem from "../../Models/Cart/Cart.js";
import cartValidationSchema from "../../Schemas/cartSchema/cartSchema.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const { error, value } = cartValidationSchema(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: error.details.map((e) => e.message).join(", ") });
    }
    const { user_FK, reward_FK } = value;
    let cart = await CartItem.findOne({ user_FK });
    if (!cart) {
      cart = new CartItem({ user_FK, reward_FKs: [reward_FK] });
    } else {
      if (!cart.reward_FKs.includes(reward_FK)) {
        cart.reward_FKs.push(reward_FK);
      } else {
        return res
          .status(400)
          .json({ message: "Ticket already exists in the cart." });
      }
    }
    await cart.save();
    res.status(200).json({ message: "Cart updated successfully.", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});
router.get("/:user_FK", async (req, res) => {
  try {
    const { user_FK } = req.params;
    if (!mongoose.Types.ObjectId.isValid(user_FK)) {
      return res.status(400).json({ message: "Invalid User ID." });
    }
    const cart = await CartItem.findOne({ user_FK });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found for the user." });
    }
    res.status(200).json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

router.delete("/", async (req, res) => {
  try {
    const { error, value } = cartValidationSchema(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: error.details.map((e) => e.message).join(", ") });
    }
    const { user_FK, reward_FK } = value;
    const cart = await CartItem.findOne({ user_FK });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found for the user." });
    }
    cart.reward_FKs = cart.reward_FKs.filter((reward) => reward !== reward_FK);
    await cart.save();
    res.status(200).json({ message: "Reward removed from the cart.", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

export default router;
