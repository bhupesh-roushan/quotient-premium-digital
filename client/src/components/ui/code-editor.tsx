"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Download, Copy, Eye, Package } from "lucide-react";
import { toast } from "sonner";

interface CodeFile {
  filename: string;
  content: string;
  language: string;
}

interface CodeTemplateData {
  framework: string;
  language: string;
  componentType: string;
  dependencies: string[];
  hasLivePreview: boolean;
  sandboxEnabled: boolean;
  codeFiles: CodeFile[];
  previewUrl?: string;
}

interface ComponentDeliverable {
  id: string;
  name: string;
  description: string;
  componentType: string;
  framework: string;
  language: string;
  codeFiles: CodeFile[];
  previewUrl?: string;
  dependencies: string[];
  createdAt: Date;
}

interface CodeEditorProps {
  template: CodeTemplateData;
  onTemplateChange?: (template: CodeTemplateData) => void;
  onAddToDeliverables?: (component: ComponentDeliverable) => void;
  showAddToDeliverables?: boolean;
  isPreview?: boolean;
  deliverables?: ComponentDeliverable[];
}

function CodeEditor({ template, onTemplateChange, onAddToDeliverables, showAddToDeliverables, isPreview = false, deliverables = [] }: CodeEditorProps) {
  const [activeFile, setActiveFile] = useState(0);
  const [code, setCode] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("CodeEditor received template:", template);
  console.log("CodeEditor template.framework:", template?.framework);
  console.log("CodeEditor template.codeFiles:", template?.codeFiles);

  useEffect(() => {
    if (template.codeFiles.length > 0) {
      setCode(template.codeFiles[activeFile]?.content || "");
    }
  }, [template, activeFile]);

  // Test function to verify the component is working
  const testRun = () => {
    console.log("Test run clicked!");
    alert("CodeEditor is working! Framework: " + template.framework);
  };

  const handleAddSingleDeliverable = (file: CodeFile) => {
    if (!onAddToDeliverables) {
      return;
    }

    const deliverableName = file.filename;
    
    // Check if component with same name already exists - STRICT CHECK
    const isDuplicate = deliverables.some(d => 
      d.name === deliverableName || 
      d.codeFiles.some(cf => cf.filename === file.filename)
    );
    
    if (isDuplicate) {
      toast.error(`${deliverableName} is already in deliverables. Each component can only be added once.`);
      return;
    }
    
    const deliverable: ComponentDeliverable = {
      id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: deliverableName,
      description: `${template.componentType} component built with ${template.framework}`,
      componentType: template.componentType,
      framework: template.framework,
      language: template.language,
      codeFiles: [file],
      previewUrl: previewUrl,
      dependencies: template.dependencies,
      createdAt: new Date()
    };

    onAddToDeliverables(deliverable);
    toast.success(`${deliverable.name} added to deliverables`);
  };

  const handleAddToDeliverables = () => {
    if (!onAddToDeliverables || !template.codeFiles || template.codeFiles.length === 0) {
      return;
    }

    // Create a deliverable component from the current template
    const mainFile = template.codeFiles[0];
    const deliverableName = mainFile?.filename || `${template.componentType} - ${template.framework}`;
    
    // Check if component with same name already exists
    const existingDeliverables = deliverables.filter(d => d.name === deliverableName);
    if (existingDeliverables.length > 0) {
      toast.error(`${deliverableName} is already in deliverables`);
      return;
    }
    
    const deliverable: ComponentDeliverable = {
      id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: deliverableName,
      description: `${template.componentType} component built with ${template.framework}`,
      componentType: template.componentType,
      framework: template.framework,
      language: template.language,
      codeFiles: [...template.codeFiles],
      previewUrl: previewUrl,
      dependencies: template.dependencies,
      createdAt: new Date()
    };

    onAddToDeliverables(deliverable);
    toast.success(`${deliverable.name} added to deliverables`);
  };

  const handleRunCode = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Running code with template:", template);
      console.log("Framework:", template.framework);
      console.log("Language:", template.language);
      
      if (!template.codeFiles || template.codeFiles.length === 0) {
        setError("No code files to run. Please add a code file first.");
        return;
      }
      
      // Use StackBlitz for all frameworks
      console.log("Using StackBlitz embed");
      const sandboxUrl = createStackBlitzEmbed(template);
      setPreviewUrl(sandboxUrl);
      
      console.log("StackBlitz embed generated successfully");
    } catch (err) {
      console.error("Failed to generate preview:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError("Failed to generate preview: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createStackBlitzEmbed = (template: CodeTemplateData): string => {
    const mainCode = template.codeFiles.find(f => f.filename.includes('index') || f.filename.includes('App') || f.filename.includes('Greeting'))?.content || template.codeFiles[0]?.content || '';
    
    console.log("Creating StackBlitz embed with code:", mainCode);
    console.log("Framework:", template.framework);
    console.log("Language:", template.language);
    
    // For React projects, create a complete working example
    if (template.framework === 'react' || template.language === 'jsx' || template.language === 'tsx') {
      // Clean the code for injection
      let cleanCode = mainCode
        .replace(/export\s+default\s+\w+/g, '') // Remove export default
        .replace(/import\s+React\s+from\s+['"]react['"];?/g, '') // Remove React import
        .replace(/import\s+ReactDOM\s+from\s+['"]react-dom\/client['"];?/g, ''); // Remove ReactDOM import
      
      // Create App.js content
      const appContent = `import React from 'react';

${cleanCode}

// Make sure we have a default export
${cleanCode.includes('export default') ? '' : 'export default ' + (cleanCode.includes('function ') ? cleanCode.match(/function\s+(\w+)/)?.[1] || 'App' : 'App') + ';'}`;
      
      // Create index.js content
      const indexContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`;
      
      // Create package.json
      const packageJson = {
        "name": "react-template",
        "version": "0.1.0",
        "private": true,
        "dependencies": {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "react-scripts": "5.0.1"
        },
        "scripts": {
          "start": "react-scripts start",
          "build": "react-scripts build",
          "test": "react-scripts test",
          "eject": "react-scripts eject"
        },
        "eslintConfig": {
          "extends": [
            "react-app",
            "react-app/jest"
          ]
        },
        "browserslist": {
          "production": [
            ">0.2%",
            "not dead",
            "not op_mini all"
          ],
          "development": [
            "last 1 chrome version",
            "last 1 firefox version",
            "last 1 safari version"
          ]
        }
      };
      
      // Create public/index.html
      const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Web site created using create-react-app" />
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
      
      // Encode all files
      const files = {
        'package.json': encodeURIComponent(JSON.stringify(packageJson, null, 2)),
        'public/index.html': encodeURIComponent(indexHtml),
        'src/index.js': encodeURIComponent(indexContent),
        'src/App.js': encodeURIComponent(appContent)
      };
      
      // Build StackBlitz URL with files
      const fileParams = Object.entries(files)
        .map(([path, content]) => `file=${path}&content=${content}`)
        .join('&');
      
      return `https://stackblitz.com/edit/react-ts?embed=1&hideNavigation=1&theme=dark&${fileParams}`;
    }
    
    // For JavaScript projects
    else if (template.framework === 'javascript' || template.framework === 'typescript') {
      const encodedCode = encodeURIComponent(mainCode);
      return `https://stackblitz.com/edit/js?embed=1&hideNavigation=1&theme=dark&file=index.js&content=${encodedCode}`;
    }
    
    // For HTML projects
    else if (template.framework === 'html' || template.language === 'html') {
      const encodedCode = encodeURIComponent(mainCode);
      return `https://stackblitz.com/edit/html?embed=1&hideNavigation=1&theme=dark&file=index.html&content=${encodedCode}`;
    }
    
    // Default fallback
    else {
      const encodedCode = encodeURIComponent(mainCode);
      return `https://stackblitz.com/edit/js?embed=1&hideNavigation=1&theme=dark&file=index.js&content=${encodedCode}`;
    }
  };

  const generatePreviewHTML = (template: CodeTemplateData): string => {
    const mainCode = template.codeFiles.find(f => f.filename.includes('index') || f.filename.includes('App'))?.content || template.codeFiles[0]?.content || '';
    
    console.log("Generating preview for framework:", template.framework);
    console.log("Main code:", mainCode);
    
    if (template.framework === 'html' || template.language === 'html') {
      // For HTML, just return the code as-is since it's already a complete HTML document
      return mainCode;
    } else if (template.framework === 'react') {
      return `
        <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Code Preview</title>
              <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
              <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                .preview-container { max-width: 800px; margin: 0 auto; }
              </style>
            </head>
            <body>
              <div id="root"></div>
              <script type="text/babel">
                const { useState } = React;
                
                const App = () => {
                  return React.createElement('div', { className: 'preview-container' }, 
                    React.createElement('div', { dangerouslySetInnerHTML: { __html: \`${mainCode.replace(/\\`/g, '\\\`')}\` })
                  );
                };
                
                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(React.createElement(App));
              </script>
            </body>
          </html>
      `;
    } else if (template.framework === 'vue') {
      return `
        <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Vue Code Preview</title>
              <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                .preview-container { max-width: 800px; margin: 0 auto; }
              </style>
            </head>
            <body>
              <div id="app" class="preview-container"></div>
              <script>
                const { createApp } = Vue;
                
                const App = {
                  template: \`${mainCode}\`
                };
                
                createApp(App).mount('#app');
              </script>
            </body>
          </html>
      `;
    } else if (template.framework === 'javascript' || template.framework === 'typescript') {
      return `
        <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>JavaScript Preview</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                .preview-container { max-width: 800px; margin: 0 auto; }
                pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
              </style>
            </head>
            <body>
              <div class="preview-container">
                <pre><code>${mainCode}</code></pre>
              </div>
            </body>
          </html>
      `;
    }
    
    // Default fallback for any other framework
    return `
      <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Code Preview</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .preview-container { max-width: 800px; margin: 0 auto; }
              pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
            </style>
          </head>
          <body>
            <div class="preview-container">
              <h3>Preview for ${template.framework} - ${template.language}</h3>
              <pre><code>${mainCode}</code></pre>
            </div>
          </body>
        </html>
    `;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = template.codeFiles[activeFile]?.filename || 'code.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isPreview) {
    return (
      <div className="w-full h-full ">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Live Preview</h3>
            <div className="flex gap-2 ">
              <Badge variant="outline">{template.framework}</Badge>
              <Badge variant="outline">{template.language}</Badge>
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            {previewUrl ? (
              <iframe
                src={previewUrl}
                className="w-full h-full"
                title="Code Preview"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Click "Run Code" to see the preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full p-4 ">
      {/* Test Button */}
      <Card className="p-4 bg-neutral-900/30 border-neutral-800/50 backdrop-blur-md">
        <button 
          type="button"
          onClick={testRun}
          className="px-4 py-2 bg-violet-600/50 hover:bg-violet-500/70 text-white rounded-lg border border-violet-500/30 backdrop-blur-sm transition-all shadow-lg shadow-violet-500/20 cursor-pointer"
        >
          TEST CODE EDITOR
        </button>
        <p className="text-neutral-300 text-sm mt-2">Framework: {template.framework}</p>
        <p className="text-neutral-300 text-sm">Code Files: {template.codeFiles.length}</p>
      </Card>

      {/* Code Editor - Full Width */}
      <Card className="h-full bg-neutral-900/30 border-neutral-800/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <span>Code Editor</span>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-neutral-700 text-neutral-300">{template.framework}</Badge>
              <Badge variant="outline" className="border-neutral-700 text-neutral-300">{template.language}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* File Tabs */}
          <div className="border-b border-neutral-800">
            <Tabs value={activeFile.toString()} onValueChange={(value) => setActiveFile(parseInt(value))}>
              <TabsList className="grid w-full grid-cols-1 bg-neutral-950/50">
                {template.codeFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <TabsTrigger value={index.toString()} className="flex-1 justify-start text-neutral-300 data-[state=active]:text-white data-[state=active]:bg-neutral-800/50">
                      {file.filename}
                    </TabsTrigger>
                    {showAddToDeliverables && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddSingleDeliverable(file)}
                        className="h-8 w-8 p-0 hover:bg-violet-500/30 hover:text-violet-300"
                        title="Add to deliverables"
                      >
                        <Package className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          {/* Code Display */}
          <div className="relative">
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="h-8 w-8 p-0 bg-neutral-900/50 border-neutral-700 hover:bg-neutral-800/50 hover:border-violet-500/50"
              >
                <Copy className="h-4 w-4 text-neutral-300" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadCode}
                className="h-8 w-8 p-0 bg-neutral-900/50 border-neutral-700 hover:bg-neutral-800/50 hover:border-violet-500/50"
              >
                <Download className="h-4 w-4 text-neutral-300" />
              </Button>
            </div>
            <pre className="p-4 h-96 overflow-auto bg-neutral-950/50 border-neutral-800 text-white text-sm">
              <code>{code}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Controls - Full Width */}
      <Card className="bg-neutral-900/30 border-neutral-800/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">
            Sandbox Controls
            <p className="text-xs text-neutral-400 mt-2">Sandbox enabled for this template, Run and test the code in a safe environment</p>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="flex gap-2">
            
            <Button 
              type="button"
              onClick={handleRunCode} 
              disabled={isLoading} 
              className="flex-1 px-4 py-2 bg-pink-600/50  hover:bg-pink-500/70 text-white rounded-lg border border-pink-500/30 backdrop-blur-sm transition-all shadow-lg shadow-pink-500/20 cursor-pointer"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              Run Code
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewUrl("")}
              disabled={!previewUrl}
              className="px-4 py-2 bg-red-600/50 hover:bg-red-500/70 text-white rounded-lg border border-red-500/30 backdrop-blur-sm transition-all shadow-lg shadow-red-500/20 cursor-pointer hover:text-white"
            >
              Clear Preview
            </Button>
          </div>
          
          {template.sandboxEnabled && (
            <div className="text-sm text-neutral-400">
              
            
            </div>
          )}
          
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">
              <p>Error: {error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview - Full Width and Larger */}
      {previewUrl && (
        <Card className="bg-neutral-900/30 border-neutral-800/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Eye className="h-4 w-4 text-violet-400" />
              Live Preview
              <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/30">StackBlitz</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm backdrop-blur-sm">
              <p className="text-green-400">
                <strong>StackBlitz:</strong> Your code is loaded in the StackBlitz editor! 
                Shows your component instantly with no sign-in required.
              </p>
            </div>
            <div className="border border-neutral-700/50 rounded-lg overflow-hidden bg-neutral-950/50" style={{ height: '600px' }}>
              <iframe
                src={previewUrl}
                className="w-full h-full"
                title="StackBlitz Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation-by-user-activation"
                allowFullScreen
                allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
              />
            </div>
            <div className="mt-2 text-sm text-neutral-400">
              <p>Powered by StackBlitz - Instant online dev environment</p>
              <p>Instant setup, no sign-in required, shows your code immediately</p>
              <p>Your component is pre-loaded and running in the preview!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dependencies - Full Width */}
      {template.dependencies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Dependencies
              <Badge variant="outline">{template.dependencies.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {template.dependencies.map((dep, index) => (
                <Badge key={index} variant="secondary">{dep}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CodeEditor;
