import { Request, Response } from 'express';
import { setInterestRate } from '../datastore';
import sendErrorResponse from '../utils/Utilities';

const updateInterestRate = (req: Request, res: Response) => {
  try {
    const { rate } = req.body;
    const simulatedDay = Number(req.get('Simulated-Day'));

    if (typeof rate !== 'number' || rate < 0) {
      return sendErrorResponse(res, 400);
    }
    // Update the global interest rate
    setInterestRate(rate, simulatedDay);

    return res.status(200).json();
  } catch (error) {
    return sendErrorResponse(res, 500);
  }
};

export default updateInterestRate;
