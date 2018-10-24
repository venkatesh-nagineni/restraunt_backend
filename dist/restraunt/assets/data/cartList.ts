export class ShopListTypes {
dishType: string;
dishItems: Array<Object>;
/* itemNo: number;
itemName: string;
itemShortDescription: string;
itemPrice: any;
itemDetailedDescription: Array<Object>; */
}

export class Angebotetypes {
  _id: string;
  AngeboteImg?: string;
  AngebotePrice: number;
  AngeboteName: string;
  AngeboteDesc?: string;
  AngeboteNo?: string;
}

/* export class Product {
  id: number;
  name: string;
  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

 public products: Product[] = [
  new Product(1, "Product 001"),
  new Product(2, "Product 002"),

];  */
