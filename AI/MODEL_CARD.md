# Model Card for Medical Triage AI System

## Model Details

### Model Description

A machine learning system that analyzes patient symptoms and provides preliminary medical triage information including diagnosis suggestions, medical specialty recommendations, and urgency levels. The system combines traditional ML (TF-IDF + Logistic Regression) with advanced LLM capabilities via Groq's LLaMA 3 70B model.

- **Developed by**: Medical Graduation Project Team
- **Model type**: Classification System
- **Language**: English, Arabic
- **License**: Proprietary
- **Finetuned from model**: Groq LLaMA 3 70B

## Uses

### Direct Use Cases

- **Clinical Triage**: Initial symptom assessment and urgency classification
- **Patient Guidance**: Directing patients to appropriate medical specialties
- **Healthcare Systems**: Integration with hospital/clinic management systems
- **Medical Education**: Training and reference for medical students

### Out-of-Scope Use Cases

- **Final Medical Diagnosis**: Should never be used as the sole basis for diagnosis
- **Treatment Prescription**: Cannot prescribe or recommend specific medications
- **Emergency Replacement**: Cannot replace emergency medical professionals
- **Legal Medical Documentation**: Not suitable for official medical records

## Intended Users

- Healthcare providers
- Hospital IT administrators
- Medical students and educators
- Healthcare system developers

## Model Architecture

### Component 1: Preprocessing Module
- Text cleaning and normalization
- Medical term standardization
- Multilingual support (Arabic ↔ English translation)

### Component 2: Feature Extraction
- **Vectorizer**: TF-IDF (Term Frequency-Inverse Document Frequency)
- **N-grams**: Unigrams and bigrams
- **Features**: Extracted medical terms and symptom patterns

### Component 3: Classification
- **Triage Model**: Logistic Regression for urgency classification
  - Classes: critical, moderate, normal
- **Specialty Model**: Logistic Regression for medical specialty recommendation
- **LLM Layer**: Groq LLaMA 3 70B for enhanced analysis

## Training Data

- **Source**: Medical symptoms dataset
- **Size**: See `DataSet/symptoms.csv`
- **Preprocessing**: Text normalization, medical term standardization
- **Train/Test Split**: 80/20
- **Domain**: General medical symptoms and presentations

## Performance Metrics

- **Triage Accuracy**: [Add from training metrics]
- **Specialty Prediction Accuracy**: [Add from training metrics]
- **Response Time**: < 2 seconds per request via Groq API
- **Uptime**: Depends on Groq API availability

## Limitations

1. **Language Limitations**: 
   - Primary training on English medical terms
   - Arabic translation may not capture all medical nuances

2. **Scope Limitations**:
   - Trained on common symptoms only
   - May not recognize rare or complex conditions
   - Limited to symptom-based analysis

3. **Technical Limitations**:
   - Depends on external Groq API
   - Rate-limited based on Groq plan
   - Requires internet connectivity

4. **Medical Limitations**:
   - Cannot replace professional medical evaluation
   - Should not be used for legal/official medical purposes
   - Cannot account for complex patient histories

## Testing & Evaluation

### Test Scenarios
- Single symptom input
- Multiple symptoms input
- Critical symptom detection
- Cross-language (Arabic/English) handling
- Invalid input handling

### Recommended Additional Testing
- Clinical validation with medical professionals
- Testing with diverse patient populations
- Edge case and adversarial testing
- Performance under load

## Environmental Impact

- **Compute**: Runs on standard CPU/GPU
- **Energy**: Depends on Groq infrastructure
- **Carbon**: Minimal direct carbon footprint

## Bias & Fairness

### Known Biases
- Training data may reflect imbalances in available medical datasets
- May perform differently across different demographic groups
- Language translation may introduce bias

### Bias Mitigation
- Regular auditing with diverse test cases recommended
- Human expert review of recommendations
- Continuous monitoring in production

## Ethical Considerations

1. **Transparency**: Always disclose that this is an AI system
2. **Responsibility**: Never use as sole diagnostic tool
3. **Privacy**: Implement proper data handling procedures
4. **Equity**: Consider access in underserved communities
5. **Oversight**: Maintain human medical professional oversight

## Caveats & Recommendations

### Must-Have Safeguards
1. ✅ Display clear disclaimer about AI limitations
2. ✅ Never disable human review of recommendations
3. ✅ Implement user feedback mechanisms
4. ✅ Log all predictions for auditing
5. ✅ Regular validation with medical professionals

### Recommended Best Practices
- Monitor for model drift over time
- Regular retraining with new data
- A/B testing with expert physicians
- Community feedback incorporation
- Published model documentation

## Model Card Contact

For questions about this model card, please contact the development team.

---

## Disclaimer

⚠️ **MEDICAL DISCLAIMER**: This AI system provides preliminary analysis and triage recommendations only. It is NOT a substitute for professional medical diagnosis, treatment, or emergency services. Always consult qualified medical professionals for actual medical advice and treatment.

**Not for clinical decision-making without human expert review.**

---

**Model Version**: 1.0  
**Last Updated**: May 2026  
**Status**: Production Ready (with safeguards)
