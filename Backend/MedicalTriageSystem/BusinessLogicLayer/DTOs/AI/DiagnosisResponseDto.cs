using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.AI
{
    public class DiagnosisResponseDto
    {
        public string Symptoms { get; set; } = string.Empty;
        public string Translated { get; set; } = string.Empty;
        public string Diagnosis { get; set; } = string.Empty;

        [JsonPropertyName("recommended_specialty")]
        public string RecommendedSpecialty { get; set; } = string.Empty;

        [JsonPropertyName("urgency_message")]
        public string UrgencyMessage { get; set; } = string.Empty;

        public List<string> Tips { get; set; } = new();
    }
}
