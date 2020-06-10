import { IpcRendererEvent } from "electron";
import React, { useEffect } from "react";
import { connect } from "react-redux";
import ReactDOM from "react-dom";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import Button from "@material-ui/core/Button";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import { styled } from "@material-ui/core/styles";
const ipcRenderer = window.require("electron").ipcRenderer;

import { IAppConfig } from "../../IAppConfig";

const mapStateToProps = (state) => {
  return state;
};

const MyButton = styled(Button)({
  margin: 10,
});

interface SettingsProps extends IAppConfig {}

const Settings: React.FC<SettingsProps> = (props: SettingsProps) => {
  useEffect(() => {
    ipcRenderer.send("settings-render-process-ready");
  });

  const saveCallback = () => {
    ipcRenderer.send("save-settings", props);
  };
  const closeCallback = () => {
    ipcRenderer.send("close-settings-window");
  };

  return (
    <div>
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              checked={props.showLineNumber}
              onChange={(e) => {
                console.log(e.target.value);
                console.log(e.target);
                // this.setState({ showLineNumber: !this.propsstate.showLineNumber });
              }}
            />
          }
          label="Show Line Number"
        />
      </FormGroup>
      <Grid container alignItems="center" justify="center">
        <Grid item xs={2}>
          <MyButton variant="contained" color="primary" onClick={saveCallback}>
            Save
          </MyButton>
        </Grid>
        <Grid item xs={1}></Grid>
        <Grid item xs={2}>
          <MyButton variant="contained" onClick={this.closeCallback.bind(this)}>
            Close
          </MyButton>
        </Grid>
      </Grid>
    </div>
  );
};

/* componentDidMount() {
 *   ipcRenderer.on('settings', (_event: IpcRendererEvent, content: IAppConfig) => {
 *     this.setState(content);
 *   });
 *   ipcRenderer.send('settings-render-process-ready');
 * } */
