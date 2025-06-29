import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private readonly http = 'http://localhost:5000';

  private getAuthConfig() {
    return {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    };
  }

  async fetchPosts(profileId: any) {
    try {
      const response = await axios.get(
        `${this.http}/post/user/${profileId}`, 
        this.getAuthConfig()
      );
      return response.data.posts?.map((post: any) => ({
        ...post,
        showComments: false,
        newComment: '',
        isLiked: false,
        likeCount: post.likes?.length || 0,
        commentsCount: post.comments?.length || 0
      })) || [];
    } catch (error) {
      console.error('Ошибка при получении постов', error);
      return [];
    }
  }

  async createPost(content: string) {
    try {
      const response = await axios.post(
        `${this.http}/post/create`,
        { content },
        this.getAuthConfig()
      );
      return {
        ...response.data,
        showComments: false,
        newComment: '',
        isLiked: false,
        comments: [],
        likesCount: 0
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(postId: string, content: string){
  const headers = this.getAuthConfig();
  return axios.put(`${this.http}/post/${postId}`, { content }, headers);
}

  async deletePost(postId: string){
  const headers = this.getAuthConfig();
  return axios.delete(`${this.http}/post/${postId}`, headers);
  }

  async likePost(postId: string) {
    try {
      const response = await axios.post(
        `${this.http}/post/${postId}/like`,
        {},
        this.getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error при лайке:', error);
      throw error;
    }
  }

  async unlikePost(postId: string) {
    try {
      const response = await axios.delete(
        `${this.http}/post/${postId}/like`,
        this.getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error при отмене лайка:', error);
      throw error;
    }
  }

  async getComments(postId: string) {
    try { 
      const response = await axios.get(
        `${this.http}/post/${postId}/comments`,
        this.getAuthConfig()
      );
      return response.data.comments || [];
    } catch (error) {
      console.error('Error получении коментариев:', error);
      return [];
    }
  }

  async addComment(postId: string, text: string) {
    try {
      const response = await axios.post(
        `${this.http}/post/${postId}/comments`,
        { text },
        this.getAuthConfig()
      );
      return response.data.comment;
    } catch (error) {
      console.error('Error При добавлении коментария:', error);
      throw error;
    }
  }

  async deleteComment(postId: string, commentId: string) {
    try {
      await axios.delete(
        `${this.http}/posts/${postId}/comments/${commentId}`,
        this.getAuthConfig()
      );
    } catch (error) {
      console.error('Error не удалилось:', error);
      throw error;
    }
  }

  
  
}