import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private readonly BASE_API_URL = 'http://localhost:5000';
  private readonly BASE_IMAGE_URL = 'http://localhost:5000/';

  async fetchPosts(){
    try {
      const token: string | null = localStorage.getItem('token');
      const url = `${this.BASE_API_URL}/posts`;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(url, config);
      console.log(response.data);
      
      return response.data.posts || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  async createPost(content: string, image?: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      const response = await axios.post(
        `${this.BASE_API_URL}/posts`,
        formData,
        { 
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      await axios.delete(
        `${this.BASE_API_URL}/posts/${postId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  
}