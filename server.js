import 'dotenv/config';
import EventController from "./src/controllers/event-controller.js";
import UserController from "./src/controllers/user-controller.js";
import ProvincesController from "./src/controllers/provinces-controller.js";
import LocationController from "./src/controllers/location-controller.js";
import CategoryController from './src/controllers/event_category-controller.js';
import EventLocationController from './src/controllers/event_location-controller.js';
import express from "express"


const app = express(); 
app.use(express.json()); 
const port = 3600;


app.use("/event", EventController);
app.use("/user", UserController);
app.use("/province", ProvincesController);
app.use("/location", LocationController);
app.use("/event-category", CategoryController);
app.use("/event-location", EventLocationController)
app.listen(port, () =>{
    console.log(`Server running on port ${port}`)
})