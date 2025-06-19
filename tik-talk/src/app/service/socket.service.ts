import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;

  constructor() {
    this.socket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token') || ''
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
      this.socket.on('newMessage', (data: any) => observer.next(data));
    });
  }

  onNewChat(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('newChat', (data: any) => observer.next(data));
    });
  }

  onChatUpdated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('chatUpdated', (data: any) => observer.next(data));
    });
  }

  onMessagesRead(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('messagesRead', (data: any) => observer.next(data));
    });
  }

  onUserStatus(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('user_status', (data: any) => observer.next(data));
    });
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}