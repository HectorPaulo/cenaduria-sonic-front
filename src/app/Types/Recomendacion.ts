import Alimento from './Pedido';

export default interface Recomendacion {
  name: Alimento['tag'];
  icon: Alimento['icon'];
}
