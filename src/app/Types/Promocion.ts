// export default interface Promocion {
//     name: string;
//     description: string;
//     image: string;
// }

export interface ProductSummary {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
}

export interface WeeklyRule {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  activeNow: boolean;
}

export default interface Promocion {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  type: 'TEMPORARY' | 'RECURRING';
  startsAt?: string;
  endsAt?: string;
  active: boolean;
  currentlyValid: boolean;
  products: ProductSummary[];
  weeklyRules: WeeklyRule[];
}
