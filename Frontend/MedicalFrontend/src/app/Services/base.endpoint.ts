import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export abstract class BaseEndpoint {
  protected http = inject(HttpClient);
  protected readonly apiUrl = environment.apiUrl;

  protected getBaseUrl(endpoint: string): string {
    return `${this.apiUrl}/${endpoint}`;
  }

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