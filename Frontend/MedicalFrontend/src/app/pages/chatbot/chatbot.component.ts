import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EndPoints } from '../../services/endpoints';

interface Message {
  id: number;
  type: 'user' | 'bot' | 'loading';
  text?: string;
  result?: any;
  time: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  private endpoint = inject(EndPoints);

  messages = signal<Message[]>([]);
  inputText = '';
  isLoading = signal(false);
  msgIdCounter = 0;
  private shouldScroll = false;

  suggestions = [
    'I have chest pain and shortness of breath',
    'I have a severe headache and fever',
    'My knee hurts when I walk',
    'I have stomach pain and nausea',
    'I feel dizzy and tired all day',
    'I have a rash on my skin'
  ];

  constructor() {
    this.addBotWelcome();
  }

  addBotWelcome() {
    this.messages.set([{
      id: ++this.msgIdCounter,
      type: 'bot',
      text: 'welcome',
      time: new Date()
    }]);
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  scrollToBottom() {
    try {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch { }
  }

  sendMessage(text?: string) {
    const msg = (text || this.inputText).trim();
    if (!msg || this.isLoading()) return;

    this.messages.update(m => [...m, {
      id: ++this.msgIdCounter,
      type: 'user',
      text: msg,
      time: new Date()
    }]);

    this.inputText = '';
    this.isLoading.set(true);
    this.shouldScroll = true;

    const loadingId = ++this.msgIdCounter;
    this.messages.update(m => [...m, {
      id: loadingId,
      type: 'loading',
      time: new Date()
    }]);

    this.endpoint.ai.predict({ symptoms: msg }).subscribe({
      next: (res) => {
        this.messages.update(m => m.filter(x => x.id !== loadingId));
        this.messages.update(m => [...m, {
          id: ++this.msgIdCounter,
          type: 'bot',
          result: res,
          time: new Date()
        }]);
        this.isLoading.set(false);
        this.shouldScroll = true;
      },
      error: () => {
        this.messages.update(m => m.filter(x => x.id !== loadingId));
        this.messages.update(m => [...m, {
          id: ++this.msgIdCounter,
          type: 'bot',
          text: 'error',
          time: new Date()
        }]);
        this.isLoading.set(false);
        this.shouldScroll = true;
      }
    });
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  // ← عدلنا الـ Function عشان تستخدم urgency_level
  getUrgencyColor(level: string): string {
    switch (level) {
      case 'critical': return 'urgency-red';
      case 'moderate': return 'urgency-orange';
      default: return 'urgency-green';
    }
  }

  // ← أيقونة حسب الـ urgency
  getUrgencyIcon(level: string): string {
    switch (level) {
      case 'critical': return 'fas fa-exclamation-triangle';
      case 'moderate': return 'fas fa-exclamation-circle';
      default: return 'fas fa-check-circle';
    }
  }

  clearChat() {
    this.msgIdCounter = 0;
    this.addBotWelcome();
  }
}