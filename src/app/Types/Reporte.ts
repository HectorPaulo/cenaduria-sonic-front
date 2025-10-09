export default interface Reporte {
    id: number;
    nombre: string;
    comentario?: string;
    fecha: string;
    cantidadVentas: number;
    totalIngresos: number;
    empresa: string;
    logo?: string;
}