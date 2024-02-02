using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Threading.Tasks;
using ByzmoApi.DataAccess;
using ByzmoApi.DataAccess.Common;
using ByzmoApi.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.FileProviders;
using ByzmoApi.DataAccess.Applcation;

namespace ByzmoApi
{
    public class Startup
    {
        private readonly IAppSettings _appSettings;
        private readonly IConnectionStrings _connectionString;
        readonly string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
        private readonly string filePaths = Path.Combine(Directory.GetCurrentDirectory(), "file");
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
            // Getting app settings from appsettings.json
            var appSettingsSection = Configuration.GetSection("AppSettings");
            var connectionStringSection = Configuration.GetSection("ConnectionStrings");

            _appSettings = appSettingsSection.Get<AppSettings>();
            _connectionString = connectionStringSection.Get<ConnectionStrings>();
        }

        public IConfiguration Configuration { get; }
        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);

            services.AddSingleton<IAppSettings>(_appSettings);
            services.AddSingleton<INpgSqlServerRepository, NpgSqlServerRepository>(serviceProvider =>
            {
                return new NpgSqlServerRepository(_connectionString.ByzmoConnection);
            });

            services.AddCors(options =>
            {
                options.AddPolicy(MyAllowSpecificOrigins,
                builder =>
                {
                    builder.WithOrigins(_appSettings.AllowedOrigins)
                            .AllowAnyHeader()
                            .AllowAnyMethod();
                });
            });

            services.AddMvc().AddJsonOptions(options =>
            {
                // Ignore null json properties and set model primitive properties to default value.
                options.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
            });

            if (!Directory.Exists(filePaths))
            {
                Directory.CreateDirectory(filePaths);
            }

            services.AddDataProtection()
                .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(Directory.GetCurrentDirectory(), "file")));
            // .ProtectKeysWithDpapi();

            //configure jwt authentication
            var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(x =>
            {
                x.RequireHttpsMetadata = false;
                x.SaveToken = true;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                };
            }).AddGoogle(options =>
            {
                options.ClientId = "XXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com";
                options.ClientSecret = "XXXXXXXXXXXXXXXXXXXXX";
            });
            AddServices(services);
        }
        private static void AddServices(IServiceCollection services)
        {
            // Dependency injection for application services
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IResetTokenService, ResetTokenService>();
            services.AddScoped<IFileService, FileService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<ILandingService, LandingService>();
            services.AddScoped<IBlogService, BlogService>();
            services.AddScoped<ICartService, CartService>();
            services.AddScoped<IShippingService, ShippingService>();
            services.AddScoped<IPaymentService, PaymentService>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<ILoyaltyService, LoyaltyService>();
            services.AddScoped<IBrainTreeService, BrainTreeService>();
            services.AddScoped<IReportService, ReportService>();
            services.AddScoped<IDashboardService, DashboardService>();
            services.AddScoped<IPaymongoService, PaymongoService>();
            services.AddScoped<ICurrencyService, CurrencyService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            // Cors policy
            app.UseCors(MyAllowSpecificOrigins);

            app.UseHttpsRedirection();

            app.UseAuthentication();

            app.UseStaticFiles(); // for wwwroot folder

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(filePaths),
                RequestPath = "/file"
            });

            app.UseMvc();
        }
    }
}
