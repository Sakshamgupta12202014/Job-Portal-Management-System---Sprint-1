import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private fb    = inject(FormBuilder);
  private auth  = inject(AuthService);
  private toast = inject(ToastService);

  loading      = signal(false);
  errorMsg     = signal('');
  selectedRole = signal<'JOB_SEEKER' | 'RECRUITER'>('JOB_SEEKER');

  roles = [
    { value: 'JOB_SEEKER' as const, label: 'Job Seeker', icon: '🎯' },
    { value: 'RECRUITER'  as const, label: 'Recruiter',  icon: '🏢' },
  ];

  form = this.fb.group({
    name:     ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    phone:    [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  setRole(r: 'JOB_SEEKER' | 'RECRUITER') { this.selectedRole.set(r); }

  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  submit() {
    console.log('RegisterComponent: Submit triggered');
    if (this.form.invalid) { 
      console.log('RegisterComponent: Form invalid', this.form.errors);
      this.form.markAllAsTouched(); 
      return; 
    }
    
    this.loading.set(true);
    this.errorMsg.set('');

    const payload = { ...this.form.getRawValue(), role: this.selectedRole() } as any;
    console.log('RegisterComponent: Sending payload', payload);

    this.auth.register(payload).subscribe({
      next: (res) => { 
        console.log('RegisterComponent: Success received', res);
        this.toast.success('Account created! Welcome 🎉'); 
        console.log('RegisterComponent: Navigating to dashboard');
        this.auth.navigateToDashboard(); 
      },
      error: (e) => {
        console.error('RegisterComponent: Error received', e);
        this.loading.set(false);
        this.errorMsg.set(e?.error?.message ?? 'Registration failed. Please try again.');
      }
    });
  }
}
