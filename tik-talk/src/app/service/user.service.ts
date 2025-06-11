import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import axios from "axios";
import { Observable } from "rxjs";
import { ActivatedRoute } from "@angular/router";
@Injectable({
  providedIn: "root",
})
export class UserService {
  private profiles: any = [];
  apiUrl = "http://localhost:5000/auth";
  
  constructor(private http: HttpClient, private route: ActivatedRoute,) {}

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
  
  
  getProfile(profileId: any = null){
    const headers = this.getAuthHeaders();
    // const profileId = this.route.snapshot.paramMap.get('id');
    console.log("profileId2", profileId);
    
    return this.http.get(`http://localhost:5000/auth/profile/${profileId}`, { headers });
    
  //   if (this.profiles.id) {
  //     return this.http.get(`http://localhost:5000/auth/profile/${profileId}`, { headers });
  // } else {
  //     return this.http.get(`${this.apiUrl}/profile/:id`, { headers });
  // }
  }



  async editUser(user: any, token: string) {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
      try {
        const res = await axios.patch(
          `${this.apiUrl}/setting/update/${user._id}`,
          user,
          { headers }
        );
        return res.data;
      } catch (error) {
        console.log(error);
        return error
      }
    }

    async uploadAvatar(file: File, userId: string){
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Отсутствует токен авторизации');
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    };

    try {
    const response = await axios.patch(
      `${this.apiUrl}/setting/update/${userId}`, 
      formData, 
      { headers }
    );
    return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении', error);
      throw error;
    }
  }
}
