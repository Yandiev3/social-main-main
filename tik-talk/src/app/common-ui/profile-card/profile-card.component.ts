import { Router } from "@angular/router";
import { Component} from '@angular/core';
import { LoginService } from "../../service/login.service";
import { UserService } from "../../service/user.service";
import { NgFor } from "@angular/common";

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [NgFor],
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent{
  private _userService : UserService;
  profiles: any[] = [];
  isAdmin: boolean = false;
  

  constructor(UserService: UserService,private router: Router, private profile: LoginService){  
    this._userService = UserService;
    
  }
  async ngOnInit() {
    this.profiles = await this._userService.getProfiles();
    console.log(this.profiles);

    
  }
}