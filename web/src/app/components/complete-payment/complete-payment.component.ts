import { Component, OnInit } from '@angular/core';
import { Cart } from 'src/app/classes/cart';
import { NavigationService } from 'src/app/services/navigation.service';
import { DataService } from 'src/app/services/data.service';
import { AuthenticationService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-complete-payment',
  templateUrl: './complete-payment.component.html',
  styleUrls: ['./complete-payment.component.scss']
})
export class CompletePaymentComponent implements OnInit {
  cart: Cart[];
  constructor(
    private navigationService: NavigationService,
    public authenticationService: AuthenticationService,
    private dataService: DataService) {
    this.cart = new Array();
  }

  ngOnInit() {
    this.dataService.setCart(this.cart);
  }

  goToProduct() {
    this.navigationService.toProducts();
  }

}
