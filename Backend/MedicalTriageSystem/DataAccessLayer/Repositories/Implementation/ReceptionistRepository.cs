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
    public class ReceptionistRepository : GenericRepository<Receptionist>, IReceptionistRepository
    {
        private readonly MedicalTriageDbContext _dbContext;

        public ReceptionistRepository(MedicalTriageDbContext context) : base(context)
        {
            _dbContext = context;
        }

        public async Task<Receptionist?> GetReceptionistWithDetailsAsync(int id)
        {
            return await _dbContext.Receptionists
                .Include(r => r.Person)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Receptionist>> GetAllWithDetailsAsync()
        {
            return await _dbContext.Receptionists
                .Include(r => r.Person)
                .Include(r => r.User)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
