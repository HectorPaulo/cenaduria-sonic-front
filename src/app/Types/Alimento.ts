import { Category } from './Category';

export interface Alimento {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  active: boolean;
  category: Category;
}
