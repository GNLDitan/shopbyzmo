using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using ByzmoApi.Helpers;

namespace ByzmoApi.DataAccess
{
    public class BaseNpgSqlServerService
    {
        #region Properties
        /// <summary>
        /// List of properties for server service
        /// </summary>
        protected readonly INpgSqlServerRepository _npgSqlServerRepository;
        protected readonly IAppSettings _appSettings;
        #endregion

        #region Constructor
        /// <summary>
        /// Server service base constructor
        /// </summary>
        /// <param name="npgSqlServerRepository"></param>
        public BaseNpgSqlServerService(INpgSqlServerRepository npgSqlServerRepository,
            IAppSettings appSettings)
        {
            if (npgSqlServerRepository == null) throw new ArgumentNullException("npgsqlServerRepository");

            _npgSqlServerRepository = npgSqlServerRepository;
            _appSettings = appSettings;
        }
        #endregion
    }

}