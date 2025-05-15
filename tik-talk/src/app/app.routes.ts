import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ProfileCardComponent } from './common-ui/profile-card/profile-card.component';

export const routes: Routes = [
    {path: 'login', component: LoginPageComponent},
    {path: '', component: ProfileCardComponent}

];
