using DataAccessLayer.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface IPrescriptionRepository
    {
        Task<Prescription?> GetByIdAsync(int id);
        Task<Prescription?> GetTrackedByIdAsync(int id);
        Task<IEnumerable<Prescription>> GetByMedicalRecordIdAsync(int medicalRecordId);
        Task AddAsync(Prescription entity);
        void Update(Prescription entity);
        void Delete(Prescription entity);
    }
}

