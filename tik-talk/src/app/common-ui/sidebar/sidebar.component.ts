import { Router } from "@angular/router";
import { Component} from '@angular/core';
import { UserService } from "../../service/user.service";
import { NgFor } from "@angular/common";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent{
  user: any;
  isAdmin: boolean = false;
  

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