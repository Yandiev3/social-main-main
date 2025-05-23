import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ProfileCardComponent } from './common-ui/profile-card/profile-card.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { SettingProfileComponent } from './pages/setting-profile/setting-profile.component';
import { ChatsComponent } from './pages/chats/chats.component';

export const routes: Routes = [
    {path: 'login', component: LoginPageComponent},
    {path: 'search', component: ProfileCardComponent},
    {path: '', component: ProfilePageComponent},
    {path: 'profile/:id', component: SettingProfileComponent},
    {path: 'chats', component: ChatsComponent},
];
