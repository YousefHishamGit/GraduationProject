using DataAccessLayer.Data;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Implementation
{
    public class PrescriptionRepository : GenericRepository<Prescription>, IPrescriptionRepository
    {
        private readonly MedicalTriageDbContext _dbContext;

        public PrescriptionRepository(MedicalTriageDbContext context) : base(context)
        {
            _dbContext = context;
        }

        public async Task<IEnumerable<Prescription>> GetByMedicalRecordIdAsync(int medicalRecordId)
        {
            return await _dbContext.Prescriptions
                .AsNoTracking()
                .Where(p => p.MedicalRecordId == medicalRecordId)
                .ToListAsync();
        }
    }
}

