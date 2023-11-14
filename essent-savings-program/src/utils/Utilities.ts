import { Response } from 'express';

/**
 * Send a standardized error response.
 * @param {Response} res - The express response object.
 * @param {number} statusCode - The HTTP status code to send.
 */
const sendErrorResponse = (res: Response, statusCode: number) => {
  res.status(statusCode).send();
};

export default sendErrorResponse;
