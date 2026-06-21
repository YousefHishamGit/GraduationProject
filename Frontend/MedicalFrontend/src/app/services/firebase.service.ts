import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, Auth, ConfirmationResult } from 'firebase/auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private auth!: Auth;

  constructor() {
    try {
      // Initialize Firebase App
      const app = initializeApp(environment.firebase);
      this.auth = getAuth(app);
      this.auth.useDeviceLanguage();
    } catch (e) {
      console.error('Firebase initialization failed. Make sure you have configured valid credentials in environment.ts.', e);
    }
  }

  getAuthInstance(): Auth {
    return this.auth;
  }

  createRecaptchaVerifier(containerId: string): RecaptchaVerifier {
    return new RecaptchaVerifier(this.auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved, client can continue with signInWithPhoneNumber
      }
    });
  }

  async sendOtp(phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
    if (!this.auth) {
      throw new Error('Firebase Auth is not initialized. Please check your credentials in environment.ts.');
    }
    return signInWithPhoneNumber(this.auth, phoneNumber, appVerifier);
  }
}
