import { Component, ViewChild, ElementRef } from '@angular/core';
import { UserService } from '../../service/user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-setting-profile',
  templateUrl: './setting-profile.component.html',
  styleUrls: ['./setting-profile.component.scss']
})
export class SettingProfileComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  user: any;
  _id: any = '';
  username: string = '';
  avatar: any = '';
  city: string = '';
  name: string = '';
  age: any = '';
  email: string = '';
  stack: any = '';
  about: string = '';

 constructor(private router: Router, private profile: UserService, private route: ActivatedRoute) {  
      
  }
  ngOnInit() {
    this._id = this.route.snapshot.paramMap.get("id");

    this.profile.getProfile().subscribe({
      next: (res: any) => {
        this.user = res;
      },
      error: (error: any) => {
        console.error("Error fetching profile:", error);
      },
    });
  }  
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }
  editUser() {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('Нет доступа');
      
      return;
    }
    this.profile.editUser({
      _id: this.user._id,
      username : this.username, 
      avatar : this.avatar, 
      city: this.city, 
      name: this.name, 
      age: this.age, 
      email: this.email, 
      stack: this.stack, 
      about: this.about
    }, token);
  }
}