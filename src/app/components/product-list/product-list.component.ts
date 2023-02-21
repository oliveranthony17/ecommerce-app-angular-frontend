import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/common/product';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html', // uses bootstrap grid html file
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = []; // array of products
  currentCategoryId: number = 1; // default category id is 1 which is books.. any way to show all?
  previousCategoryId: number = 1;
  currentCategoryName: string = "All Products";
  searchMode: boolean = false; // searchMode is false by default
  previousKeyword: string = "";

  paginationPageNumber: number = 1;
  paginationPageSize: number = 16;
  paginationTotalElements: number = 0;

  constructor(
    private route: ActivatedRoute, // to get the category id from the url
    private ProductService: ProductService, // inject the ProductService
    private cartService: CartService // inject the CartService so can be used to add product to cart
    ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {

    this.searchMode = this.route.snapshot.paramMap.has('keyword'); // if we have a keyword in the url, we are in search mode

    if (this.searchMode) {
      this.handleSearchProducts();
    }
    else {
      this.handleListProducts();
    }

  }

  handleListProducts() {

    // check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id'); // comes in from RouterLink

    if (hasCategoryId) {
      // get the "id" param string. convert string to a number using the "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!; // stores id as number (+) from url params
      this.currentCategoryName = this.route.snapshot.paramMap.get('name')!; // stores name as string
    }
    else {
      this.currentCategoryId = 1; // this only shows books... any way to show all?
      this.currentCategoryName = 'All Products'; // keeps as default
    }

    // check if we have a different category ID than previous
    if (this.previousCategoryId != this.currentCategoryId) {
      this.paginationPageNumber = 1; // reset to page 1
    }

    this.previousCategoryId = this.currentCategoryId;
    console.log(`currentCategoryId=${this.currentCategoryId}, previousCategoryId=${this.previousCategoryId}, paginationPageNumber=${this.paginationPageNumber}`);

    this.ProductService.getProductListPaginate(
      this.paginationPageNumber - 1, // spring data jpa starts at 0
      this.paginationPageSize,
      this.currentCategoryId) // pass in the category id
      .subscribe(this.processResult());

  }

  handleSearchProducts() {

    // get keyword from url params
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

    // if keyword changes (i.e. somebody searched!) then set page number to 1
    if (this.previousKeyword != theKeyword) {
      this.paginationPageNumber = 1;
    }

    this.previousKeyword = theKeyword;
    console.log(`keyword=${theKeyword}, page=${this.paginationPageNumber}`);

    // now search for the products using keyword
    this.ProductService.searchProductsPaginate(
      this.paginationPageNumber - 1,
      this.paginationPageSize,
      theKeyword)
      .subscribe(this.processResult());

  }

  updatePageSize(pageSize: string) {
    this.paginationPageSize = +pageSize;
    this.paginationPageNumber = 1;
    this.listProducts();
  }

  processResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.paginationPageNumber = data.page.number + 1; // spring data jpa starts at 0
      this.paginationPageSize = data.page.size;
      this.paginationTotalElements = data.page.totalElements;
    }
  }

  addToCart(theProduct: Product) {
    console.log(`Inside product-list.component.ts addToCart function... tried to add ${theProduct.name} to cart`);

    // create a new CartItem instance using the Product
    const theCartItem = new CartItem(theProduct); // create CartItem based on Product

    this.cartService.addToCart(theCartItem); // calls addToCart method in CartService with cartItem as param
  }

}
