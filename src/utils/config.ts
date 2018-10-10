import dotenv from 'dotenv';

dotenv.load();

export const hostname = process.env.HOSTNAME as string;
export const port = parseInt(process.env.PORT as string, 10);
