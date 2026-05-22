import { Component, inject, signal, computed, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EndPoints } from '../../services/endpoints';
import { ChatResponseDto, FileAttachmentDto } from '../../services/ai.endpoint';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

export interface BotSection {
  title: string;
  icon: string;
  type: 'general' | 'image-desc' | 'interpretation' | 'actions' | 'monitor' | 'emergency' | 'warning' | 'question';
  items: string[];
  rawText: string;
}

interface ChatMessage {
  id: number;
  type: 'user' | 'bot' | 'loading';
  text?: string;
  diagnosis?: {
    diagnosis: string;
    recommended_specialty: string;
    urgency_level: 'critical' | 'moderate' | 'normal';
  } | null;
  fileName?: string;
  time: Date;
  recommendedDepartment?: any;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  private endpoint = inject(EndPoints);
  public language = inject(LanguageService);
  private authService = inject(AuthService);

  messages = signal<ChatMessage[]>([]);
  inputText = '';
  isLoading = signal(false);
  msgIdCounter = 0;
  private shouldScroll = false;
  private sessionId: string | undefined = undefined;

  // File Uploads
  selectedFiles = signal<File[]>([]);
  private readonly demoPdfUrl = '/assets/advertisement/fake_lab_report.pdf';
  private readonly demoPdfName = 'fake_lab_report.pdf';

  // Medical History states
  isPatientLoggedIn = signal(false);
  patientId = signal<number | null>(null);
  patientRecords = signal<{
    medicalRecords: any[];
    prescriptions: any[];
    labRequests: any[];
  }>({ medicalRecords: [], prescriptions: [], labRequests: [] });
  showRecordsPanel = signal(false);
  recordsLoading = signal(false);
  activeRecordTab = signal<'lab' | 'prescriptions' | 'medical'>('lab');

  // System Doctors & Departments for recommendations
  systemDoctors = signal<any[]>([]);
  systemDepartments = signal<any[]>([]);

  suggestions = computed(() => {
    const lang = this.language.currentLanguage();
    const keys = ['chatSuggestion1', 'chatSuggestion2', 'chatSuggestion3', 'chatSuggestion4', 'chatSuggestion5'];
    return keys.map(k => this.language.translate(k));
  });

  constructor() {
    this.addBotWelcome();
  }

  ngOnInit() {
    this.checkPatientSession();
    this.loadSystemDoctorsAndDepartments();
  }

  checkPatientSession() {
    if (this.authService.isLoggedIn() && this.authService.getRole() === 'Patient') {
      this.isPatientLoggedIn.set(true);
      const userId = this.authService.getUserIdFromToken();
      if (userId) {
        this.recordsLoading.set(true);
        this.endpoint.patients.getByUserId(userId).subscribe({
          next: (p) => {
            this.patientId.set(p.id);
            this.loadPatientRecords(p.id);
          },
          error: () => this.recordsLoading.set(false)
        });
      }
    }
  }

  loadSystemDoctorsAndDepartments() {
    this.endpoint.doctors.getAll().subscribe({
      next: (docs) => {
        this.systemDoctors.set(docs.filter(doc => doc.status !== 'Inactive'));
      }
    });
    this.endpoint.departments.getAll().subscribe({
      next: (depts) => {
        this.systemDepartments.set(depts);
      }
    });
  }

  getLatestSpecialty(): string | undefined {
    const list = this.messages();
    for (let i = list.length - 1; i >= 0; i--) {
      const diag = list[i].diagnosis;
      if (diag && diag.recommended_specialty) {
        return diag.recommended_specialty;
      }
    }
    return undefined;
  }

  getDepartmentForSpecialty(specialty?: string, msgText?: string): any | null {
    const depts = this.systemDepartments();
    if (depts.length === 0) return null;

    let searchTerms: string[] = [];

    // Keywords mapping for Arabic/English common specialties to match departmentNames in DB
    const keywords: { [key: string]: string[] } = {
      'Cardiology': ['قلب', 'cardio', 'heart'],
      'Dentistry': ['أسنان', 'dentist', 'dental', 'اسنان'],
      'Ophthalmology': ['عيون', 'رمد', 'eyes', 'ophthalmology', 'نظر'],
      'Pediatrics': ['أطفال', 'اطفال', 'pediatric', 'children'],
      'Orthopedics': ['عظام', 'orthopedic', 'bone'],
      'Neurology': ['أعصاب', 'اعصاب', 'neuro', 'brain'],
      'Dermatology': ['جلدية', 'جلديه', 'جلد', 'dermatology', 'skin'],
      'Gynecology': ['نساء', 'ولادة', 'توليد', 'gynecology', 'obstetrics', 'حمل'],
      'Urology': ['مسالك', 'بولية', 'urology', 'kidney', 'كلى', 'كلي'],
      'Oncology': ['أورام', 'اورام', 'سرطان', 'oncology', 'cancer'],
      'Psychiatry': ['نفسية', 'نفسي', 'psychiatry', 'mental'],
      'ENT': ['أنف', 'أذن', 'حنجرة', 'ent', 'ear', 'nose', 'throat', 'سمع'],
      'Gastroenterology': ['جهاز هضمي', 'هضمي', 'معدة', 'معده', 'قولون', 'gastro', 'stomach'],
      'Endocrinology': ['غدد', 'سكري', 'سكر', 'endo', 'diabetes', 'thyroid'],
      'Pulmonology': ['صدر', 'صدرية', 'تنفس', 'lungs', 'pulmo', 'asthma'],
      'Internal Medicine': ['باطنة', 'باطنه', 'internal', 'stomach', 'معدة', 'معده', 'سكري', 'diabetes', 'غدد']
    };

    const textToSearch = (msgText || '').toLowerCase();
    
    // Step 1: Matching keywords in the message text (priority)
    let matchedKeyword = '';
    for (const [key, list] of Object.entries(keywords)) {
      if (list.some(term => textToSearch.includes(term))) {
        matchedKeyword = key;
        break;
      }
    }

    if (matchedKeyword) {
      searchTerms.push(matchedKeyword.toLowerCase());
      searchTerms.push(matchedKeyword.replace(/ /g, '').toLowerCase());
    }

    // Step 2: If no keyword in the message, check the specialty parameter (from diagnosis/chat history)
    if (searchTerms.length === 0 && specialty) {
      const specLower = specialty.toLowerCase();
      searchTerms.push(specLower);
      searchTerms.push(specLower.replace(/ /g, '').toLowerCase());
      for (const [key, list] of Object.entries(keywords)) {
        if (key.toLowerCase() === specLower || list.some(term => specLower.includes(term))) {
          searchTerms.push(key.toLowerCase());
          searchTerms.push(key.replace(/ /g, '').toLowerCase());
        }
      }
    }

    // Step 3: If still no search terms, check the patient's medical records for past diagnoses
    if (searchTerms.length === 0 && this.isPatientLoggedIn()) {
      const records = this.patientRecords().medicalRecords;
      if (records && records.length > 0) {
        for (const record of records) {
          if (record && record.diagnosis) {
            const diagText = record.diagnosis.toLowerCase();
            let recordMatched = '';
            for (const [key, list] of Object.entries(keywords)) {
              if (list.some(term => diagText.includes(term))) {
                recordMatched = key;
                break;
              }
            }
            if (recordMatched) {
              searchTerms.push(recordMatched.toLowerCase());
              searchTerms.push(recordMatched.replace(/ /g, '').toLowerCase());
              break;
            }
          }
        }
      }
    }

    if (searchTerms.length > 0) {
      // Find matching department by departmentName or description
      const matched = depts.find(dept => {
        const name = (dept.departmentName || '').toLowerCase();
        const desc = (dept.description || '').toLowerCase();
        return searchTerms.some(term => name.includes(term) || desc.includes(term));
      });
      if (matched) return matched;
    }

    // Fallback: general medicine / internal medicine
    const generalDept = depts.find(d => 
      d.departmentName.toLowerCase().includes('internal') || 
      d.departmentName.toLowerCase().includes('general') || 
      d.departmentName.includes('باطن') ||
      d.departmentName.includes('عام')
    );
    return generalDept || depts[0] || null;
  }

  loadPatientRecords(patientId: number) {
    forkJoin({
      medicalRecords: this.endpoint.medicalRecords.getByPatient(patientId),
      prescriptions: this.endpoint.prescriptions.getByPatient(patientId),
      labRequests: this.endpoint.labRequests.getByPatient(patientId)
    }).subscribe({
      next: (res) => {
        this.patientRecords.set({
          medicalRecords: res.medicalRecords || [],
          prescriptions: res.prescriptions.map((p: any) => ({
            ...p, medicineName: p.medicineName || p.medicationName
          })) || [],
          labRequests: res.labRequests || []
        });
        this.recordsLoading.set(false);
      },
      error: () => this.recordsLoading.set(false)
    });
  }

  toggleRecordsPanel() {
    this.showRecordsPanel.update(v => !v);
  }

  getFileUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${path}`;
  }

  async fetchFileAsBlobAndBase64(path: string): Promise<File | null> {
    const url = this.getFileUrl(path);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('فشل تحميل الملف');
      const blob = await response.blob();
      const filename = path.split('/').pop() || 'result_file.pdf';
      const fileType = blob.type || (filename.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      return new File([blob], filename, { type: fileType });
    } catch (error) {
      console.error('Error fetching file from backend:', error);
      return null;
    }
  }

  async analyzePrescription(p: any) {
    this.showRecordsPanel.set(false);
    const text = `أريد شرحاً ونصائح طبية منزلية لهذه الوصفة الطبية:
دواء: ${p.medicineName}
الجرعة: ${p.dosage}
التكرار: ${p.frequency}
المدة: ${p.durationDays} أيام
التعليمات: ${p.instructions || 'لا توجد'}`;
    await this.sendMessageWithFiles(text, []);
  }

  async analyzeLabTest(lab: any) {
    this.showRecordsPanel.set(false);
    let file: File | null = null;
    if (lab.resultFilePath) {
      this.isLoading.set(true);
      file = await this.fetchFileAsBlobAndBase64(lab.resultFilePath);
      this.isLoading.set(false);
    }
    const text = `أريد تحليلاً لنتيجة التحليل الطبي التالي: ${lab.testName} (الحالة: ${lab.status}).`;
    await this.sendMessageWithFiles(text, file ? [file] : []);
  }

  async analyzeMedicalRecord(mr: any) {
    this.showRecordsPanel.set(false);
    let file: File | null = null;
    if (mr.attachedFilePath) {
      this.isLoading.set(true);
      file = await this.fetchFileAsBlobAndBase64(mr.attachedFilePath);
      this.isLoading.set(false);
    }
    const details = [
      `أريد تحليلاً للسجل الطبي التالي:`,
      mr.diagnosis ? `• التشخيص: ${mr.diagnosis}` : '',
      mr.notes ? `• الملاحظات: ${mr.notes}` : '',
      mr.vitalSigns ? `• المؤشرات الحيوية: ${mr.vitalSigns}` : ''
    ].filter(Boolean).join('\n');
    await this.sendMessageWithFiles(details, file ? [file] : []);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Confirmed: 'badge-success', Pending: 'badge-warning',
      Cancelled: 'badge-danger', Completed: 'badge-info',
      Done: 'badge-success', Requested: 'badge-warning'
    };
    return map[status] || 'badge-secondary';
  }

  addBotWelcome() {
    this.messages.set([{
      id: ++this.msgIdCounter,
      type: 'bot',
      text: 'welcome',
      time: new Date()
    }]);
    this.sessionId = undefined;
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const files = Array.from(input.files);
    const validFiles = files.filter(f => f.type === 'application/pdf' || f.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      alert('بعض الملفات غير مدعومة. يُسمح فقط بـ PDF والصور.');
    }
    if (validFiles.length) {
      this.selectedFiles.update(prev => [...prev, ...validFiles]);
    }
    input.value = '';
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

  private async filesToBase64(files: File[]): Promise<FileAttachmentDto[]> {
    const promises = files.map(async (file) => {
      return new Promise<FileAttachmentDto>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          let base64 = reader.result as string;
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

          const textToCheck = (msg + ' ' + (res.reply || '')).toLowerCase();
          const lastSpecialty = res.diagnosis?.recommended_specialty || this.getLatestSpecialty();
          
          let recommendedDept = null;
          const hasDoctorKeyword = /(دكتور|دكاترة|دكتورة|طبيب|أطباء|طبيبة|أخصائي|اخصائي|أخصائية|اخصائية|doctor|physician|حجز|احجز|عيادة|عياده|قسم|أقسام|اقسام|clinic|department)/i.test(textToCheck);
          
          if (res.diagnosis || hasDoctorKeyword) {
            recommendedDept = this.getDepartmentForSpecialty(lastSpecialty, textToCheck);
          }

          this.messages.update(m => [...m, {
            id: ++this.msgIdCounter,
            type: 'bot',
            text: res.reply,
            diagnosis: res.diagnosis,
            recommendedDepartment: recommendedDept || undefined,
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

  parseReply(text?: string): BotSection[] {
    if (!text) return [];
    if (text === 'welcome' || text === 'error') {
      return [{
        title: '',
        icon: '',
        type: 'general',
        items: [],
        rawText: text
      }];
    }

    const sections: BotSection[] = [];
    const lines = text.split('\n');
    let currentSection: BotSection = {
      title: '',
      icon: '',
      type: 'general',
      items: [],
      rawText: ''
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        if (currentSection.title || currentSection.rawText || currentSection.items.length) {
          sections.push({ ...currentSection });
        }

        const headerTitle = headerMatch[2].trim();
        let type: BotSection['type'] = 'general';
        let icon = '';
        let titleClean = headerTitle;

        if (headerTitle.includes('📷') || headerTitle.toLowerCase().includes('image') || headerTitle.includes('وصف الصورة') || headerTitle.includes('الوصف')) {
          type = 'image-desc';
          icon = 'fas fa-image';
          titleClean = headerTitle.replace(/📷/g, '').trim();
        } else if (headerTitle.includes('🔍') || headerTitle.includes('يعني') || headerTitle.includes('تفسير') || headerTitle.includes('احتمالات')) {
          type = 'interpretation';
          icon = 'fas fa-search-plus';
          titleClean = headerTitle.replace(/🔍/g, '').trim();
        } else if (headerTitle.includes('✅') || headerTitle.includes('تعمل') || headerTitle.includes('إجراءات') || headerTitle.includes('خطوات عملية')) {
          type = 'actions';
          icon = 'fas fa-first-aid';
          titleClean = headerTitle.replace(/✅/g, '').trim();
        } else if (headerTitle.includes('📊') || headerTitle.includes('راقب') || headerTitle.includes('متابعة')) {
          type = 'monitor';
          icon = 'fas fa-heartbeat';
          titleClean = headerTitle.replace(/📊/g, '').trim();
        } else if (headerTitle.includes('🚨') || headerTitle.includes('طوارئ') || headerTitle.includes('عاجل')) {
          type = 'emergency';
          icon = 'fas fa-exclamation-triangle';
          titleClean = headerTitle.replace(/🚨/g, '').trim();
        } else if (headerTitle.includes('⚠️') || headerTitle.includes('تنبيه') || headerTitle.includes('تحذير')) {
          type = 'warning';
          icon = 'fas fa-exclamation-circle';
          titleClean = headerTitle.replace(/⚠️/g, '').trim();
        } else if (headerTitle.includes('❓') || headerTitle.includes('سؤال')) {
          type = 'question';
          icon = 'fas fa-question-circle';
          titleClean = headerTitle.replace(/❓/g, '').trim();
        } else {
          type = 'general';
          icon = 'fas fa-info-circle';
        }

        currentSection = {
          title: titleClean,
          icon: icon,
          type: type,
          items: [],
          rawText: ''
        };
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemText = trimmed.substring(2).trim();
        if (itemText) currentSection.items.push(itemText);
      } else if (/^\d+[\.\)]\s+/.test(trimmed)) {
        const itemText = trimmed.replace(/^\d+[\.\)]\s+/, '').trim();
        if (itemText) currentSection.items.push(itemText);
      } else {
        if (currentSection.rawText) {
          currentSection.rawText += '<br>' + trimmed;
        } else {
          currentSection.rawText = trimmed;
        }
      }
    }

    if (currentSection.title || currentSection.rawText || currentSection.items.length) {
      sections.push({ ...currentSection });
    }

    return sections.map(s => {
      const formatStr = (str: string) => {
        if (!str) return str;
        return str
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');
      };

      return {
        ...s,
        title: formatStr(s.title),
        items: s.items.map(formatStr),
        rawText: formatStr(s.rawText)
      };
    });
  }

  clearChat() {
    this.msgIdCounter = 0;
    this.clearAllFiles();
    this.addBotWelcome();
    this.sessionId = undefined;
  }
}