import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface ArticleSection {
  title: string;
  content: string;
  items?: string[];
  image?: string;
}

interface SpecialtyArticle {
  id: string;
  name: string;
  heroImage: string;
  introduction: string;
  diseases: { name: string; desc: string }[];
  symptoms: string[];
  emergencyAdvice: string;
  gallery: string[];
}

@Component({
  selector: 'app-specialty-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './specialty-detail.component.html',
  styleUrls: ['./specialty-detail.component.css']
})
export class SpecialtyDetailComponent implements OnInit {
  article = signal<SpecialtyArticle | null>(null);

  private articles: Record<string, SpecialtyArticle> = {
    'cardiology': {
      id: 'cardiology',
      name: 'Cardiology',
      heroImage: '/assets/img/health/cardiology-1.webp',
      introduction: 'Cardiology is the medical specialty dealing with the diagnosis and treatment of heart and blood vessel disorders. Our department utilizes cutting-edge mapping and imaging systems to provide the most precise care possible.',
      diseases: [
        { name: 'Coronary Artery Disease (CAD)', desc: 'The most common heart disease, caused by plaque buildup in the arteries that supply blood to the heart.' },
        { name: 'Hypertension (High Blood Pressure)', desc: 'A long-term medical condition in which the blood pressure in the arteries is persistently elevated.' },
        { name: 'Heart Failure (CHF)', desc: 'A chronic condition where the heart doesn\'t pump blood as well as it should.' },
        { name: 'Arrhythmias & AFib', desc: 'Irregular heart rhythms that can lead to blood clots, stroke, and heart failure.' },
        { name: 'Valvular Heart Disease', desc: 'Damage to or a defect in one of the four heart valves: mitral, aortic, tricuspid or pulmonary.' },
        { name: 'Congenital Heart Defects', desc: 'One or more problems with the heart\'s structure that are present from birth.' }
      ],
      symptoms: [
        'Acute chest pain or pressure (Angina)',
        'Difficulty breathing or shortness of breath',
        'Sudden fatigue or unexplained weakness',
        'Palpitations or racing heart feeling',
        'Dizziness, lightheadedness or fainting',
        'Persistent cough or wheezing with white/pink phlegm',
        'Swelling (Edema) in ankles, feet or abdomen'
      ],
      emergencyAdvice: 'EMERGENCY: If you experience "crushing" chest pain, radiating pain to the left arm, neck, or jaw, combined with cold sweats, call emergency services immediately. These are common signs of an acute Myocardial Infarction (Heart Attack).',
      gallery: ['/assets/img/health/cardiology-1.webp', '/assets/img/health/cardiology-2.webp', '/assets/img/health/cardiology-3.webp']
    },
    'neurology': {
      id: 'neurology',
      name: 'Neurology',
      heroImage: '/assets/img/health/neurology-2.webp',
      introduction: 'Neurology is the branch of medicine concerned with the study and treatment of disorders of the nervous system. The nervous system is a complex, sophisticated system that regulates and coordinates body activities.',
      diseases: [
        { name: 'Stroke & TIA', desc: 'Interruption of blood flow to the brain, causing rapid loss of brain function.' },
        { name: 'Alzheimer\'s & Dementia', desc: 'Progressive mental deterioration that can occur in middle or old age.' },
        { name: 'Epilepsy & Seizures', desc: 'A disorder in which nerve cell activity in the brain is disturbed, causing seizures.' },
        { name: 'Parkinson\'s Disease', desc: 'A progressive nervous system disorder that affects movement and coordination.' },
        { name: 'Multiple Sclerosis (MS)', desc: 'A disease in which the immune system eats away at the protective covering of nerves.' },
        { name: 'Migraines & Chronic Headaches', desc: 'Severe, recurring headaches often accompanied by nausea and sensitivity to light.' }
      ],
      symptoms: [
        'Sudden numbness or weakness in face or limbs',
        'Severe, unexplained headache',
        'Confusion or difficulty speaking/understanding',
        'Vision loss or double vision',
        'Loss of balance or coordination',
        'Treasures or involuntary movements',
        'Impaired memory or cognitive decline'
      ],
      emergencyAdvice: 'ACT FAST: For a suspected Stroke, remember F.A.S.T: Face drooping, Arm weakness, Speech difficulty, Time to call 911. Every second counts to save brain tissue.',
      gallery: ['/assets/img/health/neurology-2.webp', '/assets/img/health/neurology-3.webp', '/assets/img/health/neurology-4.webp']
    },
    'orthopedics': {
      id: 'orthopedics',
      name: 'Orthopedics',
      heroImage: '/assets/img/health/orthopedics-1.webp',
      introduction: 'Orthopedics focuses on the musculoskeletal system, which includes bones, joints, ligaments, tendons, and muscles. We provide both surgical and non-surgical treatments for traumatic and degenerative conditions.',
      diseases: [
        { name: 'Osteoarthritis', desc: 'Degenerative joint disease caused by the breakdown of joint cartilage and bone.' },
        { name: 'Herniated Disc & Scoliosis', desc: 'Spinal conditions that can cause severe back pain and nerve impingement.' },
        { name: 'Osteoporosis', desc: 'A condition in which bones become weak and brittle, increasing the risk of fractures.' },
        { name: 'Rheumatoid Arthritis', desc: 'An autoimmune disorder that primarily affects joints, causing painful swelling.' },
        { name: 'Carpal Tunnel Syndrome', desc: 'Numbness and tingling in the hand and arm caused by a pinched nerve in the wrist.' },
        { name: 'Sports Injuries (ACL/Meniscus)', desc: 'Tears or damage to ligaments and cartilage caused by sudden movements or trauma.' }
      ],
      symptoms: [
        'Chronic joint pain or stiffness',
        'Swelling, redness or warmth in a joint',
        'Inability to move a limb or bear weight',
        'Back pain that radiates down the legs',
        'Visible deformity in limbs or spine',
        'Crepitus (grinding or popping) in joints',
        'Morning stiffness lasting more than 30 minutes'
      ],
      emergencyAdvice: 'CRITICAL: Seek emergency care for open fractures, severe spinal trauma, or joints that appear "dislocated." Do not attempt to reset a bone yourself as it may cause nerve damage.',
      gallery: ['/assets/img/health/orthopedics-1.webp', '/assets/img/health/orthopedics-4.webp', '/assets/img/health/facilities-9.webp']
    },
    'pediatrics': {
      id: 'pediatrics',
      name: 'Pediatrics',
      heroImage: '/assets/img/health/pediatrics-3.webp',
      introduction: 'Pediatrics is dedicated to the physical, mental, and social health of children from birth to young adulthood. We focus on preventive care and the treatment of acute and chronic illnesses in children.',
      diseases: [
        { name: 'Asthma & Allergies', desc: 'Chronic respiratory conditions that are highly prevalent in children and require ongoing management.' },
        { name: 'Type 1 Diabetes', desc: 'An autoimmune condition where the pancreas produces little or no insulin, appearing in childhood.' },
        { name: 'Infectious Diseases', desc: 'Measles, Mumps, Rubella, and other viral/bacterial infections common in pediatric groups.' },
        { name: 'ADHD & Autism Spectrum', desc: 'Neurodevelopmental conditions that require early diagnosis and specialized support.' },
        { name: 'Pediatric Obesity', desc: 'A complex disease with multiple contributing factors requiring lifestyle and medical intervention.' },
        { name: 'Otitis Media', desc: 'Inflammation or infection of the middle ear, very common in infants and young children.' }
      ],
      symptoms: [
        'High or persistent fever in infants',
        'Difficulty breathing or cyanosis (blue lips)',
        'Persistent vomiting or signs of dehydration',
        'Sudden changes in behavior or extreme lethargy',
        'Severe rashes with fever',
        'Delayed developmental milestones',
        'Frequent ear infections or respiratory issues'
      ],
      emergencyAdvice: 'PEDIATRIC EMERGENCY: If your child is struggling to breathe, is unresponsive, or has a seizure for the first time, call emergency services. Always ensure the child\'s airway is clear.',
      gallery: ['/assets/img/health/pediatrics-3.webp', '/assets/img/health/pediatrics-4.webp', '/assets/img/health/vaccination-3.webp']
    },
    'surgery': {
      id: 'surgery',
      name: 'General Surgery',
      heroImage: '/assets/img/health/surgery-2.webp',
      introduction: 'Our surgical department offers a wide range of procedures, specializing in minimally invasive and robotic-assisted surgeries for faster recovery times and better patient outcomes.',
      diseases: [
        { name: 'Appendicitis', desc: 'Severe inflammation of the appendix requiring immediate surgical removal.' },
        { name: 'Gallstones (Colelithiasis)', desc: 'Hardened deposits of digestive fluid that can form in your gallbladder.' },
        { name: 'Abdominal Hernias', desc: 'A condition where an organ pushes through an opening in the muscle or tissue.' },
        { name: 'Colon & Rectal Cancers', desc: 'Malignant growths requiring specialized oncological surgery.' },
        { name: 'Hemorrhoids & Fistulas', desc: 'Conditions of the lower digestive tract that may require surgical intervention.' },
        { name: 'Soft Tissue Tumors', desc: 'Removal of benign or malignant growths from muscles, fat, or other tissues.' }
      ],
      symptoms: [
        'Sharp, localized abdominal pain',
        'Unexplained lumps or bulges in the groin/abdomen',
        'Nausea and vomiting that won\'t stop',
        'Jaundice (yellowing of skin or eyes)',
        'Significant, unexplained weight loss',
        'Blood in stool or changes in bowel habits',
        'Difficulty swallowing or chronic acid reflux'
      ],
      emergencyAdvice: 'URGENT: Sudden, excruciating abdominal pain that makes it impossible to stand straight requires immediate surgical evaluation. Do not eat or drink anything until seen by a doctor.',
      gallery: ['/assets/img/health/surgery-2.webp', '/assets/img/health/laboratory-3.webp', '/assets/img/health/facilities-6.webp']
    },
    'emergency': {
      id: 'emergency',
      name: 'Emergency Medicine',
      heroImage: '/assets/img/health/emergency-1.webp',
      introduction: 'Our Emergency Department is open 24/7 to provide life-saving care for patients with critical and life-threatening conditions. We provide rapid triage and immediate stabilization.',
      diseases: [
        { name: 'Acute Myocardial Infarction', desc: 'Heart attack requiring immediate reperfusion to save heart muscle.' },
        { name: 'Sepsis & Septic Shock', desc: 'The body\'s extreme and life-threatening response to an infection.' },
        { name: 'Anaphylaxis', desc: 'A severe, potentially life-threatening allergic reaction.' },
        { name: 'Severe Trauma', desc: 'Multiple injuries caused by accidents, falls, or violence.' },
        { name: 'Poisoning & Overdose', desc: 'Acute toxicity requiring immediate gastric lavage or antidotes.' },
        { name: 'Respiratory Failure', desc: 'A condition in which not enough oxygen passes from your lungs into your blood.' }
      ],
      symptoms: [
        'Unconsciousness or altered mental state',
        'Severe bleeding that cannot be stopped',
        'Inability to breathe or choking',
        'Seizures lasting more than 5 minutes',
        'Signs of severe shock (pale, cold, clammy skin)',
        'Ingestion of toxic substances',
        'Severe burns or electrification'
      ],
      emergencyAdvice: 'CALL 911: Do not attempt to drive yourself to the ER if you are experiencing a life-threatening crisis. Professional paramedics can begin treatment in the ambulance.',
      gallery: ['/assets/img/health/emergency-1.webp', '/assets/img/health/emergency-2.webp', '/assets/img/health/consultation-4.webp']
    },
    'internal': {
      id: 'internal',
      name: 'Internal Medicine',
      heroImage: '/assets/img/health/staff-1.webp',
      introduction: 'Internal Medicine physicians are specialists who apply scientific knowledge and clinical expertise to the diagnosis, treatment, and compassionate care of adults.',
      diseases: [
        { name: 'Type 2 Diabetes', desc: 'A chronic condition that affects the way the body processes blood sugar (glucose).' },
        { name: 'Chronic Kidney Disease', desc: 'Progressive loss of kidney function over a period of months or years.' },
        { name: 'Thyroid Disorders', desc: 'Conditions that affect the thyroid gland, a butterfly-shaped gland in the front of the neck.' },
        { name: 'COPD & Lung Disease', desc: 'Chronic inflammatory lung disease that causes obstructed airflow from the lungs.' },
        { name: 'Gastrointestinal Disorders', desc: 'Conditions affecting the digestive tract, such as Crohn\'s disease or IBS.' },
        { name: 'Infectious Diseases', desc: 'Diagnosis and treatment of complex infections caused by bacteria, viruses, or fungi.' }
      ],
      symptoms: [
        'Chronic fatigue and weakness',
        'Unexplained changes in weight',
        'Persistent digestive issues or abdominal discomfort',
        'Frequent urination or extreme thirst',
        'Chronic cough or wheezing',
        'Recurring fevers or night sweats',
        'General malaise or "not feeling right"'
      ],
      emergencyAdvice: 'ADVICE: While Internal Medicine often deals with chronic issues, sudden spikes in blood sugar or high fevers in immunocompromised patients require immediate clinical attention.',
      gallery: ['/assets/img/health/staff-1.webp', '/assets/img/health/laboratory-3.webp', '/assets/img/health/staff-2.webp']
    },
    'ophthalmology': {
      id: 'ophthalmology',
      name: 'Ophthalmology',
      heroImage: '/assets/img/health/facilities-9.webp',
      introduction: 'Our Ophthalmology department provides comprehensive eye care, ranging from routine vision tests to advanced surgical procedures for complex eye diseases.',
      diseases: [
        { name: 'Cataracts', desc: 'Clouding of the normally clear lens of the eye, causing blurred vision.' },
        { name: 'Glaucoma', desc: 'A group of eye conditions that damage the optic nerve, often caused by high pressure.' },
        { name: 'Macular Degeneration', desc: 'An eye disease that causes vision loss, typically in the center of the field of vision.' },
        { name: 'Diabetic Retinopathy', desc: 'A complication of diabetes that affects the eyes and can cause blindness.' },
        { name: 'Retinal Detachment', desc: 'An emergency situation in which a thin layer of tissue at the back of the eye pulls away.' },
        { name: 'Refractive Errors', desc: 'Common vision problems such as nearsightedness, farsightedness, and astigmatism.' }
      ],
      symptoms: [
        'Blurred, cloudy or double vision',
        'Sudden loss of vision in one or both eyes',
        'Seeing "floaters" or flashes of light',
        'Severe eye pain or redness',
        'Haloes around lights',
        'Reduced peripheral (side) vision',
        'Sensitivity to light and glare'
      ],
      emergencyAdvice: 'EYE EMERGENCY: Sudden loss of vision, "curtain" falling over your sight, or severe eye trauma require an immediate visit to an ophthalmologist or emergency room to prevent permanent blindness.',
      gallery: ['/assets/img/health/facilities-9.webp', '/assets/img/health/staff-14.webp', '/assets/img/health/staff-3.webp']
    },
    'dentistry': {
      id: 'dentistry',
      name: 'Dentistry',
      heroImage: '/assets/img/health/staff-4.webp',
      introduction: 'Our dental center offers a full spectrum of oral healthcare services, from preventive cleaning and fillings to complex oral surgery and cosmetic dentistry.',
      diseases: [
        { name: 'Periodontal (Gum) Disease', desc: 'An infection of the tissues that support your teeth, leading to tooth loss if untreated.' },
        { name: 'Dental Caries (Cavities)', desc: 'Permanently damaged areas in the hard surface of your teeth that develop into tiny holes.' },
        { name: 'Oral Cancer', desc: 'Malignant growths that can occur anywhere in the mouth, including lips and tongue.' },
        { name: 'TMJ Disorders', desc: 'Conditions causing pain and dysfunction in the jaw joint and muscles.' },
        { name: 'Impacted Wisdom Teeth', desc: 'Third molars at the back of the mouth that don\'t have enough room to emerge or develop normally.' },
        { name: 'Tooth Sensitivity', desc: 'Pain or discomfort in the teeth as a response to certain stimuli, such as hot or cold temperatures.' }
      ],
      symptoms: [
        'Persistent toothache or sharp pain',
        'Swollen, red or bleeding gums',
        'Persistent bad breath (Halitosis)',
        'Loose or shifting teeth',
        'Sores or white patches in the mouth',
        'Jaw clicking or locking',
        'Receding gums or exposed tooth roots'
      ],
      emergencyAdvice: 'DENTAL EMERGENCY: If a permanent tooth is knocked out, keep it moist (in milk or saliva) and seek a dentist within 30 minutes. Facial swelling with fever may indicate a dangerous abscess.',
      gallery: ['/assets/img/health/staff-4.webp', '/assets/img/health/staff-10.webp', '/assets/img/health/staff-7.webp']
    }
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && this.articles[id]) {
        this.article.set(this.articles[id]);
      }
    });

    // Auto-scroll to top when navigating
    window.scrollTo(0, 0);
  }
}
