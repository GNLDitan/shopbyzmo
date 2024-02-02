import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-client-page',
  templateUrl: './client-page.component.html',
  styleUrls: ['./client-page.component.scss']
})
export class ClientPageComponent implements OnInit {

  isScriptDone: Subscription;
  isDoneLoad: boolean;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.isScriptDone = this.dataService.isScriptDone$.subscribe((isDone) => {
      this.isDoneLoad = isDone;
    });

  }

}
