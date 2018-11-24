import { createClient } from 'redis';
import { promisify } from 'util';
import { redisUrl } from './config';

export const reportsClient = createClient({ url: redisUrl, db: 0 });
export const usersClient = createClient({ url: redisUrl, db: 1 });
export const redisReportsGet = promisify(reportsClient.get).bind(reportsClient);
export const redisReportsSet = promisify(reportsClient.set).bind(reportsClient);
export const redisUsersGet = promisify(usersClient.get).bind(usersClient);
export const redisUsersSet = promisify(usersClient.set).bind(usersClient);
