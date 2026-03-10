using DataAccessLayer.Entities;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface IPatientRepository : IGenericRepository<Patient>
    {
        Task<Patient?> GetPatientWithPersonAsync(int id);
        Task<IEnumerable<Patient>> GetAllWithPersonAsync();
    }
}