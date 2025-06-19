import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/chat';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`, 
    });
  }

  getChatBetweenUsers(user1Id: string, user2Id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/between/${user1Id}/${user2Id}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  getChats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chats`, { headers: this.getAuthHeaders() });
  }

  getChatById(chatId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/chats/${chatId}`, { headers: this.getAuthHeaders() });
  }

  createOrGetChat(userSend: string, userGet: string): Observable<any> {
    return new Observable(observer => {
      this.getChatBetweenUsers(userSend, userGet).subscribe({
        next: (existingChat) => {
          if (existingChat) {
            observer.next(existingChat);
            observer.complete();
          } else {
            this.http.post(`${this.apiUrl}/chats`, { 
              user_send: userSend, 
              user_get: userGet 
            }, { 
              headers: this.getAuthHeaders() 
            }).subscribe({
              next: (newChat) => {
                observer.next(newChat);
                observer.complete();
              },
              error: (err) => observer.error(err)
            });
          }
        },
        error: (err) => observer.error(err)
      });
    });
  }
  sendMessage(chatId: string, senderId: string, recipientId: string, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages`, {
      chatId,
      senderId,
      recipientId,
      content
    }, { headers: this.getAuthHeaders() });
  }

  markMessagesAsRead(chatId: string, messageIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages/read`, {
      chatId,
      messageIds
    }, { headers: this.getAuthHeaders() });
  }
}