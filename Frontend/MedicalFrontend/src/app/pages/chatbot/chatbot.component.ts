import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EndPoints } from '../../services/endpoints';
import { ChatResponseDto, FileAttachmentDto } from '../../services/ai.endpoint';
import { LanguageService } from '../../services/language.service';

interface ChatMessage {
  id: number;
  type: 'user' | 'bot' | 'loading';
  text?: string;               // نص الرسالة العادي أو 'welcome' / 'error'
  diagnosis?: {
    diagnosis: string;
    recommended_specialty: string;
    urgency_level: 'critical' | 'moderate' | 'normal';
  } | null;
  // يمكن أن يأتي تحليل التقرير أو الصورة ضمن same structure من الـ API
  // ولكن الـ API يعيد نفس حقل diagnosis فقط، فلا حاجة لـ reportAnalysis/imageAnalysis
  // إذا أردنا عرض معلومات إضافية، يمكن استخراجها من النص، لكننا سنعتمد على diagnosis.
  // مع ذلك، سنبقي على حقول reportAnalysis و imageAnalysis للتوافق مع الـ HTML الحالي
  // لكننا لن نستخدمها في هذا الإصدار الجديد. بدلاً من ذلك، سنعرض كل شيء في نص الرد.
  reportAnalysis?: any;
  imageAnalysis?: any;
  fileName?: string;
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
  @ViewChild('fileInput') fileInput!: ElementRef;

  private endpoint = inject(EndPoints);
  public language = inject(LanguageService);

  messages = signal<ChatMessage[]>([]);
  inputText = '';
  isLoading = signal(false);
  msgIdCounter = 0;
  private shouldScroll = false;
  private sessionId: string | undefined = undefined;   // حفظ جلسة المحادثة

  // رفع الملفات (سنرسلها مع الرسالة)
  selectedFiles = signal<File[]>([]);   // قائمة ملفات متعددة
  // لا نحتاج fileType منفصل

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
    this.sessionId = undefined;   // بدء جلسة جديدة
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

  // ── رفع الملفات (متعددة) ──────────────────────
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const files = Array.from(input.files);
    // تصفية: PDF أو صور فقط
    const validFiles = files.filter(f => f.type === 'application/pdf' || f.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      alert('بعض الملفات غير مدعومة. يُسمح فقط بـ PDF والصور.');
    }
    if (validFiles.length) {
      this.selectedFiles.update(prev => [...prev, ...validFiles]);
    }
    input.value = ''; // لإعادة التحديد لاحقاً
  }

  removeFile(index: number) {
    this.selectedFiles.update(files => files.filter((_, i) => i !== index));
  }

  clearAllFiles() {
    this.selectedFiles.set([]);
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  // تحويل الملفات إلى base64 (بدون prefix) لترسل إلى API
  private async filesToBase64(files: File[]): Promise<FileAttachmentDto[]> {
    const promises = files.map(async (file) => {
      return new Promise<FileAttachmentDto>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          let base64 = reader.result as string;
          // إزالة الجزء الأول data:...;base64,
          const commaIndex = base64.indexOf(',');
          if (commaIndex !== -1) base64 = base64.substring(commaIndex + 1);
          resolve({
            name: file.name,
            content: base64,
          });
        };
        reader.onerror = (error) => reject(error);
      });
    });
    return Promise.all(promises);
  }

  // ── إرسال الرسالة مع الملفات (إن وجدت) ─────────
  async sendMessage(text?: string) {
    const msg = (text || this.inputText).trim();
    if ((!msg && this.selectedFiles().length === 0) || this.isLoading()) return;

    // إضافة رسالة المستخدم للواجهة (نص + أسماء الملفات)
    let userDisplay = msg;
    if (this.selectedFiles().length) {
      const fileNames = this.selectedFiles().map(f => `📎 ${f.name}`).join(', ');
      userDisplay = msg ? `${msg}\n${fileNames}` : fileNames;
    }
    this.messages.update(m => [...m, {
      id: ++this.msgIdCounter,
      type: 'user',
      text: userDisplay,
      time: new Date()
    }]);

    // تفريغ الحقول
    this.inputText = '';
    const filesToSend = [...this.selectedFiles()];
    this.clearAllFiles();

    this.isLoading.set(true);
    this.shouldScroll = true;

    // إظهار رسالة انتظار (تحميل)
    const loadingId = ++this.msgIdCounter;
    this.messages.update(m => [...m, {
      id: loadingId,
      type: 'loading',
      time: new Date()
    }]);

    try {
      // تحويل الملفات إلى base64
      const attachments = await this.filesToBase64(filesToSend);
      const payload = {
        message: msg,
        files: attachments.length ? attachments : undefined,
        sessionId: this.sessionId
      };

      this.endpoint.ai.chat(payload).subscribe({
        next: (res: ChatResponseDto) => {
          // تخزين sessionId للجلسات القادمة
          if (res.sessionId) this.sessionId = res.sessionId;

          this.messages.update(m => m.filter(x => x.id !== loadingId));
          this.messages.update(m => [...m, {
            id: ++this.msgIdCounter,
            type: 'bot',
            text: res.reply,
            diagnosis: res.diagnosis,  // قد يكون null إذا لم يوجد
            time: new Date()
          }]);
          this.isLoading.set(false);
          this.shouldScroll = true;
        },
        error: (err) => {
          console.error('Chat error:', err);
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
    } catch (err) {
      console.error('File conversion error:', err);
      this.messages.update(m => m.filter(x => x.id !== loadingId));
      this.messages.update(m => [...m, {
        id: ++this.msgIdCounter,
        type: 'bot',
        text: 'error',
        time: new Date()
      }]);
      this.isLoading.set(false);
    }
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  // دعم للحصول على ألوان وأيقونات مستوى الطوارئ (نفس السابق)
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
      case 'moderate': return 'حالة متوسطة - يُنصح بزيارة طبيب';
      default: return 'حالة عادية - يمكنك حجز موعد';
    }
  }

  clearChat() {
    this.msgIdCounter = 0;
    this.clearAllFiles();
    this.addBotWelcome();
    this.sessionId = undefined;
  }
}