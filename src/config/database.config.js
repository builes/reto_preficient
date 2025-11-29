import { Sequelize } from "sequelize"
import 'dotenv/config'

// database.config: configure and export a Sequelize instance connected to Postgres
const DB_NAME = process.env.DB_NAME || 'postgres'
const DB_USER = process.env.DB_USER || 'postgres'
const DB_PASSWORD = process.env.DB_PASSWORD || ''
const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = Number(process.env.DB_PORT) || 5432


const useSsl = process.env.DB_SSL === 'true' || DB_HOST.includes('supabase') || DB_HOST.includes('rds')

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'postgres',
        logging: false,
        ...(useSsl
            ? {
                    dialectOptions: {
                        ssl: {
                            require: true,
                            // Allow self-signed / managed certs (common in cloud providers)
                            rejectUnauthorized: false,
                        },
                    },
                }
            : {}),
})