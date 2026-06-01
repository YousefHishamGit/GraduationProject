using BusinessLogicLayer.DTOs.Notification;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface INotificationService
    {
        Task<IEnumerable<NotificationResponseDto>> GetByPatientIdAsync(int patientId);
        Task<int> GetUnreadCountAsync(int patientId);
        Task<bool> MarkAsReadAsync(int id);
        Task<bool> MarkAllAsReadAsync(int patientId);
        Task<bool> DeleteAsync(int id);
        Task<bool> ClearAllAsync(int patientId);
    }
}
