import pg from 'pg';
import { Bd_config } from './BD_Config.js';

export default class BD {
  constructor() {
    this.client = new pg.Client(Bd_config);
    this.client.connect();
  }
  async query1(sql, values = []) {
    try {
        const respuesta = await this.client.query(sql, values);
        return respuesta;
    } catch (error) {
        throw new Error("Error al realizar la consulta: " + error.message);
    }
}

 async query2(username, password) {
    const sql = `
        SELECT *FROM users WHERE username = $1 AND password = $2`;
    const values = [username, password];
    
    try {
        const respuesta = await this.client.query(sql, values);
        return respuesta.rows[0];
    } catch (error) {
        console.error("Error al autenticar usuario:", error);
        throw new Error("Error al autenticar usuario");
    }
}

async query3(first_name, last_name, username, password) {
    const num = await this.query5()
    let id = parseInt(num[0].count)
    const sql = `INSERT INTO users (id, first_name, last_name, username, password)
        VALUES ('${id+1}', '${first_name}', '${last_name}', '${username}', '${password}')
        RETURNING id`;
        console.log(sql)
    try {
        const respuesta = await this.client.query(sql);
        return respuesta.rows[0].id;
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        throw new Error("Error al registrar usuario");
    }
}

async query4(username) {
    const sql = `SELECT * FROM users WHERE username = $1`;
    const respuesta = await this.client.query(sql, [username]);
    return respuesta.rows
    
}
async query5(){
    const sql = `SELECT COUNT(*) FROM users`;
    const respuesta = await this.client.query(sql);
    return respuesta.rows
}
}