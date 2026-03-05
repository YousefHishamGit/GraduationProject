using BusinessLogicLayer.DTOs.Review;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{

    public interface IReviewService
    {
        Task<IEnumerable<ReviewResponseDto>> GetByDoctorIdAsync(int doctorId);
        Task<ReviewResponseDto> CreateAsync(CreateReviewDto dto);
        Task<ReviewResponseDto?> UpdateAsync(int id, UpdateReviewDto dto);
        Task<bool> DeleteAsync(int id);
        Task<double> GetAverageRatingAsync(int doctorId);
    }
}
