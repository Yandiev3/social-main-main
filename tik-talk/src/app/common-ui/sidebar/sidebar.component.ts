import { Router, RouterModule } from "@angular/router";
import { Component} from '@angular/core';
import { UserService } from "../../service/user.service";
import { NgIf } from "@angular/common";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, NgIf],
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
        console.log(this.user);
      },
      error: (error: any) => {
        console.error("Error fetching profile:", error);
      },
    });
   
  }
}