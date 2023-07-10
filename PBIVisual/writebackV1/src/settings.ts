"use strict";

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
export class WriteBackSettings {
    public ConnectionString: string = "";
    public TableName: string = "POCWriteback";
    public TableSchema: string = "dbo";
    public KeyColumn: string = "";
    public IsBatchEdit:boolean=false;
    
}
export class VisualSettings extends dataViewObjectsParser.DataViewObjectsParser {
    public WriteBack: WriteBackSettings = new WriteBackSettings();
}