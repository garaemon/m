import { IpcRendererEvent } from "electron";
import React from "react";
import ReactDOM from "react-dom";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import Button from "@material-ui/core/Button";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import { styled } from "@material-ui/core/styles";
const ipcRenderer = window.require("electron").ipcRenderer;

import { IAppConfig } from "../IAppConfig";

const MyButton = styled(Button)({
  margin: 10,
});

interface SettingsProps {}

interface SettingsState extends IAppConfig {}

class Settings extends React.Component<SettingsProps, SettingsState> {
  constructor(props: SettingsProps) {
    super(props);
    this.state = {
      foldImage: false,
      foldLink: false,
      foldMath: false,
      foldEmoji: false,
      showLineNumber: false,
    };
  }

  componentDidMount() {
    ipcRenderer.on("settings", (_event: IpcRendererEvent, content: IAppConfig) => {
      this.setState(content);
    });
    ipcRenderer.send("settings-render-process-ready");
  }

  private saveCallback() {
    ipcRenderer.send("save-settings", this.state);
  }

  private closeCallback() {
    ipcRenderer.send("close-settings-window");
  }

  public render(): React.ReactNode {
    return (
      <div>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={this.state.showLineNumber}
                onChange={(e) => {
                  console.log(e.target.value);
                  console.log(e.target);
                  this.setState({ showLineNumber: !this.state.showLineNumber });
                }}
              />
            }
            label="Show Line Number"
          />
        </FormGroup>
        <Grid container alignItems="center" justify="center">
          <Grid item xs={2}>
            <MyButton variant="contained" color="primary" onClick={this.saveCallback.bind(this)}>
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
  }
}

// レンダリング
ReactDOM.render(<Settings />, document.getElementById("contents"));
