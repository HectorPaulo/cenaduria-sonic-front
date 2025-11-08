// export default interface Promocion {
//     name: string;
//     description: string;
//     image: string;
// }

export default interface Promocion {
    id:             number;
    name:           string;
    imageUrl:       string;
    price:          number;
    type:           string;
    active:         boolean;
    currentlyValid: boolean;
}
