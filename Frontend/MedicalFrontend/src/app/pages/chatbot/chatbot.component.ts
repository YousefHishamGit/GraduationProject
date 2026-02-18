import { Component, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  isTyping?: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;

  messages = signal<Message[]>([
    { sender: 'bot', text: "Hello! I'm your Health Assistant. How can I help you today?" }
  ]);
  userInput = signal<string>('');

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.chatMessagesContainer.nativeElement.scrollTop =
        this.chatMessagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  formatMessage(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  sendMessage() {
    const message = this.userInput().trim();
    if (!message) return;

    this.messages.update(msgs => [...msgs, { sender: 'user', text: message }]);
    this.userInput.set('');

    this.messages.update(msgs => [...msgs, { sender: 'bot', text: '', isTyping: true }]);

    setTimeout(() => {
      this.messages.update(msgs => {
        const filtered = msgs.filter(m => !m.isTyping);
        return [...filtered, { sender: 'bot', text: this.generateResponse(message) }];
      });
    }, 1000);
  }

  generateResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm here to help you with health-related questions. How can I assist you today?";
    } else if (lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
      return 'To book an appointment, please visit our **appointment page** or call us at **+1 (555) 123-4567**. You can also ask me about available doctors and departments.';
    } else if (lowerMessage.includes('doctor')) {
      return 'We have experienced doctors in various specialties including:\n\n* Cardiology\n* Neurology\n* Orthopedics\n* Pediatrics\n* Dermatology\n\nYou can view all doctors on our **doctors page** or book an appointment directly.';
    } else if (lowerMessage.includes('department')) {
      return 'We offer services in multiple departments:\n\n* **Cardiology** - Heart and cardiovascular care\n* **Neurology** - Brain and nervous system\n* **Orthopedics** - Bone and joint treatment\n* **Pediatrics** - Children\'s healthcare\n* **Emergency** - 24/7 emergency services\n\nWhich department would you like to know more about?';
    } else if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
      return '🚨 **For emergencies, please call 911 immediately** or visit our emergency department at **+1 (555) 911-9111**. Our emergency services are available 24/7.';
    } else if (lowerMessage.includes('hours') || lowerMessage.includes('open')) {
      return 'Our clinic hours are:\n\n* **Monday - Friday**: 8:00 AM - 8:00 PM\n* **Saturday**: 9:00 AM - 5:00 PM\n* **Sunday**: 10:00 AM - 4:00 PM\n* **Emergency**: 24/7';
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone')) {
      return 'You can reach us at:\n\n📞 **Main**: +1 (555) 123-4567\n📧 **Email**: contact@clinic.com\n📍 **Address**: 123 Health Street, Medical City\n\nOur team is available to assist you during business hours.';
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee')) {
      return 'Our consultation fees vary by specialty:\n\n* **General Practice**: $100 - $150\n* **Specialist Consultation**: $200 - $400\n* **Emergency Visit**: $500+\n\nPlease contact us for specific pricing or check with your insurance provider.';
    } else {
      return "Thank you for your message. I'm here to help with general health information and clinic services.\n\nFor specific medical advice, please **consult with one of our doctors** or call **+1 (555) 123-4567**.\n\nIs there anything else I can help you with?";
    }
  }
}
