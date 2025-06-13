import express from "express";
import Dish from "../models/Dish.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.json(dishes);
  } catch (err) {
    res.status(500).send("Error fetching dishes");
  }
});

router.patch("/:id/toggle", async (req, res) => {
  try {
    const dish = await Dish.findOne({ dishId: req.params.id });
    if (!dish) return res.status(404).send("Dish not found");
    dish.isPublished = !dish.isPublished;
    await dish.save();
    req.io.emit("dishUpdated", dish);
    res.json(dish);
  } catch (err) {
    res.status(500).send("Error toggling dish status");
  }
});

router.post("/", async (req, res) => {
  try {
    const { dishName, imageUrl, isPublished } = req.body;
    if (!dishName || !imageUrl) {
      return res.status(400).send("Missing fields");
    }

    const imageUrlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))$/i;
    if (!imageUrlPattern.test(imageUrl)) {
      return res
        .status(400)
        .send("Invalid image URL. Must end with an image extension.");
    }

    const newDish = new Dish({
      dishId: uuidv4(),
      dishName,
      imageUrl,
      isPublished: isPublished ?? true,
    });

    await newDish.save();
    req.io.emit("dishUpdated", newDish);
    res.status(201).json(newDish);
  } catch (err) {
    res.status(500).send("Error adding dish");
  }
});

export default router;
