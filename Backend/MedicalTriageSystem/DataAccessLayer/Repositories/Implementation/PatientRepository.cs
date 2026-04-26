using DataAccessLayer.Data;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Repositories.Implementation
{
    public class PatientRepository : GenericRepository<Patient>, IPatientRepository
    {
        private readonly MedicalTriageDbContext _dbContext;

        public PatientRepository(MedicalTriageDbContext context) : base(context)
        {
            _dbContext = context;
        }

        public async Task<Patient?> GetPatientWithPersonAsync(int id)
        {
            return await _dbContext.Patients
                .Include(p => p.Person)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
        public async Task<Patient?> GetByUserIdAsync(string userId)
        {
            return await _dbContext.Patients
                .Include(p => p.Person)
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);
        }

        public async Task<IEnumerable<Patient>> GetAllWithPersonAsync()
        {
            return await _dbContext.Patients
                .Include(p => p.Person)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}