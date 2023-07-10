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
using System.Data.SqlClient;
using System.Linq;
namespace POC_Writeback
{
    public static class ParseNewData
    {
        [FunctionName("ParseNewData")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function,  "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            try
            {
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                ParseDataRequestStructure request = JsonConvert.DeserializeObject<ParseDataRequestStructure>(requestBody);

                SqlConnection conn = new SqlConnection(request.ConnectionString);
                conn.Open();
                string query = $"insert into {request.TableSchema}.{request.TableName} (";
                query = query + string.Join(',', request.data.Select(d => $"[{d.ColumnName}]"))+") Values ";
                query = query + "(" + string.Join(',', request.data.Select(d => $"'{d.Value}'")) + ")";
                SqlCommand command = new SqlCommand(query, conn);
                command.ExecuteNonQuery();
                string responseMessage = "Row Inserted!";

                return new OkObjectResult(responseMessage);
            }
            catch (Exception e )
            {
                return new BadRequestObjectResult(e.Message);
            }
        }

    }
    public class ParseDataRequestStructure:BaseRequestStruncture
    {
        public List<DataSubmit> data { get; set; }

    }
    public class DataSubmit
    {
        public string ColumnName { get; set; }
        public string Value { get; set; }
    }
}
