using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using System.Data.SqlClient;

namespace POC_Writeback
{
    public static class UpdateRecord
    {
        [FunctionName("UpdateRecord")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            try
            {
                string requestBody =  await new StreamReader(req.Body).ReadToEndAsync();
                UpdateRecordRequest request = JsonConvert.DeserializeObject<UpdateRecordRequest>(requestBody);
                
                string wherePart = String.Join(" and ", request.data.OriginalRow.Where(w=>w.Key!= "wbidGen")
                    .Select(r => $"[{r.Key}]" + (Convert.ToString(r.Value) == "null" ? "is null" : "='" + r.Value + "'")));
                string setPart = String.Join(Environment.NewLine+",", request.data.UpdatedRow.Where(w => w.Key != "wbidGen")
                    .Select(r => $"[{r.Key}]" + (Convert.ToString(r.Value) == "null" ? "=null" : "='" + r.Value + "'")));
                string updateStatement = $"UPDATE {request.TableSchema}.{request.TableName} SET {Environment.NewLine} {setPart} WHERE {wherePart}";
                Console.WriteLine(updateStatement);
                SqlConnection conn = new SqlConnection(request.ConnectionString);
                conn.Open();
                SqlCommand command = new SqlCommand(updateStatement, conn);
                command.ExecuteNonQuery();
                string responseMessage = "Row updated!";

                return new OkObjectResult(responseMessage);
            }
            catch (Exception e)
            {
                return new BadRequestObjectResult(e.Message);
            }
        }
    }
    class UpdateRecordRequest : BaseRequestStruncture
    {
        public RowUpdate data { get; set; }
    }
    class RowUpdate
    {
        public Dictionary<string,dynamic> UpdatedRow { get; set; }
        public Dictionary<string, dynamic> OriginalRow { get; set; }
    }
}
