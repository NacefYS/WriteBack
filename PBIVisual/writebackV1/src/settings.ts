"use strict";

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
export class WriteBackSettings {
    public ConnectionString: string = "Data Source=yellowsys.database.windows.net;Initial Catalog=yellowsys;User ID=adminsql;Password=tanit*2013";
    public TableName: string = "POCWriteback";
    public TableSchema: string = "dbo";
    public KeyColumn: string = "";
    public IsBatchEdit:boolean=false;
    
}
export class VisualSettings extends dataViewObjectsParser.DataViewObjectsParser {
    public WriteBack: WriteBackSettings = new WriteBackSettings();
}