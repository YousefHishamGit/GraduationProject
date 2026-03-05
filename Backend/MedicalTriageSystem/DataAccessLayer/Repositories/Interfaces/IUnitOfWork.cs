using DataAccessLayer.Entities.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface IUnitOfWork
    {
        IGenericRepository<TEntity> GetRepository<TEntity>() where TEntity : BaseEntity, new();
        IDoctorRepository Doctors { get; }
        IReceptionistRepository Receptionists { get; }
        IPersonRepository Persons { get; }
        IAppointmentRepository Appointments { get; }
        IMedicalRecordRepository MedicalRecords { get; }
        IPrescriptionRepository Prescriptions { get; }
        IDepartmentRepository Departments { get; }
        ILabRequestRepository LabRequests { get; }
        IReviewRepository Reviews { get; }

        Task<int> SaveChangesAsync();
    }
}
