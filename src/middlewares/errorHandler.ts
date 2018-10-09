import { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(err);
  res.sendStatus(500);
};

export default errorHandler;
