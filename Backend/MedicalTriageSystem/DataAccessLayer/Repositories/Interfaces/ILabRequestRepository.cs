using DataAccessLayer.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface ILabRequestRepository : IGenericRepository<LabRequest>
    {
        Task<IEnumerable<LabRequest>> GetByMedicalRecordIdAsync(int medicalRecordId);
        Task<IEnumerable<LabRequest>> GetByPatientIdAsync(int patientId);
    }

}
