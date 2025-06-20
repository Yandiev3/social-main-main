import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../service/chat.service';
import { UserService } from '../../service/user.service';
import { ActivatedRoute } from '@angular/router';

interface Message {
  id: string;
  sender: { _id: string; name: string; username: string };
  recipient: { _id: string; name: string; username: string };
  content: string;
  timestamp: string;
}

interface Chat {
  id: string;
  userId: string;
  lastMessage: string;
  timestamp: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Profile {
  _id: string;
  name: string;
  username: string;
  avatar: string;
  about: string;
  stack: string[];
  subscribers: string[];
}

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [FormsModule, NgIf, NgClass, NgFor],
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent implements OnInit, OnDestroy {
  currentUser: User = { id: '', name: '', avatar: '' };
  users: User[] = [];
  chats: Chat[] = [];
  messages: Message[] = [];
  selectedChat: Chat | null = null;
  searchQuery: string = '';
  newMessage: string = '';

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      // Получаем текущего пользователя
      this.currentUser = await this.getCurrentUser();
      // Подключаемся к WebSocket
      this.chatService.connect();
      // Получаем список пользователей и преобразуем Profile[] в User[]
      const profiles = await this.userService.getProfiles();
      this.users = profiles.map((profile: Profile) => ({
        id: profile._id,
        name: profile.name,
        avatar: profile.avatar
      }));
      // Подписываемся на новые сообщения
      this.chatService.getMessages().subscribe((message) => {
        if (
          (message.sender._id === this.selectedChat?.userId && message.recipient._id === this.currentUser.id) ||
          (message.sender._id === this.currentUser.id && message.recipient._id === this.selectedChat?.userId)
        ) {
          this.messages.push(message);
        }
        this.updateChatList(message);
      });
      // Загружаем чаты
      await this.loadChats();

      // Проверяем параметр userId из маршрута
      this.route.queryParams.subscribe((params) => {
        const userId = params['userId'];
        if (userId) {
          const chat = this.chats.find((c) => c.userId === userId);
          if (chat) {
            this.selectChat(chat);
          } else {
            const user = this.users.find((u) => u.id === userId);
            if (user) {
              const newChat: Chat = {
                id: userId,
                userId,
                lastMessage: '',
                timestamp: new Date().toLocaleDateString('ru-RU')
              };
              this.chats.push(newChat);
              this.selectChat(newChat);
            }
          }
        }
      });
    } catch (error) {
      console.error('Ошибка инициализации:', error);
    }
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
  }

  async getCurrentUser(): Promise<User> {
    const profile = await this.userService.getProfile().toPromise();
    if (!profile) {
      throw new Error('Не удалось получить профиль пользователя');
    }
    return {
      id: profile._id,
      name: profile.name,
      avatar: profile.avatar
    };
  }

  async loadChats(): Promise<void> {
    for (const user of this.users) {
      if (user.id !== this.currentUser.id) {
        const history = await this.chatService.getChatHistory(user.id).toPromise();
        if (history && history.length > 1) {
          const lastMessage = history[history.length - 1];
          this.chats.push({
            id: user.id,
            userId: user.id,
            lastMessage: lastMessage.content,
            timestamp: new Date(lastMessage.timestamp).toLocaleDateString('ru-RU')
          });
        }
      }
    }
  }

  selectChat(chat: Chat): void {
    this.selectedChat = chat;
    this.loadMessages(chat.userId);
  }

async loadMessages(recipientId: string): Promise<void> {
  const messages = await this.chatService.getChatHistory(recipientId).toPromise();
  this.messages = messages || [];
}

  sendMessage(): void {
    if (this.newMessage.trim() && this.selectedChat) {
      this.chatService.sendMessage(this.selectedChat.userId, this.newMessage);
      this.newMessage = '';
    }
  }

  updateChatList(message: Message): void {
    const userId = message.sender._id === this.currentUser.id ? message.recipient._id : message.sender._id;
    const existingChat = this.chats.find((chat) => chat.userId === userId);
    if (existingChat) {
      existingChat.lastMessage = message.content;
      existingChat.timestamp = new Date(message.timestamp).toLocaleDateString('ru-RU');
    } else {
      this.chats.push({
        id: userId,
        userId,
        lastMessage: message.content,
        timestamp: new Date(message.timestamp).toLocaleDateString('ru-RU')
      });
    }
    this.chats = [...this.chats];
  }

  get filteredChats(): Chat[] {
    if (!this.searchQuery) return this.chats;
    return this.chats.filter((chat) => {
      const user = this.users.find((u) => u.id === chat.userId);
      return user?.name.toLowerCase().includes(this.searchQuery.toLowerCase());
    });
  }

  getUserById(userId: string): User | undefined {
    return this.users.find((user) => user.id === userId);
  }
}