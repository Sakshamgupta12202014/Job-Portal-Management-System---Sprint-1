import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html'
})
export class PaginationComponent {
  currentPage   = input.required<number>();
  totalPages    = input.required<number>();
  totalElements = input.required<number>();
  pageChange    = output<number>();

  pageNumbers(): number[] {
    const total = this.totalPages();
    const cur   = this.currentPage();
    const range = 5;
    const start = Math.max(0, Math.min(cur - Math.floor(range / 2), total - range));
    const end   = Math.min(total, start + range);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }
}
