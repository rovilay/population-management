/* eslint no-console: 0 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let dbURL = process.env.DB_URL;
export const db = mongoose.connection;


if (process.env.NODE_ENV === 'test') {
    dbURL = process.env.TEST_DB_URL;
}

db.on('connected', () => {
    console.log('Connection Established');
});

db.on('reconnected', () => {
    console.log('Connection Reestablished');
});

db.on('disconnected', () => {
    console.log('Connection Disconnected');
});

db.on('close', () => {
    console.log('Connection Closed');
});

db.once('open', () => console.log('mongoDB is connected!'));
db.on('error', console.error.bind(console, 'connection error:'));

const runDB = async () => {
    try {
        console.log('connecting db ...');
        await mongoose.connect(dbURL, {
            useCreateIndex: true,
            useNewUrlParser: true,
            autoReconnect: true,
            reconnectTries: 1000000,
            reconnectInterval: 3000
        });
        return;
    } catch (error) {
        console.error(error);
    }
};


export default runDB;
