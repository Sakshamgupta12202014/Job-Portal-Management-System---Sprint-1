import { Component } from '@angular/core';
import { SeekerProfileComponent } from '../../job-seeker/profile/seeker-profile.component';

// Recruiters share the same profile management UI as seekers
@Component({
  selector: 'app-recruiter-profile',
  standalone: true,
  imports: [SeekerProfileComponent],
  templateUrl: './recruiter-profile.component.html'
})
export class RecruiterProfileComponent {}
