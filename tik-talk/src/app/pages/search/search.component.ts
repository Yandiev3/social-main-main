import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../service/user.service';

interface Profile {
  _id: string;
  name: string;
  username: string;
  avatar: string;
  about: string;
  stack: string[];
  subscribers: string[];
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [NgFor, NgIf, RouterModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  profiles: Profile[] = [];
  filteredProfiles: Profile[] = [];
  currentUser: Profile | null = null;
  searchTerm: string = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.profiles = (await this.userService.getProfiles()) as Profile[];
      this.userService.getProfile().subscribe({
        next: (res: Profile) => {
          this.currentUser = res;
          this.filteredProfiles = this.profiles.filter((profile) => profile._id !== this.currentUser?._id);
        },
        error: (error) => {
          console.error('Ошибка получения профиля:', error);
        }
      });
    } catch (error) {
      console.error('Ошибка инициализации:', error);
    }
  }

  checkSubscriptionStatus(subscribers: string[]): boolean {
    const userId = localStorage.getItem('id');
    return userId ? subscribers.includes(userId) : false;
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filterProfiles();
  }

  filterProfiles(): void {
    this.filteredProfiles = this.profiles
      .filter((profile) => profile._id !== this.currentUser?._id)
      .filter(
        (profile) =>
          profile.name.toLowerCase().includes(this.searchTerm) ||
          profile.username.toLowerCase().includes(this.searchTerm)
      );
  }

  async toggleSubscribe(profile: Profile): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    try {
      if (this.checkSubscriptionStatus(profile.subscribers)) {
        await this.userService.unsubscribe(profile._id, token);
        profile.subscribers = profile.subscribers.filter((id) => id !== localStorage.getItem('id'));
      } else {
        await this.userService.subscribe(profile._id, token);
        profile.subscribers = [...profile.subscribers, localStorage.getItem('id')!];
      }
    } catch (error) {
      console.error('Ошибка при изменении статуса подписки:', error);
    }
  }

  openChat(profile: Profile): void {
    this.router.navigate(['/chats'], { queryParams: { userId: profile._id } });
  }
}