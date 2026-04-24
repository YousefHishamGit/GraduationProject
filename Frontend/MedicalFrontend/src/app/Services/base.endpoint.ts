import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export abstract class BaseEndpoint {
  protected http = inject(HttpClient);
  protected readonly apiUrl = environment.apiUrl;

  /**
   * Helper to append an endpoint to the base API URL.
   * @param endpoint The specific endpoint path (e.g., 'doctors')
   * @returns The full URL
   */
  protected getBaseUrl(endpoint: string): string {
    return `${this.apiUrl}/${endpoint}`;
  }

  /**
   * Helper to convert an object to FormData.
   * Useful for multipart/form-data requests (e.g., file uploads).
   */
  protected toFormData(obj: any): FormData {
    const formData = new FormData();
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return formData;
  }
}
