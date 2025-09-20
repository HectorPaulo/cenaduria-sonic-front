import Comida from "./Comida";

export default interface Recomendacion {
    name: Comida['tag'];
    icon: Comida['icon'];
}