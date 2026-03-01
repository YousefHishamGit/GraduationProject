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
    public class DepartmentRepository : GenericRepository<Department>, IDepartmentRepository
    {
        private readonly MedicalTriageDbContext _dbContext;

        public DepartmentRepository(MedicalTriageDbContext context) : base(context)
        {
            _dbContext = context;
        }

        public async Task<IEnumerable<Department>> GetAllActiveAsync()
        {
            return await _dbContext.Departments
                .AsNoTracking()
                .Where(d => !d.IsDeleted)
                .ToListAsync();
        }

        public async Task<Department?> GetWithDoctorsAsync(int id)
        {
            return await _dbContext.Departments
                .Include(d => d.Doctors)
                    .ThenInclude(doc => doc.Person)
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);
        }
    }
}
