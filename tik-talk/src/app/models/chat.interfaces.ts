// src/app/models/chat.interfaces.ts
export interface Message {
    _id: string;
    chatId: string;
    senderId: string;
    recipientId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
  }
  
  export interface Chat {
    _id: string;
    user_send: { _id: string; name: string; lastname: string; avatar: string };
    user_get: { _id: string; name: string; lastname: string; avatar: string };
    lastMessage?: { content: string; senderId: string; isRead: boolean; sentAt: string };
    updatedAt: string;
    unreadCount?: number;
  }
  
  export interface UserStatus {
    userId: string;
    isOnline: boolean;
    lastSeen: string | null;
  }