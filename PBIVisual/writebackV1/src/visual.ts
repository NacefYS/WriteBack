
"use strict";

import fetch from "node-fetch";
// import {Grid,GridAppearance,GridEditing,GridColumn} from "smart-webcomponents/source/typescript/smart.elements"
// import {DataAdapter} from "smart-webcomponents/source/typescript/smart.dataadapter"
import { GridColDef } from '@mui/x-data-grid';
import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";

import "./../style/visual.less";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReactGrid, initialState } from "./component";
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import FilterAction = powerbi.FilterAction;

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import { VisualSettings } from "./settings";
import { easeExpInOut, text, window } from "d3";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
declare global {
	export interface Window {
		generateData: any	
	}
}
export class Visual implements IVisual {
    private target: HTMLElement;
    private visualSettings: VisualSettings;
    private ColumnsDefinition: InputDefinition[];
    private visualHost: IVisualHost;
    private filters: DataFilter[];
    private reactRoot: React.ComponentElement<any, any>;

    constructor(options: VisualConstructorOptions) {

        this.target = options.element;
        this.visualHost = options.host;
        this.reactRoot = React.createElement(ReactGrid, {});
        ReactDOM.render(this.reactRoot, this.target);
    }
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        const settings: VisualSettings = this.visualSettings || <VisualSettings>VisualSettings.getDefault();
        return VisualSettings.enumerateObjectInstances(settings, options);
    }
    
    public async update(options: VisualUpdateOptions) {
        
        
        var tb = options.dataViews[0];
        this.visualSettings = VisualSettings.parse<VisualSettings>(tb);
        console.log(tb);
        this.GetFilters(tb);
        
       await this.getDataStructure();
        if (this.visualSettings.WriteBack.IsBatchEdit) {
            await this.generateGrid();   
        }
        else {
            this.generateForm();
        }
    }
    public GetFilters(tb:powerbi.DataView){
        this.filters=new Array ();
        tb.categorical.categories.forEach(element => {
            var f:DataFilter=new DataFilter();
            var myFormatter =valueFormatter.create({format: element.source.format});
            f.fieldName=element.source.displayName;
            f.values=new Array();
            element.values.forEach(v => {
                
                f.values.push( myFormatter.format(v).toString());
            });
            this.filters.push(f);
        });
    }
    public async getDataStructure() {
        const response = await fetch('https://af-pocwb.azurewebsites.net/api/GetSQLTableStructure?code=oC1X-WeD-OneZdUjnKUhNxpNYjsUvB-ftMOrj0umuPuCAzFuk4Syhg==', {
            method: 'POST',

            body: JSON.stringify({
                ConnectionString: this.visualSettings.WriteBack.ConnectionString,
                TableName: this.visualSettings.WriteBack.TableName,
                TableSchema: this.visualSettings.WriteBack.TableSchema
            }),
            headers: {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*'

            }
        });
        const data = await response.json();
        this.ColumnsDefinition = new Array();

        data.forEach(element => {
            var idef = new InputDefinition();
            idef.label = element.ColumnName;
            switch (element.DataType) {
                case "bigint":
                    idef.dataType = "number";
                    break;
                case "decimal":
                    idef.dataType = "number";
                    break;
                case "float":
                    idef.dataType = "number";
                    break;
                case "int":
                    idef.dataType = "number";
                    break;
                case "smallint":
                    idef.dataType = "number";
                    break;
                case "tinyint":
                    idef.dataType = "number";
                    break;
                case "nvarchar":
                    idef.dataType = "string";
                    break;
                case "varchar":
                    idef.dataType = "string";
                    break;
                case "uniqueidentifier":
                    idef.dataType = "string";
                    break;
                case "text":
                    idef.dataType = "string";
                    break;
                case "datetime":
                    idef.dataType = "datetime-local";
                    break;
                case "datetime2":
                    idef.dataType = "datetime-local";
                    break;
                case "date":
                    idef.dataType = "date";
                    break;
                default:
                    idef.dataType = "string";
                    break;

            }
            
            this.ColumnsDefinition.push(idef);
        });
    }
    public async generateGrid(){
       try{
        var tbl:HTMLElement =document.getElementById("formDiv");
       tbl.style.visibility="hidden";
       }catch{}
        const response = await fetch('https://af-pocwb.azurewebsites.net/api/GetDataFromTable?code=Qq6utcvTsONhexXvjt4c28V8IlGUNcqKP4qceE6Zg8MEAzFu7YwYJQ==', {
            method: 'POST',
            body: JSON.stringify({
                ConnectionString: this.visualSettings.WriteBack.ConnectionString,
                TableName: this.visualSettings.WriteBack.TableName,
                TableSchema: this.visualSettings.WriteBack.TableSchema,
                Filters:this.filters
            }),
            headers: {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*'

            }
        });
        var gcs:GridColDef[]=new Array();
        this.ColumnsDefinition.forEach(element => {
            gcs.push( {field:element.label,headerName:element.label,editable:true})
        });
        
        const data = await response.json();
        const cd=this.ColumnsDefinition;
        
        ReactGrid.update({
            ColumnsDef :gcs,
            data:data,
            InputDef:cd,
            RowId:this.visualSettings.WriteBack.KeyColumn,
            Visible:true,
            ConnectionString:this.visualSettings.WriteBack.ConnectionString,
            TableName:this.visualSettings.WriteBack.TableName,
            TableSchema:this.visualSettings.WriteBack.TableSchema
        })
       
    }
    public generateForm(){
        try{
            var rm:HTMLElement=document.getElementById("formDiv");
            this.target.removeChild(rm);
        }catch{}
        
        ReactGrid.update(initialState);
        var dv:HTMLDivElement =document.createElement("div");
        dv.id="formDiv"
        var tbl: HTMLTableElement = document.createElement("table");
        tbl.id="WBForm";
        var tblheader: HTMLTableSectionElement = tbl.createTHead();
        var tblBody: HTMLTableSectionElement = tbl.createTBody();

        this.ColumnsDefinition.forEach(element => {

            var brow = tblBody.insertRow()
            var lblCell = brow.insertCell();

            var lbl: HTMLLabelElement = document.createElement("label");
            lbl.textContent = element.label;
            lblCell.appendChild(lbl);
            var lblInput = brow.insertCell();
            var input: HTMLInputElement = document.createElement("input");
            
            input.type = element.dataType == "string" ? "text" : element.dataType;
            input.placeholder = element.label;
            input.name = element.label;
            var defvalue="";
            try{defvalue=this.filters.filter(f=>f.fieldName=element.label)[0].values[0];}catch{}
            if(defvalue.length>0){
                input.value=defvalue;
                
            }
            
            lblInput.appendChild(input);

        });
        var btnSubmit: HTMLButtonElement = document.createElement("button");
        btnSubmit.textContent = "Save";
        btnSubmit.onclick = async () => {
            var datasubmits: DataSubmit[] = new Array();
            Array.from(this.target.getElementsByTagName("input")).forEach((input) => {
                var ds = new DataSubmit();
                ds.ColumnName = input.name;
                ds.Value = input.value;
                datasubmits.push(ds);
            });
           
            const response = await fetch('https://af-pocwb.azurewebsites.net/api/ParseNewData?code=sR4zeRc7EmkPV8aRWc9ARxGEEC22RyaJ8fBgkDUtBKfZAzFuxCN71g==', {
                method: 'POST',
                body: JSON.stringify({
                    ConnectionString: this.visualSettings.WriteBack.ConnectionString,
                    TableName: this.visualSettings.WriteBack.TableName,
                    TableSchema: this.visualSettings.WriteBack.TableSchema,
                    data: datasubmits
                }),
                headers: {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin': '*'
                }
            });
            this.visualHost.applyJsonFilter(null,"general","filter",FilterAction.remove);
            
        };
        dv.appendChild(tbl);
        dv.appendChild(btnSubmit);
        this.target.appendChild(dv);
    }

}
class DataSubmit {
    public ColumnName: string;
    public Value: string;
}
class InputDefinition {
    public label: string;
    public dataType: string;
}
class DataFilter{
    public fieldName:string;
    public values:string[];
}
