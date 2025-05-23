// import { Component } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { LoginService } from '../../service/login.service';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-authorization',
//   imports: [FormsModule],
//   templateUrl: './login-page.component.html',
//   styleUrl: './login-page.component.scss'
// })
// export class LoginPageComponent {
//   userName: string = ""
//   userPassword: string = ""
//   errorPassword: string = ""
//   errorValid: string = ""
//   error: string = ""

//   userAvatar: any ="https://avatars.mds.yandex.net/i?id=93932abfd430c7aab32a3d45806ea6e6d4d0523a-4944707-images-thumbs&n=13";
//   isSubmitting: boolean = false;
//   showSuccessMessage: boolean = false;
//   constructor(private authorization: LoginService, private route: Router) {}

//   login(){
//     debugger
//     this.errorValid = "";
//     this.errorPassword = "";
//     this.error = "";

//     if (
//       !this.userName ||
//       !this.userPassword
//     ) {
//       this.errorValid = "Пожалуйста, заполните все поля корректно";
//       return;
//     }
//     if (this.userPassword.length < 6) {
//       this.errorPassword = "Пароль должен быть не менее 6 символов";
//       return;
//     }

//     this.authorization.onLogin({ username: this.userName, password: this.userPassword }).subscribe({
//       next: (res: any) => {
//         console.log(res);
//         localStorage.setItem("token", res.token)
//         this.route.navigateByUrl("/")
//       },
//       error: (e) => {
//         this.error = e.error?.message || "Ошибка регистрации";
//         console.error("HTTP error:", e);
//       }
//     })
//   }

//   register() {

//   }
  
// }


import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../service/login.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RegistrationService } from '../../service/registration.service';
import { Token } from '@angular/compiler';

@Component({
  selector: 'app-authorization',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  userName: string = "";
  userPassword: string = "";
  errorPassword: string = "";
  errorValid: string = "";
  error: string = "";

  registerLogin: string = "";
  registerPassword: string = "";
  registerError: string = "";
  confirmPassword: string = "";
  showSuccessMessage: boolean = false;
  
  isRegisterForm: boolean = false;
  userAvatar: any ="https://avatars.mds.yandex.net/i?id=93932abfd430c7aab32a3d45806ea6e6d4d0523a-4944707-images-thumbs&n=13";
  constructor(private authorization: LoginService, private route: Router, private registrationService: RegistrationService) {}

  toggleForm(showRegister: boolean): void {
    this.isRegisterForm = showRegister;
    this.clearErrors();
  }

  clearErrors(){
    this.error = "";
    this.errorValid = "";
    this.errorPassword = "";
    this.registerError = "";
  }

  login(){
    this.clearErrors();

    if (!this.userName || !this.userPassword) {
      this.errorValid = "Пожалуйста, заполните все поля";
      return;
    }

    if (this.userPassword.length < 6) {
      this.errorPassword = "Пароль должен быть не менее 6 символов";
      return;
    }

    this.authorization.onLogin({ 
      username: this.userName, 
      password: this.userPassword 
    }).subscribe({
      next: (res: any) => {
        console.log('До сохранения токена', res.token)
        localStorage.setItem("token", res.token);
        console.log(res.token);
        this.route.navigateByUrl("/");
        
      },
      error: (e) => {
        this.error = e.error?.message || "Ошибка входа";
        console.error("HTTP error:", e);
      }
    });
  }

  register(){
    this.clearErrors();

    const formData = new FormData();
    formData.append("username", this.registerLogin);
    formData.append("password", this.registerPassword);

    // if (this.userAvatar instanceof File) {
    //   formData.append("avatar", this.userAvatar);
    // } else {
    //   formData.append("avatar", this.userAvatar || "");
    // }
    this.registrationService.registerUser(formData).subscribe({
        next: (res: any) => {
          if (res === "Регистрация прошла успешно") {
            this.showSuccessMessage = true;
          } else {
            this.error = "Не удалось зарегистрировать пользователя";
          }
          this.isRegisterForm = false;
        },
        error: (e) => {
          this.error = e.error?.message || "Ошибка регистрации";
          console.error("HTTP error:", e);
          this.isRegisterForm = false;
        },
      });
        console.log('Отправляемые данные регистрации:', this.registerLogin, this.registerPassword);
      
      
        if (!this.registerLogin || !this.registerPassword || !this.confirmPassword) {
      this.registerError = "Пожалуйста, заполните все поля";
      return;
    }

    if (this.registerPassword.length < 6) {
      this.registerError = "Пароль должен быть не менее 6 символов";
      return;
    }

    if (this.registerPassword !== this.confirmPassword) {
      this.registerError = "Пароли не совпадают";
      return;
    }
    // this.authorization.onLogin({ 
    //   username: this.userName, 
    //   password: this.userPassword 
    // }).subscribe({
    //   next: (res: any) => {
    //     localStorage.setItem("token", res.token);
    //     this.route.navigateByUrl("/");
    //   },
    //   error: (e) => {
    //     this.error = e.error?.message || "Ошибка входа";
    //     console.error("HTTP error:", e);
    //   }
    // })
  }
  }