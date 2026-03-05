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
    public class LabRequestRepository : GenericRepository<LabRequest>, ILabRequestRepository
    {
        private readonly MedicalTriageDbContext _dbContext;

        public LabRequestRepository(MedicalTriageDbContext context) : base(context)
        {
            _dbContext = context;
        }

        public async Task<IEnumerable<LabRequest>> GetByMedicalRecordIdAsync(int medicalRecordId)
        {
            return await _dbContext.LabRequests
                .AsNoTracking()
                .Where(l => l.MedicalRecordId == medicalRecordId)
                .ToListAsync();
        }

        public async Task<IEnumerable<LabRequest>> GetByPatientIdAsync(int patientId)
        {
            return await _dbContext.LabRequests
                .Include(l => l.MedicalRecord)
                .AsNoTracking()
                .Where(l => l.MedicalRecord.PatientId == patientId)
                .ToListAsync();
        }
    }
}
