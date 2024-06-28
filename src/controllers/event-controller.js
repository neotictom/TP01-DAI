import {Router} from "express";
import EventService from "../servicios/event-service.js";
import AuthMiddleware from "../auth/authMiddleware.js";

const eventService = new EventService();
const router = Router() 

router.get("/",  async (request, response) => {
  const limit = request.query.limit;
  const offset = request.query.offset;
  const name = request.query.name;
  const category = request.query.category;
  const startDate = request.query.startDate;
  const tag = request.query.tag;
  const url = request.originalUrl;
      try {
          const getAllEvent = await eventService.getAllEvent(limit, offset, url);
          if(name != null || category != null || startDate != null || tag != null){
            try {
                const searchEvents = await eventService.searchEvents(name, category, startDate, tag);
                return response.json(searchEvents);           
                }
            catch(error){
                console.log(error)
                return response.json(error)
            }

          }
          return response.json(getAllEvent);
      }catch(error){
          console.log("Error ej2 controller", error);
          return response.json("Error ej2 controller");
      }
    
  
})

router.get("/:id", async (request, response) => {
  const eventId = request.params.id;
  try {
    const event = await eventService.eventDetail(eventId);
    return response.json(event);
  } catch (error) {
    console.log("Error en el controlador de eventos:", error);
    return response.status(500).json({ error: "Error en el servidor" });
  }
});


router.get("/:id/enrollment", async(request, respose) => {
  const first_name = request.query.first_name
  const last_name = request.query.last_name
  const username = request.query.username
  const attended = request.query.attended
  const rating = request.query.rating
  if(first_name != null || last_name != null || username != null || attended != attended || attended != null || rating != null){
      try{
          const user = await eventService.peopleList(request.params.id, first_name, last_name, username, attended, rating)
          console.log(user)
          if(user){
              return respose.json(user)
          } else{
              console.log("Error ejercicio 5 ")
              return respose.json(" user not found")
          }
      }catch(error){
        console.error("error", error);
        console.reponse.status(404).json("not found")
      }
  }
})

router.post("/" , AuthMiddleware, async(request, response) => {
  const name = request.body.name
  const description = request.body.description
  const id_event_category = request.body.id_event_category
  const id_event_location = request.body.id_event_location
  const start_date = request.body.start_date
  const duration_in_minutes = request.body.duration_in_minutes
  const price = request.body.price
  const enabled_for_enrollment = request.body.enabled_for_enrollment
  const max_assistance = request.body.max_assistance
  const id_creator_user = request.user.id
  const evento = [name, description, id_event_category, id_event_location, start_date, duration_in_minutes, price, enabled_for_enrollment, max_assistance, id_creator_user]
  try{
      const ok = await eventService.checkParameters(evento)
      if(ok.length > 0){
        response.statusCode = 400
        return response.json(msg)
      }
      const okPlus = await eventService.createEvent(evento)  
      if(okPlus){
          return response.json(okPlus)
      } else{
          console.log("Error en creacion de eventos controller")
          return response.json("Error en la creacion")
      }
    }catch(error){
      console.log(error)
      response.statusCode = 400
      return response.json(" faltan parametros para busqueda")
  }
})

router.put("/:id", async (request, response) => {
  const name = request.body.name
  const description = request.body.description
  const id_event_category = request.body.id_event_category
  const id_event_location = request.body.id_event_location
  const start_date = request.body.start_date
  const duration_in_minutes = request.body.duration_in_minutes
  const price = request.body.price
  const enabled_for_enrollment = request.body.enabled_for_enrollment
  const max_assistance = request.body.max_assistance
  const id_creator_user = request.body.id_creator_user
  try{
      const ok = await eventService.editEvent(request.params.id, id_creator_user, name, description, id_event_category, id_event_location, start_date, duration_in_minutes, price, enabled_for_enrollment, max_assistance)
      if(ok){
      }
  } catch(error){
      console.log("Error en edicion de eventos controller")
      return response.json("Error en edicion de eventos")
  } 
})

router.delete("/:id", (request, response) => {
  const id_creator_user = request.body.id_creator_user
  try{
      const ok = eventService.deleteEvent(request.params.id,id_creator_user)
      return response.json(ok)
  }catch(error){
      console.log("Error en el delete eventos")
      return response.json("Error en borrado de evento")
  }
})

router.post("/:id/enrollment" , AuthMiddleware, async (request, response) => {
  const enrollment = {};

  enrollment.id_event = request.params.id;
  enrollment.id_user = request.user.id;
  enrollment.attended = request.query.attended;
  enrollment.rating = request.query.rating;
  enrollment.descripcion = request.query.descripcion;
  enrollment.observations = request.query.observations;
  try {
    const card = await eventService.eventInscription(enrollment);
    return response.json(card);
  } catch (error) {
    console.log(error);
    return response.json(error);
  }
})
router.delete("/:id/enrollment")

router.patch("/:id/enrollment",async (request, response) => {
    const idEvento = request.params.id;
    const rating = request.query.rating;
    try {
      const mensaje = await eventService.rating(idEvento, rating);
      console.log(mensaje);
      return response.status(200).send(mensaje);
    } catch (error) {
      console.log(error);
      return response.json(error);
    }
  });

export default router;