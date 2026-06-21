using BusinessLogicLayer.Services.Interfaces;
using FirebaseAdmin.Auth;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implementation
{
    public class FirebaseService : IFirebaseAuthService
    {
        private readonly ILogger<FirebaseService> _logger;

        public FirebaseService(ILogger<FirebaseService> logger)
        {
            _logger = logger;
        }

        public async Task<string?> VerifyIdTokenAsync(string idToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(idToken))
                {
                    _logger.LogWarning("Verification requested with an empty token.");
                    return null;
                }

                // Verify the ID token using Firebase Admin SDK
                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
                
                // Retrieve the verified phone number from the token claims
                decodedToken.Claims.TryGetValue("phone_number", out var phoneNumberObj);
                string? phoneNumber = phoneNumberObj?.ToString();

                _logger.LogInformation("Firebase ID Token verified successfully for phone number: {Phone}", phoneNumber);
                return phoneNumber;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception verification Firebase token: {Message}", ex.Message);
                return null;
            }
        }
    }
}
