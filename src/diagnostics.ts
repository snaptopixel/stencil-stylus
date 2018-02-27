import os from 'os';
import * as d from './declarations';


export function loadDiagnostic(context: d.PluginCtx, stylusError: any, filePath: string) {
  if (!stylusError || !context) {
    return;
  }

  // Split the message
  const messageLines = stylusError.message.split(os.EOL);

  const messageTextIndex = messageLines.length - 2;

  const diagnostic: d.Diagnostic = {
    level: 'error',
    type: 'stylus',
    language: 'stylus',
    header: 'stylus error',
    code: stylusError.status && stylusError.status.toString(),
    relFilePath: null,
    absFilePath: null,
    messageText: messageLines[messageTextIndex],
    lines: []
  };

  if (filePath) {
    diagnostic.absFilePath = filePath;
    diagnostic.relFilePath = formatFileName(context.config.rootDir, diagnostic.absFilePath);
    diagnostic.header = formatHeader('stylus', diagnostic.absFilePath, context.config.rootDir, stylusError.line);

    // Skip the first line as it represents the filepath and Stencil already prints it
    for (let i = 1, len = messageTextIndex; i < len; i++) {
      diagnostic.lines.push({
        lineIndex: i,
        lineNumber: i,
        text: messageLines[i],
        errorCharStart: -1,
        errorLength: -1
      });
    }

  }

  context.diagnostics.push(diagnostic);
}


function formatFileName(rootDir: string, fileName: string) {
  if (!rootDir || !fileName) return '';

  fileName = fileName.replace(rootDir, '');
  if (/\/|\\/.test(fileName.charAt(0))) {
    fileName = fileName.substr(1);
  }
  if (fileName.length > 80) {
    fileName = '...' + fileName.substr(fileName.length - 80);
  }
  return fileName;
}


function formatHeader(type: string, fileName: string, rootDir: string, startLineNumber: number = null, endLineNumber: number = null) {
  let header = `${type}: ${formatFileName(rootDir, fileName)}`;

  if (startLineNumber !== null && startLineNumber > 0) {
    if (endLineNumber !== null && endLineNumber > startLineNumber) {
      header += `, lines: ${startLineNumber} - ${endLineNumber}`;
    } else {
      header += `, line: ${startLineNumber}`;
    }
  }

  return header;
}
