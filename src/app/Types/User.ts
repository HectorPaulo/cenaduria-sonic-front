export default interface User {
    id?: number;
    nombre: string;
    email: string;
    telefono?: string;
    direccion?: string;
    avatar: string;
    fechaRegistro: string;
    totalPedidos: number;
    puntos: number;
    favoritos?: string[];
    nivel: string;
}