import { Component, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { UserService } from '../../service/user.service';
import { ActivatedRoute, Router} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-setting-profile',
  templateUrl: './setting-profile.component.html',
  styleUrls: ['./setting-profile.component.scss'],
  imports: [FormsModule, NgSelectModule],
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


  programmingSkills = [
    { id: 1, name: 'JavaScript' },
    { id: 2, name: 'TypeScript' },
    { id: 3, name: 'Python' },
    { id: 4, name: 'Java' },
    { id: 5, name: 'C#' },
    { id: 6, name: 'PHP' },
    { id: 7, name: 'Ruby' },
    { id: 8, name: 'Go' },
    { id: 9, name: 'Swift' },
    { id: 10, name: 'Kotlin' },
    { id: 11, name: 'Rust' },
    { id: 12, name: 'Dart' },
  ];

  selectedSkills: any[] = [];


  constructor(
    private router: Router, 
    private profile: UserService, 
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this._id = this.route.snapshot.paramMap.get("id");

     this.profile.getProfile().subscribe({
      next: (res: any) => {
        this.user = res;

        this._id = this.user._id || '';
        this.username = this.user.username || '';
        this.avatar = this.user.avatar || '';
        this.city = this.user.city || '';
        this.name = this.user.name || '';
        this.age = this.user.age || '';
        this.email = this.user.email || '';
        this.stack = this.user.stack || '';
        this.about = this.user.about || '';

        if (this.user.stack && Array.isArray(this.user.stack)) {
          this.selectedSkills = this.programmingSkills.filter(skill => 
            this.user.stack.includes(skill.name)
          );
        }
  },
        error: (error: any) => {
        console.error("Error fetching profile:", error);
      },
    });
  }  
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  async editUser() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Нет доступа');
      this.router.navigate(['/login']);
      return;
    }

    try {
      const skillsArray = this.selectedSkills.map(skill => skill.name)
      const updatedData = {
        _id: this._id,
        username: this.username,
        avatar: this.avatar,
        city: this.city,
        name: this.name,
        age: this.age,
        email: this.email,
        stack: skillsArray,
        about: this.about
      };

      const res = await this.profile.editUser(updatedData, token);
      this.router.navigate(['/profile', this.user._id] );
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      alert('Ошибка при обновлении профиля');
    }
  }
}