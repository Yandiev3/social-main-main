import { Component, ViewChild, ElementRef } from '@angular/core';
import { UserService } from '../../service/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setting-profile',
  templateUrl: './setting-profile.component.html',
  styleUrls: ['./setting-profile.component.scss']
})
export class SettingProfileComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  user = {
    avatar: '',
    name: 'Район Гослинг',
    username: 'гуап.gosling',
    firstName: '',
    lastName: '',
    telegram: 'гуап.gosling',
    about: '',
    skills: ''
  };
  constructor(private router: Router, private profile: UserService) {  
      
  }
  triggerFileInput() {
    this.fileInput.nativeElement.click();
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
  onAvatarUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate image dimensions
      this.validateImageDimensions(file).then(isValid => {
        if (isValid) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.user.avatar = e.target?.result as string;
            // Update the displayed name if it's the default
            if (!this.user.name || this.user.name === 'Ваше имя') {
              this.user.name = this.user.firstName + ' ' + this.user.lastName;
            }
          };
          reader.readAsDataURL(file);
        } else {
          alert('Пожалуйста, загрузите изображение с разрешением до 5000x5000 пикселей');
        }
      });
    }
  }

  validateImageDimensions(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img.width <= 5000 && img.height <= 5000);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  onSave() {
    // Update the displayed name when saving
    this.user.name = [this.user.firstName, this.user.lastName].filter(Boolean).join(' ') || 'Ваше имя';
    console.log('Profile saved:', this.user);
    // Add your save logic here
  }

  onCancel() {
    console.log('Changes cancelled');
    // Add your cancel logic here
  }
}