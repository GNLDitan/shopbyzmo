using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string MobileNumber { get; set; }
        public string Password { get; set; }
        public string ResetToken { get; set; }
        public bool IsAdmin { get; set; }
        public bool IsActive { get; set; }
        public bool IsSocialMediaLogin { get; set; }
        public string IpAddress { get; set; }
        // For password manipulation
        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }
        public IEnumerable<UserAddress> Addresses { get; set; }
    }

}