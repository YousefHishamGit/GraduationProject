using BusinessLogicLayer.DTOs.AI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IAIService
    {
        Task<DiagnosisResponseDto> PredictAsync(string symptoms);
    }
}
