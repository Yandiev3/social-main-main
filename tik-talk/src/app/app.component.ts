import { Component} from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from "./common-ui/sidebar/sidebar.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  profiles: any[] = [];

  constructor(){
  }
}
