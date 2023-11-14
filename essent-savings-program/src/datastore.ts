import { cloneDeep } from 'lodash';
import { Account } from './models/account';
import products, { Product } from './models/products';

export const accounts: Account[] = [];
export const productList: Product[] = cloneDeep(products);
let interestRate = 0.08;

// eslint-disable-next-line max-len
export const interestRateHistory: { day: number; rate: number }[] = [{ day: 0, rate: interestRate }];

// Function to update interest rate
export const setInterestRate = (newRate: number, effectiveFromDay: number): void => {
  interestRate = newRate;
  interestRateHistory.push({ day: effectiveFromDay, rate: newRate });
};

export const getInterestRate = (): number => interestRate;

// Interest rate calculation for a given day
export const getInterestRateForDay = (day: number): number => {
  const applicableRate = interestRateHistory
    .slice().reverse()
    .find((rateChange) => rateChange.day <= day) || interestRateHistory[0];

  return applicableRate.rate;
};
