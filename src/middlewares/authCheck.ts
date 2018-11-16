import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError, verify } from 'jsonwebtoken';
import { findUserByName } from '../services/user';
import { jwtSecretKey } from '../utils/config';

const authCheck = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.authorization as string;

  try {
    const decode: any = await verify(accessToken, jwtSecretKey);

    const { err, findUser } = await findUserByName(decode.name);
    if (err) {
      throw err;
    } else {
      if (findUser) {
        req.body = { ...req.body, ...{ name: decode.name } };
        next();
      } else {
        throw new JsonWebTokenError('No such user found.');
      }
    }
  } catch (err) {
    if (err.name === JsonWebTokenError.name || err.name === TokenExpiredError.name) {
      console.log(err);
      res.status(401).send();
    } else {
      next(err);
    }
  }
};

export default authCheck;
