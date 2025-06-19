import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Message, Chat, UserStatus } from '../models/chat.interfaces';
import { HttpClient } from '@angular/common/http'; // For token refresh

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private authErrorSubject = new Subject<string>(); // Notify components of auth errors
  private readonly apiUrl = 'http://localhost:5000'; // Backend URL

  constructor(private http: HttpClient) {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    const token = localStorage.getItem('token') || '';
    this.socket = io(this.apiUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Handle connection errors
    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      if (err.message === 'Unauthorized' || err.message.includes('invalid token')) {
        this.handleAuthError();
      }
    });

    // Handle successful connection
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    // Handle disconnection
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server closed connection (e.g., due to auth failure)
        this.handleAuthError();
      }
    });
  }

  private handleAuthError(): void {
    this.authErrorSubject.next('Authentication failed');
    this.attemptTokenRefresh().subscribe({
      next: (newToken) => {
        localStorage.setItem('token', newToken);
        this.socket.auth = { token: newToken };
        this.socket.connect(); // Reconnect with new token
      },
      error: () => {
        this.authErrorSubject.next('Token refresh failed, redirect to login');
        this.disconnect();
      }
    });
  }

  private attemptTokenRefresh(): Observable<string> {
    return new Observable((observer) => {
      // Example: Call a refresh token endpoint
      this.http.post<{ token: string }>(`${this.apiUrl}/api/refresh-token`, {})
        .subscribe({
          next: (response) => observer.next(response.token),
          error: (err) => observer.error(err)
        });
    });
  }

  // Notify components of auth errors
  onAuthError(): Observable<string> {
    return this.authErrorSubject.asObservable();
  }

  connect(userId: string): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
    this.socket.emit('user_online', userId);
  }

  joinChat(chatId: string): void {
    this.socket.emit('joinRoom', chatId);
  }

  leaveChat(chatId: string): void {
    this.socket.emit('leaveRoom', chatId);
  }

  sendMessage(chatId: string, senderId: string, recipientId: string, content: string): void {
    this.socket.emit('sendMessage', { chatId, senderId, recipientId, content });
  }

  checkUserStatus(userId: string): void {
    this.socket.emit('check_user_status', userId);
  }

  onNewMessage(): Observable<Message> {
    return new Observable(observer => {
      this.socket.on('newMessage', (data: Message) => observer.next(data));
    });
  }

  onNewChat(): Observable<Chat> {
    return new Observable(observer => {
      this.socket.on('newChat', (data: Chat) => observer.next(data));
    });
  }

  onChatUpdated(): Observable<Chat> {
    return new Observable(observer => {
      this.socket.on('chatUpdated', (data: Chat) => observer.next(data));
    });
  }

  onMessagesRead(): Observable<{ chatId: string; messageIds: string[] }> {
    return new Observable(observer => {
      this.socket.on('messagesRead', (data: { chatId: string; messageIds: string[] }) => observer.next(data));
    });
  }

  onUserStatus(): Observable<UserStatus> {
    return new Observable(observer => {
      this.socket.on('user_status', (data: UserStatus) => observer.next(data));
    });
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}