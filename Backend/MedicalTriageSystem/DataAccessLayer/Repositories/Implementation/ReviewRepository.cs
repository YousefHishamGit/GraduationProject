using DataAccessLayer.Data;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Implementation
{
    public class ReviewRepository : GenericRepository<Review>, IReviewRepository
    {
        private readonly MedicalTriageDbContext _dbContext;

        public ReviewRepository(MedicalTriageDbContext context) : base(context)
        {
            _dbContext = context;
        }

        public async Task<IEnumerable<Review>> GetByDoctorIdAsync(int doctorId)
        {
            return await _dbContext.Reviews
                .Include(r => r.Patient)
                    .ThenInclude(p => p.Person)
                .AsNoTracking()
                .Where(r => r.DoctorId == doctorId)
                .ToListAsync();
        }

        public async Task<double> GetAverageRatingAsync(int doctorId)
        {
            var reviews = await _dbContext.Reviews
                .AsNoTracking()
                .Where(r => r.DoctorId == doctorId)
                .ToListAsync();

            if (!reviews.Any()) return 0;
            return reviews.Average(r => r.Rating);
        }
    }
}
