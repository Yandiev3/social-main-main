import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import axios from "axios";
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
    });
  }
  
  
  getProfile(){
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/profile`, { headers });
  }



  async editUser(user: any, token: string) {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-type' : 'application/json; charset=utf-8'
    };
      try {
        const res = await axios.patch(
          `${this.apiUrl}/setting/update/${user._id}`,
          user,
          { headers }
        );
        return res;
      } catch (error) {
        console.log(error);
        return error
      }
    }
}
