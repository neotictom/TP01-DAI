import BD from "../repositories/user-repositories.js";

const bd = new BD();

export default class UserService {
  async login(username, password) {
    try {
        const usuario = await bd.query4(username);

        if (!usuario) {
            console.log(error)
        }

        if (password !== usuario.password) {
            console.log(error)
        }

    } catch (error) {
        console.error('Error durante el inicio de sesión:');
        throw new Error('Error interno del servidor');
    }
}

async register(firstName, lastName, username, password) {
    try {
        if (firstName.length < 3 || lastName.length < 3) {
            throw new Error('Los campos first_name o last_name deben tener al menos tres caracteres.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(username)) {
            throw new Error('El email es inválido.');
        }

        if (password.length < 3) {
            throw new Error('El campo password debe tener al menos tres caracteres.');
        }

        const userId = await bd.query3(firstName, lastName, username, password);

        return { success: true, message: 'Usuario creado con éxito.'};
    } catch (error) {
        console.error('Error durante el registro de usuario:');
        throw new Error('Error interno del servidor');
    }
}
}
