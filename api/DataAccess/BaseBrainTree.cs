using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Braintree;
using ByzmoApi.Helpers;

namespace ByzmoApi.DataAccess
{
    public class BaseBrainTree
    {
        #region Properties
        /// <summary>
        /// List of properties for server service
        /// </summary>
        protected readonly BraintreeGateway _braintreeGateway;

        #endregion

        #region Constructor
        /// <summary>
        /// Server service base constructor
        /// </summary>
        /// <param name="npgSqlServerRepository"></param>
        public BaseBrainTree(IAppSettings appSettings)
        {
            this._braintreeGateway = new BraintreeGateway
            {
                Environment = Braintree.Environment.SANDBOX,
                MerchantId = appSettings.SandBoxMerchantId,
                PublicKey = appSettings.SandBoxPublicKey,
                PrivateKey = appSettings.SandBoxPrivateKey
            };
        }
        #endregion
    }

}

