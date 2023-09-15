
import * as React from "react";
import * as ReactDOM from "react-dom";
import { DataGrid, GridColDef,GridRowIdGetter,GridRowMode,GridRowModel,useGridApiRef, GridToolbarContainer, GridRowsProp, GridRowModesModel} from '@mui/x-data-grid';
import { Box, Stack } from "@mui/material";
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { GridApiCommunity } from "@mui/x-data-grid/models/api/gridApiCommunity";

import { Grid} from 'smart-webcomponents-react/grid';
import { RadioButton } from 'smart-webcomponents-react/radiobutton';
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

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
        newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
    }

    function EditToolbar(props: EditToolbarProps) {
    const { setRows, setRowModesModel } = props;
    
        const handleClick = () => {
            const newRow = {};
            setRows((prevRows) => [...prevRows, newRow]);
            //setRowModesModel((prevModel) => ({ ...prevModel, [newRow.id]: 'edit' }));
        };
    
        return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
            Add record
            </Button>
        </GridToolbarContainer>
        );
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
export class ReactGrid extends React.Component<{}, State>{
    private static updateCallback: (data: object) => void = null;
    // private apiRef:React.MutableRefObject<GridApiCommunity>;
    public static update(newState: State) {
        if (typeof ReactGrid.updateCallback === 'function') {
            ReactGrid.updateCallback(newState);
        }
    }
    // public static  updateddata:RowUpdate[];
    public state: State = initialState;

    // componentDidMount()
    public componentWillMount() {
        ReactGrid.updateCallback = (newState: State): void => { 
            this.setState(newState); 
        };
    }

    public componentWillUnmount() {
        ReactGrid.updateCallback = null;
    }
    constructor(props: any) {
        super(props);
        this.state = initialState;
        // this.apiRef= useGridApiRef();
    }
    

    processRowUpd=async (newRow:GridRowModel,oldRow:GridRowModel) =>{
        var ru:RowUpdate=new RowUpdate();
        ru.OriginalRow=oldRow;
        ru.UpdatedRow=newRow;
        const response = await fetch('https://af-pocwb.azurewebsites.net/api/UpdateRecord?code=MdgqnHBS4P8iznOOQakdSHTahXzXr06fvh3GgabpDndIAzFuzoTaWw==', {
            method: 'POST',
            body: JSON.stringify({
                ConnectionString: this.state.ConnectionString,
                TableName: this.state.TableName,
                TableSchema: this.state.TableSchema,
                data: ru
            }),
            headers: {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*'
            }
        }).then(resp=>{
            NotificationManager.success('Record updated successfully', 'Success');
        });
    }

    render() {
        const { data, ColumnsDef, InputDef, } = this.state;
        const rows=this.state.data;
        const rowid=this.state.RowId;
        const columns = this.state.ColumnsDef;
        const Visible=this.state.Visible;
        const pru=this.processRowUpd;


        return (
            <Box visibility={Visible ? "visible" : "hidden"} style={{ height: '100%', width: '100%' }}>

                <DataGrid 
                    rows={rows} 
                    columns={columns} 
                    getRowId={() => Math.floor(Math.random() * 100000000)} 
                    processRowUpdate={async (updatedRow, originalRow) => {
                        await pru(updatedRow, originalRow);
                    }
                    } 
                    onProcessRowUpdateError={(error) => {
                        console.log("");
                    }} 
                    editMode="row" 
                    slots={{
                        toolbar: EditToolbar,
                    }}
                />
            </Box>
        );
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
export default ReactGrid;