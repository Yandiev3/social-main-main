import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../service/user.service';
import { PostService } from '../../service/post.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, FormsModule,],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent {
  user: any;
  posts: any[] = [];
  newPostContent: string = '';
  selectedImage: File | null = null;

  constructor(
    private router: Router, 
    private userService: UserService,
    private postService: PostService
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadPosts();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (res: any) => {
        this.user = res;
        this.loadPosts();
      },
      error: (error: any) => {
        console.error("Error profile:", error);
      },
    });
  }
  async loadPosts() {
    this.posts = await this.postService.fetchPosts();
  }

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0];
  }

  async createPost() {
    if (!this.newPostContent.trim()) return;

    try {
      await this.postService.createPost(this.newPostContent, this.selectedImage || undefined);
      this.newPostContent = '';
      this.selectedImage = null;
      await this.loadPosts();
    } catch (error) {
      console.error('Ошибка при создании post:', error);
    }
  }
}