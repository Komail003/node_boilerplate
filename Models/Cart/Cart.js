import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  reward_FKs: { 
    type: [String], 
    required: true, default: []
},
  user_FK: { type: String, required: true },
});
const Cart = mongoose.model("CartItem", cartItemSchema);
export default Cart;
