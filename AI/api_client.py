"""
Medical Triage AI - Python Client
Easy-to-use Python client for the Medical Triage AI API

Example usage:
    from api_client import MedicalTriageClient
    
    client = MedicalTriageClient("http://localhost:7860")
    result = client.predict("chest pain and shortness of breath")
    print(result)
"""

import requests
import json
from typing import Dict, Optional
from dataclasses import dataclass


@dataclass
class TriageResult:
    """Medical triage analysis result"""
    symptoms: str
    diagnosis: str
    recommended_specialty: str
    urgency_level: str  # critical, moderate, normal
    urgency_message: str
    tips: list
    disclaimer: str


class MedicalTriageClient:
    """Client for Medical Triage AI API"""
    
    def __init__(self, base_url: str = "http://localhost:7860", timeout: int = 30):
        """
        Initialize the API client
        
        Args:
            base_url: Base URL of the API (default: localhost:7860)
            timeout: Request timeout in seconds (default: 30)
        """
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
    
    def health_check(self) -> Dict:
        """
        Check API health status
        
        Returns:
            Dictionary with status information
            
        Raises:
            requests.RequestException: If API is unreachable
        """
        try:
            response = self.session.get(
                f"{self.base_url}/health",
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise Exception(f"Health check failed: {str(e)}")
    
    def get_info(self) -> Dict:
        """
        Get API information
        
        Returns:
            Dictionary with API information
        """
        response = self.session.get(f"{self.base_url}/info", timeout=self.timeout)
        response.raise_for_status()
        return response.json()
    
    def predict(self, symptoms: str) -> TriageResult:
        """
        Analyze patient symptoms and get triage recommendation
        
        Args:
            symptoms: Patient symptom description (English or Arabic)
            
        Returns:
            TriageResult object with analysis
            
        Raises:
            ValueError: If symptoms is empty
            requests.RequestException: If API call fails
        """
        if not symptoms or not symptoms.strip():
            raise ValueError("Symptoms cannot be empty")
        
        try:
            response = self.session.post(
                f"{self.base_url}/predict",
                json={"symptoms": symptoms},
                timeout=self.timeout,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 400:
                raise ValueError(f"Invalid request: {response.json().get('error')}")
            elif response.status_code == 503:
                raise Exception("API service unavailable (Groq key not configured)")
            elif response.status_code == 500:
                error_msg = response.json().get('error', 'Unknown error')
                raise Exception(f"API error: {error_msg}")
            
            response.raise_for_status()
            
            data = response.json()
            return TriageResult(
                symptoms=data.get('symptoms', symptoms),
                diagnosis=data.get('diagnosis', 'Unable to determine'),
                recommended_specialty=data.get('recommended_specialty', 'General Medicine'),
                urgency_level=data.get('urgency_level', 'normal'),
                urgency_message=data.get('urgency_message', ''),
                tips=data.get('tips', []),
                disclaimer=data.get('disclaimer', '')
            )
        
        except requests.RequestException as e:
            raise Exception(f"API request failed: {str(e)}")
    
    def close(self):
        """Close the session"""
        self.session.close()
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()


# Example usage and utility functions

def analyze_symptoms(symptoms: str, api_url: str = "http://localhost:7860") -> None:
    """
    Simple function to analyze symptoms and print results
    
    Args:
        symptoms: Patient symptoms
        api_url: API URL
    """
    try:
        client = MedicalTriageClient(api_url)
        
        # Check API health first
        print("🔍 Checking API health...")
        health = client.health_check()
        print(f"✅ API Status: {health['status']}")
        print(f"   Model: {health['model']}")
        print()
        
        # Analyze symptoms
        print(f"📋 Analyzing symptoms: {symptoms}")
        print("-" * 50)
        
        result = client.predict(symptoms)
        
        print(f"📌 Diagnosis: {result.diagnosis}")
        print(f"🏥 Specialty: {result.recommended_specialty}")
        print(f"⚠️  Urgency Level: {result.urgency_level.upper()}")
        print(f"🔔 Message: {result.urgency_message}")
        print()
        print("💡 Tips:")
        for i, tip in enumerate(result.tips, 1):
            print(f"   {i}. {tip}")
        print()
        print(f"⚖️  {result.disclaimer}")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")


def batch_analyze(symptom_list: list, api_url: str = "http://localhost:7860") -> None:
    """
    Analyze multiple symptom sets
    
    Args:
        symptom_list: List of symptom strings
        api_url: API URL
    """
    with MedicalTriageClient(api_url) as client:
        for i, symptoms in enumerate(symptom_list, 1):
            print(f"\n{'='*50}")
            print(f"Case {i}: {symptoms}")
            print('='*50)
            try:
                result = client.predict(symptoms)
                print(f"Diagnosis: {result.diagnosis}")
                print(f"Specialty: {result.recommended_specialty}")
                print(f"Urgency: {result.urgency_level}")
            except Exception as e:
                print(f"Error: {str(e)}")


if __name__ == "__main__":
    # Example 1: Single symptom analysis
    print("🏥 Medical Triage AI - Python Client Demo\n")
    
    # Test symptoms
    test_cases = [
        "chest pain and shortness of breath",
        "high fever and persistent cough",
        "severe headache and stiff neck",
        "abdominal pain and nausea"
    ]
    
    print("Running analysis on multiple cases...\n")
    batch_analyze(test_cases)
    
    print("\n" + "="*50)
    print("✅ Analysis complete!")
