import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { UserService } from '../../service/user.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { Token } from '@angular/compiler';

@Component({
  selector: 'app-search',
  imports: [NgFor, RouterModule, NgIf],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  private _userService: UserService;
  
  profiles: any[] = [];
  filteredProfiles: any[] = [];
  currentUser: any = {};
  searchTerm: string = '';
  isAdmin: boolean = false;

  constructor(UserService: UserService, private router: Router, private profile: LoginService) {  
    this._userService = UserService;
  }

  async ngOnInit() {
    this.profiles = await this._userService.getProfiles();
    this._userService.getProfile().subscribe(async (res: any) => {
      this.currentUser = res;
      this.filteredProfiles = this.profiles.filter(profile => profile._id !== this.currentUser._id);
    });
  }

  checkSubscriptionStatus(subscribers: any): boolean {
    const userId = localStorage.getItem("id");  
    return subscribers.some((item: string) => item === userId);
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.filterProfiles();
  }

  filterProfiles() {
    this.filteredProfiles = this.profiles
      .filter(profile => profile._id !== this.currentUser._id)
      .filter(profile => 
        profile.name.toLowerCase().includes(this.searchTerm) ||
        profile.username.toLowerCase().includes(this.searchTerm)
      );
  }

  async toggleSubscribe(profile: any) {
  const token = localStorage.getItem('token');
  if (!token) {
    this.router.navigate(['/login']);
    return;
  }

  try {
    if (this.checkSubscriptionStatus(profile.subscribers)) {
      await this._userService.unsubscribe(profile._id, token);
    } else {
      await this._userService.subscribe(profile._id, token);
    }
    // Toggle the subscription status for this specific profile
    profile.isSubscribed = !profile.isSubscribed;
  } catch (error) {
    console.error("Ошибка при изменении статуса подписки:", error);
  }
}
}