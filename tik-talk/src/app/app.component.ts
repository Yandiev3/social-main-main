import { Component} from '@angular/core';
import { ProfileCardComponent } from './common-ui/profile-card/profile-card.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [ProfileCardComponent, LoginPageComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  profiles: any[] = [];

  constructor(){
  }
}
