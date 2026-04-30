import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    main { min-height: calc(100vh - 200px); }
  `]
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Scroll to top when route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Use setTimeout to ensure scroll happens after component renders
        setTimeout(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          // Fallback for older browsers
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }, 0);
      });
  }
}
        }, 0);
      });
  }
}
