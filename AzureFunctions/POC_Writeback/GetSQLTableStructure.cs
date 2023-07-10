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
using System.Collections.Generic;

namespace POC_Writeback
{
    public static class GetSQLTableStructure
    {
        [FunctionName("GetSQLTableStructure")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function,  "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            BaseRequestStruncture data = JsonConvert.DeserializeObject<BaseRequestStruncture>(requestBody);

            SqlConnection conn = new SqlConnection(data.ConnectionString);
            conn.Open();
            string query = $"select COLUMN_NAME,DATA_TYPE,CHARACTER_MAXIMUM_LENGTH from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME='{data.TableName}' and TABLE_SCHEMA='{data.TableSchema}'";
            SqlCommand command = new SqlCommand(query, conn);
            SqlDataReader reader = command.ExecuteReader();
            List<TableColumn> cols = new List<TableColumn>();
            while (reader.Read())
            {
                TableColumn col = new TableColumn();
                col.ColumnName = reader.GetString(0);
                col.DataType = reader.GetString(1);
                try { col.MaximumLength = reader.GetInt32(2); }catch (Exception) { }
                cols.Add(col);
            }
            reader.Close();
            command.Dispose();
            conn.Close();


            string responseMessage = JsonConvert.SerializeObject(cols);

            return new OkObjectResult(responseMessage) ;
        }

    }
   
    public class TableColumn
    {
        public string ColumnName { get; set; }
        public string DataType { get; set; }
        public int MaximumLength { get; set; }
    }
}
