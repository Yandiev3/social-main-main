import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../service/user.service';
import { PostService } from '../../service/post.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, FormsModule, DatePipe],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent {
  user: any = { stack: [] };
  posts: any[] = [];
  newPostContent: string = '';
  // selectedImage: File | null = null;

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
        console.error("Ошибка при получении", error);
      },
    });
  }
  async loadPosts() {
    this.posts = await this.postService.fetchPosts();
  }

  // onImageSelected(event: any) {
  //   this.selectedImage = event.target.files[0];
  // }

  async createPost() {
    if (!this.newPostContent.trim()) return;

    try {
      await this.postService.createPost(this.newPostContent);
      this.newPostContent = '';
      // this.selectedImage = null;
      await this.loadPosts();
    } catch (error) {
      console.error('Ошибка при создании post:', error);
    }
  }


  // Добавьте эти методы в ваш ProfilePageComponent

async toggleLike(post: any) {
  try {
    if (post.isLiked) {
      await this.postService.unlikePost(post._id);
      post.likesCount--;
    } else {
      await this.postService.likePost(post._id);
      post.likesCount++;
    }
    post.isLiked = !post.isLiked;
  } catch (error) {
    console.error('Ошибка при лайке:', error);
  }
}

toggleComments(post: any) {
  post.showComments = !post.showComments;
  if (post.showComments && !post.commentsLoaded) {
    this.loadComments(post);
  }
}

async loadComments(post: any) {
  try {
    post.comments = await this.postService.getComments(post._id);
    post.commentsLoaded = true;
  } catch (error) {
    console.error('Ошибка при загрузке комментариев:', error);
  }
}

async addComment(post: any) {
  if (!post.newComment?.trim()) return;
  
  try {
    const newComment = await this.postService.addComment(post._id, post.newComment);
    post.comments = post.comments || [];
    post.comments.unshift(newComment);
    post.commentsCount++;
    post.newComment = '';
  } catch (error) {
    console.error('Ошибка при добавлении комментария:', error);
  }
}
}