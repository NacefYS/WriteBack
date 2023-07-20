
import * as React from "react";
import * as ReactDOM from "react-dom";
import { DataGrid, GridColDef,GridRowIdGetter,GridRowModel } from '@mui/x-data-grid';
import { Box } from "@mui/material";
export interface State {
    data: any,
    ColumnsDef: GridColDef[],
    InputDef: InputDefinition[],
    RowId:string,
    Visible:boolean

}

export const initialState: State = {
    data: new Array(),
    ColumnsDef: new Array(),
    InputDef: new Array(),
    RowId:"",
    Visible:false

}
export class ReactGrid extends React.Component<{}, State>{
    private static updateCallback: (data: object) => void = null;

    public static update(newState: State) {
        if (typeof ReactGrid.updateCallback === 'function') {
            ReactGrid.updateCallback(newState);
        }
    }
    public static  updateddata:RowUpdate[];
    public state: State = initialState;

    public componentWillMount() {
        ReactGrid.updateCallback = (newState: State): void => { 
            if(this.state.data!=newState.data){
                ReactGrid.updateddata
            }
            this.setState(newState); 

        };
    }

    public componentWillUnmount() {
        ReactGrid.updateCallback = null;
    }
    constructor(props: any) {
        super(props);
        this.state = initialState;
    }
    render() {
        const { data, ColumnsDef, InputDef } = this.state;
        const rows=this.state.data;
        const rowid=this.state.RowId;
        const columns = this.state.ColumnsDef;
        const Visible=this.state.Visible;
        
        const processRowUpdate = React.useCallback(
            async (newRow: GridRowModel,oldRow:GridRowModel) => {
              var r:RowUpdate=new RowUpdate();
              r.UpdatedRow=newRow;
              r.OriginalRow=oldRow;
                ReactGrid.updateddata.push(r);
            },ReactGrid.updateddata
          );
        
        
        return (
            <Box visibility={Visible?"visible":"hidden"}  style={{ height: '100%' , width: '100%' }}>
      <DataGrid  rows={rows} columns={columns} processRowUpdate={(updatedRow, originalRow)=>{
        
      }}  editMode="row" />
    </Box>
        );
    }
}
class RowUpdate{
    public UpdatedRow:GridRowModel;
    public OriginalRow:GridRowModel;
}
class InputDefinition {
    public label: string;
    public dataType: string;
}
export default ReactGrid;