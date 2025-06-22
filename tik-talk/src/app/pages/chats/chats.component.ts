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
      this.currentUser = await this.getCurrentUser();
      this.chatService.connect();
      const profiles = await this.userService.getProfiles();
      this.users = profiles.map((profile: Profile) => ({
        id: profile._id,
        name: profile.name,
        avatar: profile.avatar
      }));
      
      this.chatService.getMessages().subscribe((message) => {
        if (
          (message.sender._id === this.selectedChat?.userId && message.recipient._id === this.currentUser.id) ||
          (message.sender._id === this.currentUser.id && message.recipient._id === this.selectedChat?.userId)
        ) {
          this.messages.push({
            ...message,
            timestamp: this.formatDate(message.timestamp)
          });
        }
        this.updateChatList(message);
      });
      
      await this.loadChats();

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
                timestamp: this.formatDate(new Date())
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

  private formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        if (history && history.length > 0) {
          const lastMessage = history[history.length - 1];
          this.chats.push({
            id: user.id,
            userId: user.id,
            lastMessage: lastMessage.content,
            timestamp: this.formatDate(lastMessage.timestamp)
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
    try {
      const messages = await this.chatService.getChatHistory(recipientId).toPromise();
      if (messages) {
        this.messages = messages.map(msg => ({
          ...msg,
          timestamp: this.formatDate(msg.timestamp)
        }));
      } else {
        this.messages = [];
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
      this.messages = [];
    }
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
      existingChat.timestamp = this.formatDate(message.timestamp);
    } else {
      this.chats.push({
        id: userId,
        userId,
        lastMessage: message.content,
        timestamp: this.formatDate(message.timestamp)
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