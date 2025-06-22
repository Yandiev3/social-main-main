import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

// Интерфейс Message, соответствующий данным с сервера
interface Message {
  id: string;
  sender: { _id: string; name: string; username: string };
  recipient: { _id: string; name: string; username: string };
  content: string;
  timestamp: string;
}

// Интерфейс для сообщений WebSocket (сырые данные с сервера)
interface WebSocketMessage {
  error?: string;
  id?: string;
  sender?: { _id: string; name: string; username: string };
  recipient?: { _id: string; name: string; username: string };
  content?: string;
  timestamp?: string;
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
      console.error('Токен отсутствует. Невозможно установить соединение WebSocket.');
      this.messagesSubject.next({
        id: 'error-' + Date.now(),
        sender: { _id: 'system', name: 'System', username: 'system' },
        recipient: { _id: 'current', name: 'You', username: 'you' },
        content: 'Ошибка: токен авторизации отсутствует.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    this.ws = new WebSocket(`ws://localhost:5000?token=${this.token}`);

    this.ws.onopen = () => {
      console.log('WebSocket соединение установлено');
    };

    this.ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        if (data.error) {
          console.error('Ошибка от сервера:', data.error);
          let errorContent = `Ошибка сервера: ${data.error}`;
          if (data.error === 'Recipient not found') {
            errorContent = 'Получатель не найден. Проверьте ID пользователя.';
          } else if (data.error === 'Missing recipientId or content') {
            errorContent = 'Ошибка: отсутствует ID получателя или текст сообщения.';
          }
          this.messagesSubject.next({
            id: 'error-' + Date.now(),
            sender: { _id: 'system', name: 'System', username: 'system' },
            recipient: { _id: 'current', name: 'You', username: 'you' },
            content: errorContent,
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // Проверяем и преобразуем данные WebSocket в формат Message
        const message: Message = {
          id: data.id!,
          sender: data.sender!,
          recipient: data.recipient!,
          content: data.content!,
          timestamp: data.timestamp!,
        };

        if (
          message.id &&
          message.sender?._id &&
          message.recipient?._id &&
          message.content &&
          message.timestamp
        ) {
          this.messagesSubject.next(message);
        } else {
          console.warn('Некорректная структура сообщения:', data);
        }
      } catch (error) {
        console.error('Ошибка парсинга сообщения WebSocket:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket соединение закрыто');
      this.ws = null;
    };

    this.ws.onerror = (error) => {
      console.error('Ошибка WebSocket:', error);
      this.messagesSubject.next({
        id: 'error-' + Date.now(),
        sender: { _id: 'system', name: 'System', username: 'system' },
        recipient: { _id: 'current', name: 'You', username: 'you' },
        content: 'Ошибка: соединение с сервером потеряно.',
        timestamp: new Date().toISOString(),
      });
    };
  }

  sendMessage(recipientId: string, content: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = { recipientId, content };
      console.log('Отправка сообщения:', message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket не подключен');
      this.messagesSubject.next({
        id: 'error-' + Date.now(),
        sender: { _id: 'system', name: 'System', username: 'system' },
        recipient: { _id: 'current', name: 'You', username: 'you' },
        content: 'Ошибка: нет соединения с сервером. Проверьте подключение.',
        timestamp: new Date().toISOString(),
      });
    }
  }

  getMessages(): Observable<Message> {
    return this.messagesSubject.asObservable();
  }

  getChatHistory(recipientId: string): Observable<Message[]> {
    if (!this.token) {
      console.error('Токен отсутствует. Невозможно загрузить историю чата.');
      return new Observable<Message[]>((observer) => {
        observer.error('Токен отсутствует');
      });
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    // Преобразуем данные с сервера в формат Message
    return this.http.get<any[]>(`${this.apiUrl}/chat/history/${recipientId}`, { headers }).pipe(
      map((messages) =>
        messages.map((msg) => ({
          id: msg._id,
          sender: msg.senderId,
          recipient: msg.recipientId,
          content: msg.content,
          timestamp: msg.createdAt,
        }))
      )
    );
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      console.log('WebSocket соединение закрыто принудительно');
      this.ws = null;
    }
  }
}