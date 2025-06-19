import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ChatService } from '../../service/chat.service';
import { UserService } from '../../service/user.service';
import { SocketService } from '../../service/socket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Message, Chat, UserStatus } from '../../models/chat.interfaces';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ChatsComponent implements OnInit, OnDestroy, AfterViewInit {
  chats: Chat[] = [];
  selectedChat: Chat | null = null;
  messages: Message[] = [];
  newMessage = '';
  searchQuery = '';
  currentUserId: string = '';
  loading = true;
  errorMessage: string | null = null;
  userStatuses: { [key: string]: { isOnline: boolean; lastSeen: Date | null } } = {};
  private subscriptions: Subscription = new Subscription();
  
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Получаем ID текущего пользователя из localStorage
    this.currentUserId = localStorage.getItem('userId') || '';
    if (!this.currentUserId) {
      this.errorMessage = 'Необходимо авторизоваться';
      this.router.navigate(['/login']);
      return;
    }

    // Загружаем чаты и настраиваем сокет-соединение
    this.loadChats();
    this.setupSocketListeners();
    this.socketService.connect(this.currentUserId);

    // Подписываемся на ошибки авторизации от SocketService
    this.subscriptions.add(
      this.socketService.onAuthError().subscribe((error) => {
        this.errorMessage = error;
        if (error.includes('redirect to login')) {
          this.router.navigate(['/login']);
        }
      })
    );
  }

  ngAfterViewInit(): void {
    // Прокручиваем чат вниз после загрузки сообщений
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    // Отключаемся от текущего чата и сокета при уничтожении компонента
    if (this.selectedChat) {
      this.socketService.leaveChat(this.selectedChat._id);
    }
    this.socketService.disconnect();
    this.subscriptions.unsubscribe();
  }

  // Настройка слушателей событий WebSocket
  private setupSocketListeners(): void {
    // Обработка нового сообщения
    this.subscriptions.add(
      this.socketService.onNewMessage().subscribe((message: Message) => {
        if (this.selectedChat && message.chatId === this.selectedChat._id) {
          this.messages = [...this.messages, message];
          this.scrollToBottom();
          if (message.recipientId === this.currentUserId && !message.isRead) {
            this.markMessagesRead([message._id]);
          }
        }
        this.updateChatList(message);
      })
    );

    // Обработка обновления чата
    this.subscriptions.add(
      this.socketService.onChatUpdated().subscribe((updatedChat: Chat) => {
        this.chats = this.chats
          .map(chat => chat._id === updatedChat._id ? updatedChat : chat)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      })
    );

    // Обработка создания нового чата
    this.subscriptions.add(
      this.socketService.onNewChat().subscribe((newChat: Chat) => {
        this.chats = [newChat, ...this.chats].sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      })
    );

    // Обработка прочтения сообщений
    this.subscriptions.add(
      this.socketService.onMessagesRead().subscribe(({ chatId, messageIds }) => {
        if (this.selectedChat && this.selectedChat._id === chatId) {
          this.messages = this.messages.map(msg =>
            messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
          );
        }
      })
    );

    // Обработка статуса пользователя
    this.subscriptions.add(
      this.socketService.onUserStatus().subscribe((status: UserStatus) => {
        this.userStatuses[status.userId] = {
          isOnline: status.isOnline,
          lastSeen: status.lastSeen ? new Date(status.lastSeen) : null
        };
      })
    );
  }

  // Загрузка списка чатов
  loadChats(): void {
    this.loading = true;
    this.errorMessage = null;
    this.chatService.getChats().subscribe({
      next: (chats: Chat[]) => {
        this.chats = chats.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        this.loading = false;
        // Проверяем статус каждого пользователя в чатах
        this.chats.forEach(chat => {
          const otherUserId = chat.user_send._id === this.currentUserId 
            ? chat.user_get._id 
            : chat.user_send._id;
          this.socketService.checkUserStatus(otherUserId);
        });
      },
      error: (err) => {
        console.error('Ошибка загрузки чатов:', err);
        this.errorMessage = 'Не удалось загрузить чаты. Попробуйте позже.';
        this.loading = false;
      }
    });
  }

  // Выбор чата
  selectChat(chat: Chat): void {
    if (this.selectedChat) {
      this.socketService.leaveChat(this.selectedChat._id);
    }
    this.selectedChat = chat;
    this.messages = [];
    this.socketService.joinChat(chat._id);
    this.loadMessages();
  }

  // Загрузка сообщений для выбранного чата
  private loadMessages(): void {
    if (!this.selectedChat) return;
    
    this.chatService.getChatById(this.selectedChat._id).subscribe({
      next: (data: { chatInfo: Chat; chatMessages: Message[] }) => {
        this.messages = data.chatMessages;
        this.scrollToBottom();
        const unreadIds = this.messages
          .filter(m => !m.isRead && m.recipientId === this.currentUserId)
          .map(m => m._id);

        if (unreadIds.length > 0) {
          this.markMessagesRead(unreadIds);
        }
      },
      error: (err) => {
        console.error('Ошибка загрузки сообщений:', err);
        this.errorMessage = 'Не удалось загрузить сообщения. Попробуйте позже.';
      }
    });
  }

  // Пометка сообщений как прочитанных
  private markMessagesRead(messageIds: string[]): void {
    if (!this.selectedChat) return;
    
    this.chatService.markMessagesAsRead(this.selectedChat._id, messageIds).subscribe({
      next: () => {
        this.chats = this.chats.map(chat => {
          if (chat._id === this.selectedChat?._id) {
            return { ...chat, unreadCount: 0 };
          }
          return chat;
        });
        this.socketService.emitMessagesRead(this.selectedChat!._id, messageIds);
      },
      error: (err) => console.error('Ошибка при пометке сообщений как прочитанных:', err)
    });
  }

  // Отправка нового сообщения
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
      next: (message: Message) => {
        this.messages = [...this.messages, message];
        this.scrollToBottom();
        this.socketService.sendMessage(
          this.selectedChat!._id,
          this.currentUserId,
          recipientId,
          this.newMessage
        );
        this.newMessage = '';
      },
      error: (err) => {
        console.error('Ошибка отправки сообщения:', err);
        this.errorMessage = 'Не удалось отправить сообщение. Попробуйте позже.';
      }
    });
  }

  // Обновление списка чатов при получении нового сообщения
  private updateChatList(message: Message): void {
    const chat = this.chats.find(c => c._id === message.chatId);
    if (chat) {
      chat.lastMessage = {
        content: message.content,
        senderId: message.senderId,
        isRead: message.isRead,
        sentAt: message.createdAt
      };
      chat.updatedAt = message.createdAt;
      if (!message.isRead && message.recipientId === this.currentUserId) {
        chat.unreadCount = (chat.unreadCount || 0) + 1;
      }
      this.chats = [...this.chats].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }
  }

  // Получение заголовка чата (имя и фамилия собеседника)
  getChatTitle(chat: Chat): string {
    const user = chat.user_send._id === this.currentUserId ? chat.user_get : chat.user_send;
    return `${user.name} ${user.lastname}`;
  }

  // Получение аватара чата
  getChatAvatar(chat: Chat): string {
    const user = chat.user_send._id === this.currentUserId ? chat.user_get : chat.user_send;
    return user.avatar || 'assets/default-avatar.png';
  }

  // Форматирование даты сообщения
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleString([], { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Проверка, является ли сообщение отправленным текущим пользователем
  isMyMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  // Получение статуса пользователя
  getUserStatus(userId: string): { isOnline: boolean; lastSeen: Date | null } {
    return this.userStatuses[userId] || { isOnline: false, lastSeen: null };
  }

  // Поиск чатов по запросу
  searchChats(): void {
    if (!this.searchQuery.trim()) {
      this.loadChats();
      return;
    }
    this.chats = this.chats.filter(chat => 
      this.getChatTitle(chat).toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Прокрутка чата вниз
  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 0);
  }
}