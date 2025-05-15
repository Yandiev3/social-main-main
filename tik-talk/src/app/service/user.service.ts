import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private profiles: any = [];
  apiUrl = "http://localhost:5000/auth";
  
  constructor(private http: HttpClient) {}

  async getProfiles() {
    try {
      const res = await fetch(`${this.apiUrl}/users`)
        .then((res) => res.json())
        .then((data) => (this.profiles = data));
    } catch {
      console.error();
    }
    return this.profiles;
  }
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
