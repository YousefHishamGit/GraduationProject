using DataAccessLayer.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface IPrescriptionRepository : IGenericRepository<Prescription>
    {
        Task<IEnumerable<Prescription>> GetByMedicalRecordIdAsync(int medicalRecordId);
    }
}

