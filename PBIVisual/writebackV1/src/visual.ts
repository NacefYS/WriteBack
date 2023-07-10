
"use strict";

import fetch from "node-fetch";
import { Grid } from "@smarthtmlelements/smart-elements/typescript/smart.elements"
import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;


import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import { VisualSettings } from "./settings";
import { text } from "d3";

export class Visual implements IVisual {
    private target: HTMLElement;
    private visualSettings: VisualSettings;
    private ColumnsDefinition: InputDefinition[];



    constructor(options: VisualConstructorOptions) {

        this.target = options.element;

    }
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        const settings: VisualSettings = this.visualSettings || <VisualSettings>VisualSettings.getDefault();
        return VisualSettings.enumerateObjectInstances(settings, options);
    }
    
    public async update(options: VisualUpdateOptions) {
        var tb = options.dataViews[0];
        this.visualSettings = VisualSettings.parse<VisualSettings>(tb);
        while (this.target.firstChild) {
            this.target.removeChild(this.target.lastChild);
        }
       await this.getDataStructure();
        if (this.visualSettings.WriteBack.IsBatchEdit) {

        }
        else {
            this.generateForm();
        }
        
        

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
    public generateGrid(){
        
    }
    public generateForm(){
        var tbl: HTMLTableElement = document.createElement("table");
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
            console.log(datasubmits);
            console.log(JSON.stringify(datasubmits));
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
            console.log(response);
        };
        this.target.appendChild(tbl);
        this.target.appendChild(btnSubmit);
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