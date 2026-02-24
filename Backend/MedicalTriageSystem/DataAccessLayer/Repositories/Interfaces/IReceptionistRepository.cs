using DataAccessLayer.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface IReceptionistRepository : IGenericRepository<Receptionist>
    {
        Task<Receptionist?> GetReceptionistWithDetailsAsync(int id);
        Task<IEnumerable<Receptionist>> GetAllWithDetailsAsync();
    }
}

