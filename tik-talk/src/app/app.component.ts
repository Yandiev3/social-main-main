import { Component} from '@angular/core';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from "./common-ui/sidebar/sidebar.component";
import { filter } from 'rxjs';
import { NgIf } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, RouterModule, NgIf, NgSelectModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  profiles: any[] = [];
  showSidebar = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showSidebar = !event.url.includes('/login');
      });
  }
}
