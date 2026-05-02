import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { AuditLog } from '../../../core/models/admin.models';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-logs.component.html'
})
export class AuditLogsComponent implements OnInit {
  private adminService = inject(AdminService);

  logs    = signal<AuditLog[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.adminService.getAuditLogs().subscribe({
      next: (res: AuditLog[]) => { this.logs.set(res); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
