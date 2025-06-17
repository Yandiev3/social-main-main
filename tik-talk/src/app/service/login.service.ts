import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  apiUrl =  "http://localhost:5000/auth"

  constructor(private http: HttpClient) { }
  
  onLogin(obj: any){
   return this.http.post(`${this.apiUrl}/login` , obj)
  }

  getProfile(){
    return this.http.get(`${this.apiUrl}/profile`);
  }
}
