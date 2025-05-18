import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');

    if (userId) {
      this.userService.getUser(Number(userId)).subscribe({
        next: (data) => {
          this.user = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load user details. Please try again.';
          console.error('Error loading user:', err);
          this.loading = false;
        },
      });
    } else {
      this.error = 'User ID not provided';
      this.loading = false;
    }
  }

  deleteUser(): void {
    if (!this.user) return;

    if (confirm(`Are you sure you want to delete ${this.user.name}?`)) {
      this.userService.deleteUser(this.user.id).subscribe({
        next: () => {
          alert('User deleted successfully');
          this.router.navigate(['/users']);
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Failed to delete user. Please try again.');
        },
      });
    }
  }
}
