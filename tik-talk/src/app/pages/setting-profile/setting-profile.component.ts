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
  encapsulation: ViewEncapsulation.None
})
export class SettingProfileComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  user: any;
  _id: any = '';
  username: string = '';
  avatar: any = '';
  city: string = '';
  name: string = '';
  lastname: string = '';
  age: any = '';
  email: string = '';
  stack: any = '';
  about: string = '';
  error: string = '';
  // originalData: any = {};

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
        this.lastname = this.user.lastname || '';
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
        lastname: this.lastname,
        age: this.age,
        email: this.email,
        stack: skillsArray,
        about: this.about
      };
      
      const res = await this.profile.editUser(updatedData, token);

      this.user = { ...this.user, ...updatedData };


      this.router.navigate(['/'] );
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      alert('Ошибка при обновлении профиля');
    }
  }

  async  onfileSelected(event: Event){
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        this.error = "Допустимы только изоображения JPEG , JPG или PNG";
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        this.error = "Размер файла не должен привышать 2МБ";
        return;
      }

      try {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.avatar = e.target.result;
      };
      reader.readAsDataURL(file);

      const response = await this.profile.uploadAvatar(file, this._id);
      this.user.avatar = response.user.avatar; // Обновляем URL с сервера
      this.error = "";
      } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
      this.error = "Ошибка загрузки аватара";
      }
      this.error = " ";
    }
  }

   logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']); 
  }
}