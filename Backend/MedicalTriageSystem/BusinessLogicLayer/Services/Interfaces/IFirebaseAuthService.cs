using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IFirebaseAuthService
    {
        /// <summary>
        /// verifies Firebase ID Token and returns the verified phone number if valid, or null.
        /// </summary>
        Task<string?> VerifyIdTokenAsync(string idToken);
    }
}
