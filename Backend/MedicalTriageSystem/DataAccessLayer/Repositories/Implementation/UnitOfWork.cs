using DataAccessLayer.Data;
using DataAccessLayer.Entities.Base;
using DataAccessLayer.Repositories.Interfaces;
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

        public UnitOfWork(MedicalTriageDbContext dbContext)
        {
            _dbContext = dbContext;
            _repositories = new Dictionary<Type, object>();
            Doctors = new DoctorRepository(_dbContext);
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
