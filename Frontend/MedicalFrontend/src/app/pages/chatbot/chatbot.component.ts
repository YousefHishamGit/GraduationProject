import { Component } from '@angular/core';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [],
  template: `
    <section class="page-section">
      <div class="container">
        <h1 class="page-title">Health Assistant</h1>
        <p class="page-lead">Get instant answers to your health questions.</p>
        <p>Chatbot interface will be implemented here.</p>
      </div>
    </section>
  `,
  styles: [`
    .page-section { padding: 6rem 0; min-height: 50vh; }
    .page-title { font-size: 2.5rem; margin-bottom: 1rem; color: #0f172a; }
    .page-lead { font-size: 1.2rem; color: #64748b; margin-bottom: 1.5rem; }
  `]
})
export class ChatbotComponent {}
