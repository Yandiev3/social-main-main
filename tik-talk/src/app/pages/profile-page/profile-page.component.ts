import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../service/user.service';
import { NgFor, NgIf } from '@angular/common';


@Component({
    selector: 'app-profile-page',
    standalone: true,
    imports: [RouterModule, NgIf, NgFor],
    templateUrl: './profile-page.component.html',
    styleUrls: ['./profile-page.component.scss']
  })

  export class ProfilePageComponent{
    user: any;

    aa = false;

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