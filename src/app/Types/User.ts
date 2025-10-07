export default interface User {
    id?: number;
    nombre: string;
    email: string;
    telefono?: string;
    avatar?: string;
    fechaRegistro: string;
    pedidosRecientes?: string[];
}