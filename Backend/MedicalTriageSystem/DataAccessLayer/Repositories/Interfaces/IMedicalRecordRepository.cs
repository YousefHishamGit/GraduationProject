using DataAccessLayer.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface IMedicalRecordRepository
    {
        Task<MedicalRecord?> GetByIdAsync(int id);
        Task<MedicalRecord?> GetTrackedByIdAsync(int id);
        Task<MedicalRecord?> GetByAppointmentIdAsync(int appointmentId);
        Task<IEnumerable<MedicalRecord>> GetByPatientIdAsync(int patientId);
        Task AddAsync(MedicalRecord entity);
        void Update(MedicalRecord entity);
    }
}

