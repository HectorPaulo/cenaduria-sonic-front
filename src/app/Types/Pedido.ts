export interface Pedido {
    id:            number;
    status:        string;
    subtotal:      number;
    tip:           number;
    total:         number;
    estimatedTime: string;
    createdAt:     Date;
    totalItems:    number;
}
