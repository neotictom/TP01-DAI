import BD from "../repositories/event-repositories.js";
const bd = new BD();

export default class EventService {

    parsedOffset(offset) {
        return !isNaN(parseInt(offset)) ? parseInt(offset) : 0;
    }

    parsedLimit(limit) {
        return !isNaN(parseInt(limit)) ? parseInt(limit) : 15;
    }

    async getAllEvent(pageSize, requestedPage, path) {
        const pageSizes = this.parsedLimit(pageSize);
        const requestedPages = this.parsedOffset(requestedPage);
        const answer = await bd.query1(pageSizes, requestedPages);
        const totalCount = answer.length;
        return answer.map(row => ({
            event: {
                id: row.id,
                name: row.name,
                description: row.description,
                start_date: row.start_date,
                duration_in_minutes: row.duration_in_minutes,
                price: row.price,
                enabled_for_enrollment: row.enabled_for_enrollment,
                max_assistance: row.max_assistance,
            },
            creator_user: {
                id: row.user_id,
                username: row.username,
                first_name: row.first_name,
                last_name: row.last_name,
            },
            event_categories: {
                id: row.eventcat_id,
                name: row.eventcat_name,
            },
            event_location: {
                ...row.event_location,
                location: {
                    ...row.location,
                    province: row.province,
                },
            },
            tags: row.tags,
            pagination: {
                limit: pageSizes,
                offset: requestedPages,
                nextPage: ((requestedPages + 1) * pageSizes <= totalCount) ? `${process.env.BASE_URL}/${path}?limit=${pageSizes}&offset=${requestedPages + 1}` : null,
                total: totalCount,
            }
        }));
    }

    async searchEvents(name, category, startDate, tag, path) {
        const answer = await bd.query2(name, category, startDate, tag);
        return answer.map(row => ({
            event: {
                id: row.id,
                name: row.name,
                description: row.description,
                start_date: row.start_date,
                duration_in_minutes: row.duration_in_minutes,
                price: row.price,
                enabled_for_enrollment: row.enabled_for_enrollment,
                max_assistance: row.max_assistance,
            },
            creator_user: {
                id: row.user_id,
                username: row.username,
                first_name: row.first_name,
                last_name: row.last_name,
            },
            event_categories: {
                id: row.eventcat_id,
                name: row.eventcat_name,
            },
            event_location: {
                ...row.event_location,
                location: {
                    ...row.location,
                    province: row.province,
                },
            },
            tags: row.tags,
            pagination: {
                nextPage: `${process.env.BASE_URL}/${path}${(row.name) ? `&eventName=${row.name}` : ''}${(row.eventcat_id) ? `&eventCategory=${row.eventcat_id}` : ''}${(row.start_date) ? `&eventDate=${row.start_date}` : ''}`,
            }
        }));
    }

    async eventDetail(id) {
        const answer = await bd.query3(id);
        return answer.map(row => ({
            event: {
                id: row.id,
                name: row.name,
                description: row.description,
                start_date: row.start_date,
                duration_in_minutes: row.duration_in_minutes,
                price: row.price,
                enabled_for_enrollment: row.enabled_for_enrollment,
                max_assistance: row.max_assistance,
            },
            creator_user: {
                id: row.user_id,
                username: row.username,
                first_name: row.first_name,
                last_name: row.last_name,
            },
            event_categories: {
                id: row.eventcat_id,
                name: row.eventcat_name,
            },
            event_location: {
                id: row.el_id,
                name: row.el_name,
                full_address: row.full_address,
                latitude: row.latitude,
                longitude: row.longitude,
                max_capacity: row.max_capacity,
            },
            tags: row.tags,
        }));
    }

    async peopleList(id, first_name, last_name, username, attended, rating) {
        const answer = await bd.query4(id, first_name, last_name, username, attended, rating);
        return answer.map(row => ({
            user: {
                id: row.user_id,
                first_name: row.first_name,
                last_name: row.last_name,
                username: row.username,
            },
            enrollment: {
                id: row.enrollment_id,
                id_event: row.event_id,
                id_user: row.user_id,
                description: row.enrollment_description,
                registration_date_time: row.registration_date,
                attended: row.attended,
                observations: row.observations,
                rating: row.rating,
            },
        }));
    }

    async createEvent(evento) {
        return bd.query5(evento);
    }

    async editEvent(event) {
        const checkUser = await bd.query9(event.id);
        if (event.id_creator_user === checkUser[0].id_creator_user) {
            return await bd.query6(event);
        } else {
            throw new Error("Usuario no autorizado para editar este evento");
        }
    }

    async deleteEvent(id, id_creator_user) {
        const checkUser = await bd.query9(id);
        if (id_creator_user === checkUser[0].id_creator_user) {
            return await bd.query7(id, id_creator_user);
        } else {
            throw new Error("Usuario no autorizado para eliminar este evento");
        }
    }

    async checkParameters(event) {
        switch (true) {
            case (!event.name || event.name.length < 3):
                return "Nombre inválido";
            case (!event.description || event.description.length < 3):
                return "Descripción inválida";
            case (event.price < 0):
                return "Precio inválido menor que 0";
            case (event.duration_in_minutes < 0):
                return "Duración inválida menor que 0";
        }
        const max_capacity = await this.maxCapacity(event.id_event_location);
        if (Number(event.max_assistance) > max_capacity[0].max_capacity) {
            return "Capacidad máxima inválida";
        }
        return "";
    }

    async maxCapacity(idEL) {
        return await bd.query8(idEL);
    }

    async checkEnrolled(id) {
        const enrollment = await bd.query10(id);
        return Number(enrollment[0].count);
    }

    async rateEvent(id_evento, rating, observations, id_user) {
        return await bd.query11(id_evento, rating, observations, id_user);
    }

    async verifyEnroll(id_evento, rating, id_user) {
        const userTa = await bd.query14(id_user);
        if (!userTa.length) {
            return "No está inscrito el usuario";
        }
        const event = await bd.query3(id_evento);
        if (!event.length) {
            return false;
        }
        const start_date = new Date(event[0].start_date);
        const hoy = new Date();
        if (start_date > hoy) {
            return "Error, el evento no ha finalizado";
        }
        if (rating < 1 || rating > 10) {
            return "Error, rating ingresado inválido, debe estar entre 1 y 10";
        }
        return true;
    }

    async enrollEvent(id_user, event_id) {
        const event = await bd.query3(event_id);
        if (!event.length) {
            throw new Error("Evento no encontrado");
        }
        const { max_assistance, start_date, enabled_for_enrollment } = event[0];
        const currentEnrolled = await this.checkEnrolled(event_id);
        if (currentEnrolled >= max_assistance) {
            throw new Error("Capacidad máxima alcanzada");
        }
        if (new Date(start_date) <= new Date()) {
            throw new Error("No se puede inscribir a un evento que ya ocurrió o está ocurriendo hoy");
        }
        if (!enabled_for_enrollment) {
            throw new Error("Evento no habilitado para inscripción");
        }
        return bd.query12(id_user, event_id);
    }

    async unrollEvent(id_user, event_id) {
        const event = await bd.query3(event_id);
        if (!event.length) {
            throw new Error("Evento no encontrado");
        }
        const { start_date } = event[0];
        if (new Date(start_date) <= new Date()) {
            throw new Error("No se puede desinscribir de un evento que ya ocurrió o está ocurriendo hoy");
        }
        return bd.query13(id_user, event_id);
    }
}
