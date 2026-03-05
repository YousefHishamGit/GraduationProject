import { Component, AfterViewInit } from '@angular/core';

declare var AOS: any;
declare var PureCounter: any; @Component({
  selector: 'app-about',  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})export class AboutComponent implements AfterViewInit {

  ngAfterViewInit(): void {

    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
      });
    }

    if (typeof PureCounter !== 'undefined') {
      new PureCounter();
    }

  }

}