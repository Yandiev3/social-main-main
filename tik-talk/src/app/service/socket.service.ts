import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });
  }

  connect(userId: string): void {
    this.socket.emit('user_online', userId);
  }

  joinChat(chatId: string): void {
    this.socket.emit('joinRoom', chatId);
  }

  joinUserRoom(userId: string): void {
    this.socket.emit('joinUserRoom', userId);
  }

  onNewMessage(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('newMessage', (data) => observer.next(data));
    });
  }

  onNewChat(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('newChat', (data) => observer.next(data));
    });
  }

  onChatUpdated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('chatUpdated', (data) => observer.next(data));
    });
  }

  onMessagesRead(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('messagesRead', (data) => observer.next(data));
    });
  }

  onUserStatus(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('user_status', (data) => observer.next(data));
    });
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}