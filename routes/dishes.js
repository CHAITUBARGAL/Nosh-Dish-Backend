import express from "express";
import Dish from "../models/Dish.js";
import { v4 as uuidv4 } from "uuid"; // npm install uuid

const router = express.Router();

// Get all dishes
router.get("/", async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.json(dishes);
  } catch (err) {
    res.status(500).send("Error fetching dishes");
  }
});

// Toggle publish status
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

// Add new dish
router.post("/", async (req, res) => {
  try {
    const { dishName, imageUrl, isPublished } = req.body;
    if (!dishName || !imageUrl) {
      return res.status(400).send("Missing fields");
    }

    const newDish = new Dish({
      dishId: uuidv4(), // auto-generated ID
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

// import express from "express";
// import Dish from "../models/Dish.js";

// const router = express.Router();

// // Get all dishes
// router.get("/", async (req, res) => {
//   try {
//     const dishes = await Dish.find();
//     res.json(dishes);
//   } catch (err) {
//     res.status(500).send("Error fetching dishes");
//   }
// });

// // Toggle publish status
// router.patch("/:id/toggle", async (req, res) => {
//   try {
//     const dish = await Dish.findOne({ dishId: req.params.id });
//     if (!dish) return res.status(404).send("Dish not found");
//     dish.isPublished = !dish.isPublished;
//     await dish.save();
//     req.io.emit("dishUpdated", dish); // emit from request context
//     res.json(dish);
//   } catch (err) {
//     res.status(500).send("Error toggling dish status");
//   }
// });

// // POST: Add new dish
// router.post("/", async (req, res) => {
//   try {
//     const { dishId, dishName, imageUrl, isPublished } = req.body;
//     if (!dishId || !dishName || !imageUrl) {
//       return res.status(400).send("Missing fields");
//     }

//     const newDish = new Dish({ dishId, dishName, imageUrl, isPublished });
//     await newDish.save();

//     req.io.emit("dishUpdated", newDish);
//     res.status(201).json(newDish);
//   } catch (err) {
//     res.status(500).send("Error adding dish");
//   }
// });

// export default router;
