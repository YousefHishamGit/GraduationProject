using AutoMapper;
using BusinessLogicLayer.DTOs.Notification;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implementation
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public NotificationService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<NotificationResponseDto>> GetByPatientIdAsync(int patientId)
        {
            var repo = _unitOfWork.GetRepository<Notification>();
            var notifications = await repo.GetAllAsync(n => n.PatientId == patientId);
            return _mapper.Map<IEnumerable<NotificationResponseDto>>(notifications.OrderByDescending(n => n.CreatedOn));
        }

        public async Task<int> GetUnreadCountAsync(int patientId)
        {
            var repo = _unitOfWork.GetRepository<Notification>();
            var notifications = await repo.GetAllAsync(n => n.PatientId == patientId && !n.IsRead);
            return notifications.Count();
        }

        public async Task<bool> MarkAsReadAsync(int id)
        {
            var repo = _unitOfWork.GetRepository<Notification>();
            var notif = await repo.GetByIdAsync(id);
            if (notif == null) return false;

            notif.IsRead = true;
            notif.ModifiedOn = DateTime.UtcNow;
            notif.ModifiedBy = "system";

            repo.Update(notif);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(int patientId)
        {
            var repo = _unitOfWork.GetRepository<Notification>();
            var unread = await repo.GetAllAsync(n => n.PatientId == patientId && !n.IsRead);
            if (!unread.Any()) return true;

            foreach (var notif in unread)
            {
                notif.IsRead = true;
                notif.ModifiedOn = DateTime.UtcNow;
                notif.ModifiedBy = "system";
                repo.Update(notif);
            }

            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var repo = _unitOfWork.GetRepository<Notification>();
            var notif = await repo.GetByIdAsync(id);
            if (notif == null) return false;

            repo.Delete(notif);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ClearAllAsync(int patientId)
        {
            var repo = _unitOfWork.GetRepository<Notification>();
            var all = await repo.GetAllAsync(n => n.PatientId == patientId);
            if (!all.Any()) return true;

            foreach (var notif in all)
            {
                repo.Delete(notif);
            }

            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
