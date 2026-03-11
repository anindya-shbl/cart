import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {

  year : number | undefined;

  constructor( public CommonService: CommonService ) { }

  ngOnInit() {
    this.year =  (new Date()).getFullYear();
  }

}
