import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';
import { RevenueReport } from '../interfaces/admin.interface';

@Injectable({ providedIn: 'root' })
export class AdminEndpoint extends BaseEndpoint {
  private baseUrl = this.getBaseUrl('admin');

  getRevenueReport(): Observable<RevenueReport> {
    return this.http.get<RevenueReport>(`${this.baseUrl}/reports/revenue`);
  }
}
