import dotenv from 'dotenv';

dotenv.load();

export const hostname = process.env.HOSTNAME as string;
export const port = parseInt(process.env.PORT as string, 10);
export const dbUrl = process.env.DB_URL as string;
export const jwtSecretKey = process.env.JWT_SECRET_KEY as string;
export const gcvApiKey = process.env.GCV_API_KEY as string;
