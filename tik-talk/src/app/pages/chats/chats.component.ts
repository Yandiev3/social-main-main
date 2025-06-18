import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../service/chat.service';
import { UserService } from '../../service/user.service';
import { SocketService } from '../../service/socket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ChatsComponent implements OnInit, OnDestroy {
  chats: any[] = [];
  selectedChat: any = null;
  messages: any[] = [];
  newMessage = '';
  searchQuery = '';
  currentUserId: string = '';
  loading = true;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserId = localStorage.getItem('userId') || '';
    this.loadChats();
    this.setupSocketListeners();
    this.socketService.connect(this.currentUserId);

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['selectedChat']) {
      this.selectedChat = navigation.extras.state['selectedChat'];
      this.loadChatMessages(this.selectedChat._id);
    }
  }

  private loadChatMessages(chatId: string): void {
    this.chatService.getChatById(chatId).subscribe({
      next: (data: any) => {
        this.messages = data.chatMessages;
        const unreadIds = this.messages
          .filter(m => !m.isRead && m.recipientId === this.currentUserId)
          .map(m => m._id);
        
        if (unreadIds.length > 0) {
          this.chatService.markMessagesAsRead(chatId, unreadIds).subscribe();
        }
      },
      error: (err) => console.error('Error loading chat:', err)
    });
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  private setupSocketListeners(): void {
    this.socketService.onNewMessage().subscribe((message: any) => {
      if (this.selectedChat && message.chatId === this.selectedChat._id) {
        this.messages.push(message);
      }
    });

    this.socketService.onChatUpdated().subscribe((updatedChat: any) => {
      this.chats = this.chats.map(chat => 
        chat._id === updatedChat._id ? updatedChat : chat
      ).sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });

    this.socketService.onNewChat().subscribe((newChat: any) => {
      this.chats.unshift(newChat);
    });
  }

  loadChats(): void {
    this.chatService.getChats().subscribe({
      next: (chats) => {
        this.chats = chats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading chats:', err);
        this.loading = false;
      }
    });
  }

  selectChat(chat: any): void {
    this.selectedChat = chat;
    this.socketService.joinChat(chat._id);
    
    this.chatService.getChatById(chat._id).subscribe({
      next: (data: any) => {
        this.messages = data.chatMessages;
        // Mark messages as read
        const unreadIds = this.messages
          .filter(m => !m.isRead && m.recipientId === this.currentUserId)
          .map(m => m._id);
        
        if (unreadIds.length > 0) {
          this.chatService.markMessagesAsRead(chat._id, unreadIds).subscribe();
        }
      },
      error: (err) => console.error('Error loading chat:', err)
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedChat) return;

    const recipientId = this.selectedChat.user_send._id === this.currentUserId 
      ? this.selectedChat.user_get._id 
      : this.selectedChat.user_send._id;

    this.chatService.sendMessage(
      this.selectedChat._id,
      this.currentUserId,
      recipientId,
      this.newMessage
    ).subscribe({
      next: (message) => {
        this.newMessage = '';
      },
      error: (err) => console.error('Error sending message:', err)
    });
  }

  getChatTitle(chat: any): string {
    if (chat.user_send._id === this.currentUserId) {
      return `${chat.user_get.name} ${chat.user_get.lastname}`;
    }
    return `${chat.user_send.name} ${chat.user_send.lastname}`;
  }

  getChatAvatar(chat: any): string {
    if (chat.user_send._id === this.currentUserId) {
      return chat.user_get.avatar;
    }
    return chat.user_send.avatar;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  isMyMessage(message: any): boolean {
    return message.senderId === this.currentUserId;
  }
}