using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Data.SqlClient;

namespace POC_Writeback
{
    public static class GetDataFromTable
    {
        [FunctionName("GetDataFromTable")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");



            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            BaseRequestStruncture data = JsonConvert.DeserializeObject<BaseRequestStruncture>(requestBody);

            SqlConnection conn = new SqlConnection(data.ConnectionString);
            conn.Open();
            string query = $"select top 100000 * ,ROW_NUMBER ()over(order by (select null )) id from {data.TableSchema}.{data.TableName} for json path";
            SqlCommand command = new SqlCommand(query, conn);
            SqlDataReader reader = command.ExecuteReader();
            string resp = "";
            while (reader.Read())
            {
                
                resp= reader.GetString(0);
                
            }
            reader.Close();
            command.Dispose();
            conn.Close();


            

            return new OkObjectResult(resp);
        }
    }
}
