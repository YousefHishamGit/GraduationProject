using DataAccessLayer.Data;
using DataAccessLayer.Entities.Base;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Implementation
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly MedicalTriageDbContext _dbContext;
        private Dictionary<Type, object> _repositories;

        public IDoctorRepository Doctors { get; private set; }
        public IReceptionistRepository Receptionists { get; private set; }
        public IPersonRepository Persons { get; private set; }
        public IAppointmentRepository Appointments { get; private set; }
        public IMedicalRecordRepository MedicalRecords { get; private set; }
        public IPrescriptionRepository Prescriptions { get; private set; }

        public IDepartmentRepository Departments { get; private set; }
        public ILabRequestRepository LabRequests { get; private set; }
        public IReviewRepository Reviews { get; private set; }
        public IAdminRepository Admin { get; private set; }

        public UnitOfWork(MedicalTriageDbContext dbContext)
        {
            _dbContext = dbContext;
            _repositories = new Dictionary<Type, object>();
            Doctors = new DoctorRepository(_dbContext);
            Receptionists = new ReceptionistRepository(_dbContext);
            Persons = new PersonRepository(_dbContext);
            Appointments = new AppointmentRepository(_dbContext);
            MedicalRecords = new MedicalRecordRepository(_dbContext);
            Prescriptions = new PrescriptionRepository(_dbContext);
            Departments = new DepartmentRepository(_dbContext);
            LabRequests = new LabRequestRepository(_dbContext);
            Reviews = new ReviewRepository(_dbContext);
            Admin = new AdminRepository(_dbContext);
        }

        public IGenericRepository<TEntity> GetRepository<TEntity>() where TEntity : BaseEntity, new()
        {
            if (_repositories.ContainsKey(typeof(TEntity)))
                return (IGenericRepository<TEntity>)_repositories[typeof(TEntity)];

            var repository = new GenericRepository<TEntity>(_dbContext);
            _repositories.Add(typeof(TEntity), repository);
            return repository;
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _dbContext.SaveChangesAsync();
        }
    }
}
