using DataAccessLayer.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Person
{
    public class UpdatePersonDto
    {
      
        public string? Address { get; set; }
        public string? Phone { get; set; }
        
    }
}
