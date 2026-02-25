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
    public class PersonRepository : GenericRepository<Person>, IPersonRepository
    {
        private readonly MedicalTriageDbContext _dbContext;

        public PersonRepository(MedicalTriageDbContext context) : base(context)
        {
            _dbContext = context;
        }

        public async Task<Person?> GetPersonWithDetailsAsync(int id)
        {
            return await _dbContext.Persons
                .Include(p => p.Doctor)
                .Include(p => p.Patient)
                .Include(p => p.Receptionist)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
    }
}
