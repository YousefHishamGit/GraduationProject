using AutoMapper;
using BusinessLogicLayer.DTOs.Review;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implementation
{
    public class ReviewService : IReviewService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ReviewService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetByDoctorIdAsync(int doctorId)
        {
            var reviews = await _unitOfWork.Reviews.GetByDoctorIdAsync(doctorId);
            return _mapper.Map<IEnumerable<ReviewResponseDto>>(reviews);
        }

        public async Task<ReviewResponseDto> CreateAsync(CreateReviewDto dto)
        {
            var review = _mapper.Map<Review>(dto);
            await _unitOfWork.Reviews.AddAsync(review);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<ReviewResponseDto>(review);
        }

        public async Task<ReviewResponseDto?> UpdateAsync(int id, UpdateReviewDto dto)
        {
            var review = await _unitOfWork.Reviews.GetByIdAsync(id);
            if (review == null) return null;

            _mapper.Map(dto, review);
            _unitOfWork.Reviews.Update(review);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<ReviewResponseDto>(review);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var review = await _unitOfWork.Reviews.GetByIdAsync(id);
            if (review == null) return false;

            _unitOfWork.Reviews.Delete(review);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<double> GetAverageRatingAsync(int doctorId)
        {
            return await _unitOfWork.Reviews.GetAverageRatingAsync(doctorId);
        }
    }
}
