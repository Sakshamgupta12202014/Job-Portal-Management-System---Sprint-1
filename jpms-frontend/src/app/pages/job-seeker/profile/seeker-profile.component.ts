import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserProfileResponse } from '../../../core/models/auth.models';

@Component({
  selector: 'app-seeker-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './seeker-profile.component.html'
})
export class SeekerProfileComponent implements OnInit {
  private auth  = inject(AuthService);
  private toast = inject(ToastService);

  profile        = signal<UserProfileResponse | null>(null);
  loading        = signal(true);
  uploadingPic   = signal(false);
  uploadingResume = signal(false);

  ngOnInit() {
    this.auth.getProfile().subscribe({
      next: (p: UserProfileResponse) => { this.profile.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  uploadPicture(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingPic.set(true);
    this.auth.uploadProfilePicture(file).subscribe({
      next: (res: any) => {
        this.profile.update(p => p ? { ...p, profilePictureUrl: res.profilePictureUrl } : p);
        this.toast.success('Profile picture updated!');
        this.uploadingPic.set(false);
      },
      error: () => { this.toast.error('Upload failed.'); this.uploadingPic.set(false); }
    });
  }

  uploadResume(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingResume.set(true);
    this.auth.uploadResume(file).subscribe({
      next: (res: any) => {
        this.profile.update(p => p ? { ...p, resumeUrl: res.resumeUrl } : p);
        this.toast.success('Resume uploaded!');
        this.uploadingResume.set(false);
      },
      error: () => { this.toast.error('Upload failed.'); this.uploadingResume.set(false); }
    });
  }
}
