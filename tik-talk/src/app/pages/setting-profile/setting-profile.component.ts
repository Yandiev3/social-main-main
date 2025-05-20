import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-setting-profile',
  imports: [],
  templateUrl: './setting-profile.component.html',
  styleUrl: './setting-profile.component.scss'
})
export class SettingProfileComponent {
  user: any;

  constructor(private router: Router, private profile: UserService){  
    
  }
  ngOnInit() {
    this.profile.getProfile().subscribe({
      next: (res: any) => {
        this.user = res;
      },
      error: (error: any) => {
        console.error("Error fetching profile:", error);
      },
    });
  }  
}
