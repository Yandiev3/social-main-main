import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import axios from 'axios';

interface Profile {
  _id: string;
  name: string;
  username: string;
  avatar: string;
  about: string;
  stack: string[];
  subscribers: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5000/auth';

  constructor(private http: HttpClient) {}

  async getProfiles(): Promise<Profile[]> {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${this.apiUrl}/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка получения профилей:', error);
      return [];
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getProfile(profileId?: string): Observable<Profile> {
    const headers = this.getAuthHeaders();
    let userId = profileId;
    
    // Если profileId не передан, извлекаем ID из токена
    if (!userId) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          userId = decodedToken.id; // Предполагается, что токен содержит поле 'id'
        } catch (error) {
          console.error('Ошибка декодирования токена:', error);
        }
      }
    }

    if (!userId) {
      throw new Error('ID пользователя не найден');
    }

    const url = `${this.apiUrl}/profile/${userId}`;
    return this.http.get<Profile>(url, { headers });
  }

  async editUser(user: any, token: string): Promise<any> {
    const headers = {
      Authorization: `Bearer ${token}`
    };
    try {
      const res = await axios.patch(
        `${this.apiUrl}/setting/update/${user._id}`,
        user,
        { headers }
      );
      return res.data;
    } catch (error) {
      console.error('Ошибка при обновлении пользователя:', error);
      throw error;
    }
  }

  async uploadAvatar(file: File, userId: string): Promise<any> {
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
      console.error('Ошибка при обновлении аватара:', error);
      throw error;
    }
  }

  async subscribe(profileId: string, token: string): Promise<any> {
    const headers = {
      Authorization: `Bearer ${token}`
    };
    try {
      const response = await axios.post(
        `${this.apiUrl}/subscribe/${profileId}`,
        {},
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Ошибка при подписке:', error);
      throw error;
    }
  }

  async unsubscribe(profileId: string, token: string): Promise<any> {
    const headers = {
      Authorization: `Bearer ${token}`
    };
    try {
      const response = await axios.delete(
        `${this.apiUrl}/subscribe/${profileId}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Ошибка при отписке:', error);
      throw error;
    }
  }

  async checkSubscription(profileId: string): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Требуется авторизация!');
    }
    const headers = {
      Authorization: `Bearer ${token}`
    };
    try {
      const response = await axios.get(`${this.apiUrl}/subscribe/check/${profileId}`, { headers });
      return response.data.isSubscribed;
    } catch (error) {
      console.error('Ошибка при проверке подписки:', error);
      return false;
    }
  }
}