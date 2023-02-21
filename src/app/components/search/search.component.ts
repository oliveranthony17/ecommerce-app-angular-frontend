import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  doSearch(value: string) {
    console.log('value=' + value);
    this.router.navigateByUrl(`/search/${value}`); // routes to our "search" route and handled by ProductListComponent to reuse logic for listing products
  }
}
