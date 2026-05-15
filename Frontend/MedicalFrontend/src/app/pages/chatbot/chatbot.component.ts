import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EndPoints } from '../../services/endpoints';
import { ChatMessageDto } from '../../services/ai.endpoint';

interface ChatMessage {
  id: number;
  type: 'user' | 'bot' | 'loading';
  text?: string;
  diagnosis?: {
    diagnosis: string;
    recommended_specialty: string;
    urgency_level: 'critical' | 'moderate' | 'normal';
  } | null;
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

  messages = signal<ChatMessage[]>([]);
  inputText = '';
  isLoading = signal(false);
  msgIdCounter = 0;
  private shouldScroll = false;

  /** Conversation history sent to the AI for context */
  private conversationHistory: ChatMessageDto[] = [];

  suggestions = [
    'I have a headache that won\'t go away',
    'عندي ألم في صدري',
    'I feel dizzy and tired',
    'عندي حرارة عالية من يومين',
    'My stomach hurts after eating',
    'I have a skin rash on my arms'
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
    this.conversationHistory = [];
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

    // Add user message to UI
    this.messages.update(m => [...m, {
      id: ++this.msgIdCounter,
      type: 'user',
      text: msg,
      time: new Date()
    }]);

    this.inputText = '';
    this.isLoading.set(true);
    this.shouldScroll = true;

    // Add to conversation history
    this.conversationHistory.push({ role: 'user', content: msg });

    // Show loading indicator
    const loadingId = ++this.msgIdCounter;
    this.messages.update(m => [...m, {
      id: loadingId,
      type: 'loading',
      time: new Date()
    }]);

    // Call the chat endpoint with full conversation history
    this.endpoint.ai.chat({ messages: this.conversationHistory }).subscribe({
      next: (res) => {
        // Remove loading indicator
        this.messages.update(m => m.filter(x => x.id !== loadingId));

        // Add bot reply to conversation history
        this.conversationHistory.push({ role: 'assistant', content: res.reply });

        // Add bot reply to UI
        this.messages.update(m => [...m, {
          id: ++this.msgIdCounter,
          type: 'bot',
          text: res.reply,
          diagnosis: res.diagnosis,
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

  getUrgencyColor(level: string): string {
    switch (level) {
      case 'critical': return 'urgency-red';
      case 'moderate': return 'urgency-orange';
      default: return 'urgency-green';
    }
  }

  getUrgencyIcon(level: string): string {
    switch (level) {
      case 'critical': return 'fas fa-exclamation-triangle';
      case 'moderate': return 'fas fa-exclamation-circle';
      default: return 'fas fa-check-circle';
    }
  }

  getUrgencyLabel(level: string): string {
    switch (level) {
      case 'critical': return 'حالة حرجة - توجه للطوارئ فوراً';
      case 'moderate': return 'حالة متوسطة - يُنصح بزيارة طبيب قريباً';
      default: return 'حالة عادية - يمكنك حجز موعد';
    }
  }

  clearChat() {
    this.msgIdCounter = 0;
    this.addBotWelcome();
  }
}