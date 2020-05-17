import * as React from "react";
import * as ReactDOM from "react-dom";

import "./index.css";
import App from "./App";
import { HintModel } from "./model/hintTreeModel";

declare global {
  interface Window {
    acquireVsCodeApi(): any;
    initialData: HintModel;
  }
}

const vscode = window.acquireVsCodeApi();
ReactDOM.render(
  <App vscode={vscode} initialData={window.initialData} />,
  document.getElementById("root")
);
