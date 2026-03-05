using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Review
{
    public class UpdateReviewDto
    {
        [Range(1, 5)] public int? Rating { get; set; }
        public string? Comment { get; set; }
    }
}
