import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

interface Message {
  id: string;
  sender: { _id: string; name: string; username: string };
  recipient: { _id: string; name: string; username: string };
  content: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private ws: WebSocket | null = null;
  private messagesSubject = new Subject<Message>();
  private apiUrl = 'http://localhost:5000';
  private token = localStorage.getItem('token');

  constructor(private http: HttpClient) {}

  connect(): void {
    if (!this.token) {
      console.error('Токен отсутствует');
      return;
    }

    this.ws = new WebSocket(`ws://localhost:5000?token=${this.token}`);

    this.ws.onopen = () => {
      console.log('WebSocket соединение установлено');
    };

    this.ws.onmessage = (event) => {
      try {
        const message: Message = JSON.parse(event.data);
        this.messagesSubject.next(message);
      } catch (error) {
        console.error('Ошибка парсинга сообщения WebSocket:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket соединение закрыто');
    };

    this.ws.onerror = (error) => {
      console.error('Ошибка WebSocket:', error);
    };
  }

  sendMessage(recipientId: string, content: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = { recipientId, content };
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket не подключен');
    }
  }

  getMessages(): Observable<Message> {
    return this.messagesSubject.asObservable();
  }

  getChatHistory(recipientId: string): Observable<Message[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.get<Message[]>(`${this.apiUrl}/chat/history/${recipientId}`, { headers });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}