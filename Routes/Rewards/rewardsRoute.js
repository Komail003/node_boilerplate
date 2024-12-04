import express from "express";
import mongoose from "mongoose";
import Rewards from "../../Models/Rewards/Rewards.js";
import rewardValidationSchema from "../../Schemas/rewardSchema/rewardSchema.js";
const router = express.Router();

router.post("/add", async (req, res) => {
    try{
        const { error } = rewardValidationSchema(req.body);
        if (error) {
          return res.status(400).json({ message: error.details[0].message });
        }
        // console.log("i am a reward", req.body);
        let newReward = req.body; 
        newReward = new Rewards(req.body);
        await newReward.save();
        res.status(200).send({message :"reward added successFully", newReward });
    }catch(err){
        res.status(500).json({ message: err.message });
    }
});

// all rewards
router.get("/get", async (req, res) => {
    try {
      const rewards = await Rewards.find();
      res.json(rewards);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
// reward update
  router.patch("/update/:id", async (req, res) => {
    const { id } = req.params;
    // console.log("i am running ")
    const { error } = rewardValidationSchema(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
  
    try {
      const updatedReward = await Rewards.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
  
      if (!updatedReward) {
        return res.status(404).json({ message: "Reward not found" });
      }
  
      res.status(200).send({ message:"Reward updated successfully" ,updatedReward});
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });


  router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
  
    try {
      const deletedForm = await Rewards.findByIdAndDelete(id);
  
      if (!deletedForm) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({ message: "reward deleted successfully", deletedForm });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  


export default router;