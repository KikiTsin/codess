// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getWebviewOptions, getNonce } from './utils/index';
import { transformCodeToFile } from './transform/index';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('d2c.transform', () => {
    createPanel(context);
  });

  context.subscriptions.push(disposable);
}

function getHtmlForWebview(
  webview: vscode.Webview,
  context: vscode.ExtensionContext
) {
  const scriptPathOnDisk = vscode.Uri.joinPath(context.extensionUri, 'assets', 'index.js');
  // // And the uri we use to load this script in the webview
  const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

  // // Uri to load styles into webview
  const stylesPathMainPath = vscode.Uri.joinPath(context.extensionUri, 'assets', 'index.css');
  const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

  const nonce = getNonce();
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">

      <!--
        <meta http-equiv="Content-Security-Policy" content="default-src 'none';">
        Use a content security policy to only allow loading images from https or from our extension directory,
        and only allow scripts that have a specific nonce.
      -->
      <meta http-equiv="Content-Security-Policy">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="${stylesMainUri}" rel="stylesheet">
      <title>d2c operating panel</title>
    </head>
    <body>
      <div id="app"></div>
      <script>window.vscode_plugin_version = '1.0.0'</script>
      <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
}

export function createPanel(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'd2cPanel',
    'codess',
    vscode.ViewColumn.Two,
    getWebviewOptions(context.extensionUri)
  );

  panel.webview.html = getHtmlForWebview(panel.webview, context);
  panel.webview.onDidReceiveMessage(
    (message) => {
      switch (message.command) {
        case 'd2c_transform':
          startTransform(JSON.parse(message.text), panel);
          return;
        case 'open_browser':
          vscode.env.openExternal(
            vscode.Uri.parse(
              'https://github.com/KikiTsin/codess'
            )
          );
        default:
          break;
      }
    },
    undefined,
    context.subscriptions
  );
}

interface Body {
  data: Record<string, any>;
  lang: string;
  dir: string;
  useTailwind: number;
}

export async function startTransform(
  body: Body,
  currentPanel: vscode.WebviewPanel
) {
  try {
    await transformCodeToFile(body).catch(() => {
      return { code: -1, data: {} };
    });

    currentPanel.webview.postMessage({ command: 'transform_end' });
  } catch (error) {
    // 发生错误
    console.error(error);
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
