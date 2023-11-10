export interface Account {
  id: string;
  name: string;
  balance: number;
  deposits?: {
    depositId: string;
    depositDay: number;
    amount: number;
  }[];
  purchase?: {
    totalPurchaseCost?: number;
    lastPurchaseDay?: number;
  };
}
