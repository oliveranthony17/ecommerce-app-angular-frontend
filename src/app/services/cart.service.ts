import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})

export class CartService {

  cartItems: CartItem[] = [];

  // Subject is a subclass of Observable
  // We can use Subject to publish events which are then received by the subscribers
  totalPrice: Subject<number> = new Subject<number>();
  totalQuantity: Subject<number> = new Subject<number>();

  constructor() { }

  addToCart(theCartItem: CartItem) {

    console.log(`Inside cart.service.ts addToCart function... Adding to cart: ${theCartItem.name}, ${theCartItem.quantity}`);

    // check if we already have the item in our cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined; // turned off strict mode in tsconfig.json to avoid compiling error

    console.log(`alreadyExistsInCart: ${alreadyExistsInCart} and existingCartItem: ${existingCartItem} and cartItems length: ${this.cartItems.length}`);

    // if at least one item exists in the cart - check if the item we are adding is already in the cart
    if (this.cartItems.length > 0) {
      existingCartItem = this.cartItems.find( cartItem => cartItem.id === theCartItem.id) // use instead of loop
      alreadyExistsInCart = (existingCartItem !== undefined); // true if item found and so item already exists in cart
    }

      // if it's already in cart - just increment quantity by 1
    if (alreadyExistsInCart) {
      // increment the quantity of cart item
      existingCartItem.quantity++;
    }
    // if not - need to push item to cartItems array with quantity = 1 (default value)
    else {
      // add the item to the cart items array
      this.cartItems.push(theCartItem);
    }

    // either way - need to compute cart total price and total quantity
    this.computeCartTotals();
  }

  computeCartTotals() {

    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }

    // publish the new values ... all subscribers will receive the new data (two seperate events)
    // .next sends the event
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    // log data just for debugging
    this.logCartData(totalPriceValue, totalQuantityValue);
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {

    console.log('Contents of the cart');
    for (let cartItem of this.cartItems) {
      const subTotalPrice = cartItem.quantity * cartItem.unitPrice;
      console.log(`name: ${cartItem.name}, quantity=${cartItem.quantity}, unitPrice=${cartItem.unitPrice}, subTotalPrice=${subTotalPrice}`);
    }

    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
    console.log('----');
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;

    if (theCartItem.quantity === 0) {
      this.remove(theCartItem);
    }
    else {
      this.computeCartTotals();
    }
  }

  remove(theCartItem: CartItem) {
    // get index of item in the array
    const itemIndex = this.cartItems.findIndex( cartItem => cartItem.id === theCartItem.id);

    // if found - remove the item from the array at the given index
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1); // remove 1 item at the given index

      this.computeCartTotals(); // included here as required for ONLY remove
    }
  }

}
