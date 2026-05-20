import { Component, inject, signal, computed, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
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
  private readonly demoPdfUrl = '/assets/advertisement/fake_lab_report.pdf';
  private readonly demoPdfName = 'fake_lab_report.pdf';

  suggestions = computed(() => {
    const lang = this.language.currentLanguage();
    const keys = ['chatSuggestion1', 'chatSuggestion2', 'chatSuggestion3', 'chatSuggestion4', 'chatSuggestion5'];
    return keys.map(k => this.language.translate(k));
  });

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

  private messageReferencesPdf(msg: string): boolean {
    return /\.pdf\b/i.test(msg) || /📎/.test(msg);
  }

  private async fetchDemoLabPdf(): Promise<File | null> {
    try {
      const res = await fetch(this.demoPdfUrl);
      if (!res.ok) return null;
      const blob = await res.blob();
      return new File([blob], this.demoPdfName, { type: 'application/pdf' });
    } catch {
      return null;
    }
  }

  async sendDemoLabReport() {
    const file = await this.fetchDemoLabPdf();
    if (!file) {
      alert(this.language.translate('chatError'));
      return;
    }
    await this.sendMessageWithFiles(this.language.translate('chatAnalyzeReport'), [file]);
  }

  private async resolvePdfAttachments(msg: string, files: File[]): Promise<{ msg: string; files: File[] }> {
    if (files.length || !this.messageReferencesPdf(msg)) {
      return { msg, files };
    }
    if (/fake_lab_report/i.test(msg)) {
      const demo = await this.fetchDemoLabPdf();
      if (demo) {
        const cleaned = msg
          .replace(/📎\s*fake_lab_report\.pdf/gi, '')
          .replace(/fake_lab_report\.pdf/gi, '')
          .replace(/حلل\s*/gi, '')
          .trim();
        return {
          msg: cleaned || this.language.translate('chatAnalyzeReport'),
          files: [demo],
        };
      }
    }
    return { msg, files };
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
    const rawMsg = (text ?? this.inputText).trim();
    if ((!rawMsg && this.selectedFiles().length === 0) || this.isLoading()) return;

    this.inputText = '';
    const pendingFiles = [...this.selectedFiles()];
    this.clearAllFiles();

    const resolved = await this.resolvePdfAttachments(rawMsg, pendingFiles);
    if (resolved.files.length === 0 && this.messageReferencesPdf(rawMsg)) {
      this.messages.update(m => [...m, {
        id: ++this.msgIdCounter,
        type: 'bot',
        text: this.language.translate('chatPdfHint'),
        time: new Date()
      }]);
      this.shouldScroll = true;
      return;
    }

    await this.sendMessageWithFiles(resolved.msg, resolved.files, rawMsg);
  }

  private async sendMessageWithFiles(msg: string, filesToSend: File[], displayOverride?: string) {
    let userDisplay = displayOverride ?? msg;
    if (filesToSend.length) {
      const fileNames = filesToSend.map(f => `📎 ${f.name}`).join(', ');
      userDisplay = msg ? `${msg}\n${fileNames}` : fileNames;
    }
    this.messages.update(m => [...m, {
      id: ++this.msgIdCounter,
      type: 'user',
      text: userDisplay,
      time: new Date()
    }]);

    this.isLoading.set(true);
    this.shouldScroll = true;

    const loadingId = ++this.msgIdCounter;
    this.messages.update(m => [...m, {
      id: loadingId,
      type: 'loading',
      time: new Date()
    }]);

    try {
      const attachments = await this.filesToBase64(filesToSend);
      const payload = {
        message: msg,
        files: attachments.length ? attachments : undefined,
        sessionId: this.sessionId
      };

      this.endpoint.ai.chat(payload).subscribe({
        next: (res: ChatResponseDto) => {
          if (res.sessionId) this.sessionId = res.sessionId;

          this.messages.update(m => m.filter(x => x.id !== loadingId));
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
      case 'critical': return '🔴 ' + this.language.translate('chatUrgencyCritical');
      case 'moderate': return '🟠 ' + this.language.translate('chatUrgencyModerate');
      default: return '🟡 ' + this.language.translate('chatUrgencyNormal');
    }
  }

  shouldShowDoctorReferral(level: string): boolean {
    return level === 'critical' || level === 'moderate';
  }

  hasAssessment(d: ChatMessage['diagnosis']): boolean {
    return !!d?.diagnosis?.trim();
  }

  formatReply(text?: string): string {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
  }

  clearChat() {
    this.msgIdCounter = 0;
    this.clearAllFiles();
    this.addBotWelcome();
    this.sessionId = undefined;
  }
}