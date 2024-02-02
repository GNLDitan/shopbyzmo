using System;
using System.Net;
using System.Threading.Tasks;
using ByzmoApi.Helpers;
using ByzmoApi.Models;
using System.Collections.Generic;
using Npgsql;

namespace ByzmoApi.DataAccess.Common
{
    public interface ILandingService
    {
        IEnumerable<FileMapper> GetLandingImages();
        Task<IEnumerable<FileMapper>> GetLandingImagesAsync();
        Task<bool> MoveOrderIdAsync(int id, int orderId, int moveTypeId);
        bool MoveOrderId(int id, int orderId, int moveTypeId);
        Task<FileMapper> CreateLandingImageAsync(FileMapper landing);
        FileMapper CreateLandingImage(FileMapper landing);
        Task<FileMapper> GetLandingImageByIdAsync(int id);
        FileMapper GetLandingImageById(int id);
        Task<FileMapper> UpdateLandingImageAsync(FileMapper landing);
        FileMapper UpdateLandingImage(FileMapper landing);
        Task<bool> DeleteLandingImageByIdAsync(int id);
        bool DeleteLandingImageById(int id);
    }
    public class LandingService : BaseNpgSqlServerService, ILandingService
    {
        public LandingService(INpgSqlServerRepository npgSqlServerRepository, IAppSettings appSettings) : base(npgSqlServerRepository, appSettings)
        {

        }

        public IEnumerable<FileMapper> GetLandingImages()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<FileMapper>("application.getlandingimages");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<FileMapper>> GetLandingImagesAsync()
        {
            return await Task.Run(() => GetLandingImages());
        }

        public async Task<bool> MoveOrderIdAsync(int id, int orderId, int moveTypeId)
        {
            return await Task.Run(() => MoveOrderId(id, orderId, moveTypeId));
        }
        public bool MoveOrderId(int id, int orderId, int moveTypeId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("application.movelandingorderid", new
                {
                    p_id = id,
                    p_orderid = orderId,
                    p_movetypeid = moveTypeId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<FileMapper> CreateLandingImageAsync(FileMapper landing)
        {
            return await Task.Run(() => CreateLandingImage(landing));
        }
        public FileMapper CreateLandingImage(FileMapper landing)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<FileMapper>("application.createlandingimage", new
                {
                    p_filestorageid = landing.Key,
                    p_filename = landing.FileName,
                    p_url = landing.Url,
                    p_isnewtab = landing.IsNewTab
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<FileMapper> GetLandingImageByIdAsync(int id)
        {
            return await Task.Run(() => GetLandingImageById(id));
        }
        public FileMapper GetLandingImageById(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<FileMapper>("application.getlandingimagebyid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<FileMapper> UpdateLandingImageAsync(FileMapper landing)
        {
            return await Task.Run(() => UpdateLandingImage(landing));
        }
        public FileMapper UpdateLandingImage(FileMapper landing)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<FileMapper>("application.updatelandingimage", new
                {
                    p_id = landing.Id,
                    p_filestorageid = landing.Key,
                    p_filename = landing.FileName,
                    p_url = landing.Url,
                    p_isnewtab = landing.IsNewTab
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<bool> DeleteLandingImageByIdAsync(int id)
        {
            return await Task.Run(() => DeleteLandingImageById(id));
        }
        public bool DeleteLandingImageById(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("application.deletelandingimagebyid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
    }
}
