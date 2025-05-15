import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../service/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-authorization',
  imports: [FormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  userName: string = ""
  userPassword: string = ""
  errorPassword: string = ""
  errorValid: string = ""
  error: string = ""

  userAvatar: any ="https://avatars.mds.yandex.net/i?id=93932abfd430c7aab32a3d45806ea6e6d4d0523a-4944707-images-thumbs&n=13";
  isSubmitting: boolean = false;
  showSuccessMessage: boolean = false;
  constructor(private authorization: LoginService, private route: Router) {}

  login(){
    debugger
    this.errorValid = "";
    this.errorPassword = "";
    this.error = "";

    if (
      !this.userName ||
      !this.userPassword
    ) {
      this.errorValid = "Пожалуйста, заполните все поля корректно";
      return;
    }
    if (this.userPassword.length < 6) {
      this.errorPassword = "Пароль должен быть не менее 6 символов";
      return;
    }

    this.authorization.onLogin({ username: this.userName, password: this.userPassword }).subscribe({
      next: (res: any) => {
        console.log(res);
        localStorage.setItem("token", res.token)
        this.route.navigateByUrl("/")
      },
      error: (e) => {
        this.error = e.error?.message || "Ошибка регистрации";
        console.error("HTTP error:", e);
      }
    })
  }

  register() {

  }
}