import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { UserService } from '../../service/user.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { LoginService } from '../../service/login.service';

@Component({
  selector: 'app-search',
  imports: [NgFor, RouterModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
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
