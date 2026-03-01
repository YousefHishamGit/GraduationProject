using DataAccessLayer.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface IMedicalRecordRepository : IGenericRepository<MedicalRecord>
    {
        Task<MedicalRecord?> GetByIdWithDetailsAsync(int id);
        Task<MedicalRecord?> GetByAppointmentIdAsync(int appointmentId);
        Task<IEnumerable<MedicalRecord>> GetByPatientIdAsync(int patientId);
    }
}

