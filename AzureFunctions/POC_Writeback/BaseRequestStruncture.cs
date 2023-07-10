using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace POC_Writeback
{
    public class BaseRequestStruncture
    {
        public string ConnectionString { get; set; }
        public string TableName { get; set; }
        public string TableSchema { get; set; }
    }
}
