using BusinessLogicLayer.DTOs.AI;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implementation
{
    public class AIService : IAIService
    {
        private readonly HttpClient _httpClient;
        private readonly string _flaskBaseUrl;

        public AIService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _flaskBaseUrl = configuration["AI:BaseUrl"] ?? "http://localhost:5000";
        }

        public async Task<DiagnosisResponseDto> PredictAsync(string symptoms)
        {
            var payload = new { symptoms };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_flaskBaseUrl}/predict", content);

            if (!response.IsSuccessStatusCode)
                throw new Exception("AI service is unavailable");

            var responseJson = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<DiagnosisResponseDto>(responseJson,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return result!;
        }
    }
}
