import { ChangeDetectorRef, Component } from '@angular/core';
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
  user: any = { _id: '', stack: [] };
  posts: any[] = [];
  newPostContent: string = '';
  // selectedImage: File | null = null;

  constructor(
    private router: Router, 
    private userService: UserService,
    private postService: PostService,
    // private cdr: ChangeDetectorRef
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
        try {
      this.posts = await this.postService.fetchPosts();
      this.posts.forEach(post => {
        post.isLiked = post.likes?.includes(this.user._id) || false;
        post.commentsCount = post.comments?.length || 0;
        post.isEditing = false
      });

    } catch (error) {
      console.error("Ошибка при загрузке постов", error);
    }
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

  async savePost(post: any) {
    if (!post.editedContent?.trim()) return;
    
    try {
      await this.postService.updatePost(post._id, post.editedContent);
      post.content = post.editedContent;
      post.isEditing = false;
    } catch (error) {
      console.error('Ошибка при обновлении поста:', error);
    }
  }

  async deletePost(post: any) {
    const confirmDelete = confirm('Вы уверены, что хотите удалить этот пост?');
    if (!confirmDelete) return;

    try {
      await this.postService.deletePost(post._id);
      this.posts = this.posts.filter(p => p._id !== post._id);
    } catch (error) {
      console.error('Ошибка при удалении поста:', error);
    }
  }

  startEditPost(post: any) {
    post.editedContent = post.content;
    post.isEditing = true;
    post.showMenu = false;
  }

  cancelEdit(post: any) {
    post.isEditing = false;
  }

  togglePostMenu(post: any) {
    post.showMenu = !post.showMenu;
  }

async toggleLike(post: any) {
  const originalState = {
      isLiked: post.isLiked,
      likes: [...post.likes],
      likesCount: post.likesCount
    };

  try {
    if (post.isLiked) {
      await this.postService.unlikePost(post._id);
      post.likes = post.likes.filter((id: string) => id !== this.user._id);
    // this.cdr.detectChanges();
    } else {
      await this.postService.likePost(post._id);
      post.likes = post.likes || [];
      post.likes.push(this.user._id);
    }
    
    post.isLiked = !post.isLiked;
    post.likesCount = post.likes?.length || 0;
  
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
    post.comments.push(newComment);
    post.commentsCount = (post.commentsCount || 0) + 1;
    post.newComment = '';
  } catch (error) {
    console.error('Ошибка при добавлении комментария:', error);
  }
}
}