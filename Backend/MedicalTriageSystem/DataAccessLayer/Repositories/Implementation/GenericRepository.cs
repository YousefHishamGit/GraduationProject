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
    
        public class GenericRepository<TEntity> : IGenericRepository<TEntity> where TEntity : BaseEntity, new()
        {
            private readonly MedicalTriageDbContext _dbContext;

            public GenericRepository(MedicalTriageDbContext context)
            {
                _dbContext = context;
            }

            public async Task<IEnumerable<TEntity>> GetAllAsync(Func<TEntity, bool>? condition = null)
            {
                if (condition is null)
                    return await _dbContext.Set<TEntity>().AsNoTracking().ToListAsync();

                return await Task.FromResult(
                    _dbContext.Set<TEntity>().AsNoTracking().Where(condition).ToList());
            }

            public async Task<TEntity?> GetByIdAsync(int id)
            {
                return await _dbContext.Set<TEntity>().FindAsync(id);
            }

            public async Task AddAsync(TEntity entity)
            {
                await _dbContext.Set<TEntity>().AddAsync(entity);
            }

            public void Update(TEntity entity)
            {
                _dbContext.Set<TEntity>().Update(entity);
            }

            public void Delete(TEntity entity)
            {
                _dbContext.Set<TEntity>().Remove(entity);
            }
        }
}
