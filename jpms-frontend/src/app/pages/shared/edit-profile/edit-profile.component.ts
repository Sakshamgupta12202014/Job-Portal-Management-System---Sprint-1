import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { UpdateProfileRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private toast  = inject(ToastService);
  private router = inject(Router);

  profileForm: FormGroup;
  saving          = signal(false);
  uploadingPic    = signal(false);
  uploadingResume = signal(false);
  removingPic     = signal(false);
  removingResume  = signal(false);

  profilePictureUrl = signal<string | null>(null);
  resumeUrl         = signal<string | null>(null);

  constructor() {
    this.profileForm = this.fb.group({
      name:            ['', [Validators.required]],
      phone:           [''],
      bio:             [''],
      location:        [''],
      skills:          [''],
      experienceYears: [0, [Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.auth.getProfile().subscribe({
      next: (p: any) => {
        this.profileForm.patchValue({
          name:            p.name,
          phone:           p.phone,
          bio:             p.bio,
          location:        p.location,
          skills:          p.skills,
          experienceYears: p.experienceYears
        });
        this.profilePictureUrl.set(p.profilePictureUrl ?? null);
        this.resumeUrl.set(p.resumeUrl ?? null);
      },
      error: () => this.toast.error('Failed to load profile data.')
    });
  }

  getSkillsList(): string[] {
    const skills = this.profileForm.get('skills')?.value;
    if (!skills) return [];
    return skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  }

  onSubmit() {
    if (this.profileForm.invalid) return;
    this.saving.set(true);
    const payload: UpdateProfileRequest = this.profileForm.value;
    this.auth.updateProfile(payload).subscribe({
      next: () => {
        this.toast.success('Profile updated successfully!');
        window.history.back();
      },
      error: () => {
        this.toast.error('Failed to update profile.');
        this.saving.set(false);
      }
    });
  }

  onPickPicture(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingPic.set(true);
    this.auth.uploadProfilePicture(file).subscribe({
      next: (res: any) => {
        this.profilePictureUrl.set(res.profilePictureUrl);
        this.toast.success('Profile picture updated!');
        this.uploadingPic.set(false);
      },
      error: () => {
        this.toast.error('Failed to upload picture.');
        this.uploadingPic.set(false);
      }
    });
  }

  removePicture() {
    this.removingPic.set(true);
    this.auth.removeProfilePicture().subscribe({
      next: () => {
        this.profilePictureUrl.set(null);
        this.toast.success('Profile picture removed.');
        this.removingPic.set(false);
      },
      error: () => {
        this.toast.error('Failed to remove profile picture.');
        this.removingPic.set(false);
      }
    });
  }

  onPickResume(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingResume.set(true);
    this.auth.uploadResume(file).subscribe({
      next: (res: any) => {
        this.resumeUrl.set(res.resumeUrl);
        this.toast.success('Resume uploaded successfully!');
        this.uploadingResume.set(false);
      },
      error: () => {
        this.toast.error('Failed to upload resume.');
        this.uploadingResume.set(false);
      }
    });
  }

  removeResume() {
    this.removingResume.set(true);
    this.auth.removeResume().subscribe({
      next: () => {
        this.resumeUrl.set(null);
        this.toast.success('Resume removed successfully.');
        this.removingResume.set(false);
      },
      error: () => {
        this.toast.error('Failed to remove resume.');
        this.removingResume.set(false);
      }
    });
  }
}
