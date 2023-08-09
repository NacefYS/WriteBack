import * as React from "react";
import {OutTable, ExcelRenderer} from 'react-excel-renderer';
//Import the primary module ExcelRenderer to convert sheet data into JSON format.
//Also import OutTable to display the obtained JSON into a HTML Table.
export interface State {
    data: any,
    ColumnsDef: GridColDef[],
    InputDef: InputDefinition[],
    RowId:string,
    Visible:boolean,
    ConnectionString:string,
    TableName:string,
    TableSchema:string


}

export const initialState: State = {
    data: new Array(),
    ColumnsDef: new Array(),
    InputDef: new Array(),
    RowId:"",
    Visible:false,
    ConnectionString:"",
    TableName:"",
    TableSchema:""

}
export class Excel extends React.Component<{}, State>{
    
    fileHandler = (event) => {
        let fileObj = event.target.files[0];
    
        //just pass the fileObj as parameter
        ExcelRenderer(fileObj, (err, resp) => {
            if(err){
            console.log(err);            
          }
          else{
            this.setState({
              cols: resp.cols,
              rows: resp.rows
            });
          }
        });               
    
      }

}

class RowUpdate{
    UpdatedRow:GridRowModel;
    OriginalRow:GridRowModel;
}
class InputDefinition {
    public label: string;
    public dataType: string;
}
export default Excel;