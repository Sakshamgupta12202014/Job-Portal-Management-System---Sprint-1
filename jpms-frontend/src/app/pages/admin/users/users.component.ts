import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { ModalService } from '../../../core/services/modal.service';
import { UserResponse } from '../../../core/models/admin.models';
import { UserRoleBadgeComponent } from '../../../shared/components/user-role-badge/user-role-badge.component';
import { UserStatusBadgeComponent } from '../../../shared/components/user-status-badge/user-status-badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, UserRoleBadgeComponent, UserStatusBadgeComponent, PaginationComponent],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast        = inject(ToastService);
  private modal        = inject(ModalService);

  users   = signal<UserResponse[]>([]);
  loading = signal(true);

  // Pagination State
  currentPage = signal(0);
  pageSize    = signal(10);
  totalPages  = signal(0);
  totalItems  = signal(0);

  isProcessing = signal(false);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.adminService.getAllUsersPaged(this.currentPage(), this.pageSize()).subscribe({
      next: res => { 
        this.users.set(res.content); 
        this.totalPages.set(res.totalPages);
        this.totalItems.set(res.totalElements);
        this.loading.set(false); 
      },
      error: () => {
        this.toast.error('Failed to load users. Please try again.');
        this.loading.set(false);
      }
    });
  }

  setPage(page: number) {
    this.currentPage.set(page);
    this.loadUsers();
  }

  getRoleClass(role: string): string {
    if (role === 'ADMIN') return 'badge-purple';
    if (role === 'RECRUITER') return 'badge-blue';
    return 'badge-gray';
  }

  // --- USER ACTIONS ---

  async handleUserAction(type: 'BAN' | 'UNBAN' | 'DELETE', user: UserResponse) {
    const config = {
      BAN: {
        title: 'Ban User?',
        message: `Are you sure you want to ban '${user.name}'? They will no longer be able to log in or access their data.`,
        confirmText: 'Ban User',
        type: 'danger' as const,
        icon: '🚫'
      },
      UNBAN: {
        title: 'Unban User?',
        message: `Restore access for '${user.name}'? They will regain full access to their account.`,
        confirmText: 'Unban Now',
        type: 'success' as const,
        icon: '🔓'
      },
      DELETE: {
        title: 'Delete User?',
        message: `Permanently delete '${user.name}'? This action is irreversible and will remove all their data from the platform.`,
        confirmText: 'Delete Now',
        type: 'danger' as const,
        icon: '🗑️'
      }
    };

    const confirmed = await this.modal.confirm(config[type]);

    if (confirmed) {
      this.isProcessing.set(true);
      const obs: Observable<any> = type === 'BAN' ? this.adminService.banUser(user.id) :
                  type === 'UNBAN' ? this.adminService.unbanUser(user.id) :
                  this.adminService.deleteUser(user.id);

      obs.subscribe({
        next: () => {
          this.toast.success(`User ${type.toLowerCase()}ned successfully`);
          this.isProcessing.set(false);
          this.loadUsers();
        },
        error: (err: any) => {
          this.toast.error(`Failed to ${type.toLowerCase()} user`);
          this.isProcessing.set(false);
        }
      });
    }
  }
}
