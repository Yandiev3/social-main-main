

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class RegistrationService {
  users: any = [];
  constructor(private http: HttpClient) {}
  apiUrl =  "http://localhost:5000/auth"
  
  registerUser(formData: FormData) {
    return this.http.post(`${this.apiUrl}/registration`, formData);
  }
}
