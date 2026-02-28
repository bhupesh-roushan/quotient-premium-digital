"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download, Play } from "lucide-react";

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
  codeFiles: CodeFile[];
  previewUrl?: string;
  sandboxEnabled: boolean;
}

interface CodeTemplatePreviewProps {
  template: CodeTemplateData;
  isPurchased?: boolean;
}

export default function CodeTemplatePreview({ template, isPurchased = false }: CodeTemplatePreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const generatePreviewHTML = (): string => {
    const mainCode = template.codeFiles.find(f => f.filename.includes('index') || f.filename.includes('App'))?.content || template.codeFiles[0]?.content || '';
    
    if (template.framework === 'react') {
      return `
        <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>React Component Preview</title>
              <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
              <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f8fafc; }
                .preview-container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb; }
                .preview-title { font-size: 24px; font-weight: bold; color: #1f2937; }
                .preview-badges { display: flex; gap: 8px; }
              </style>
            </head>
            <body>
              <div class="preview-container">
                <div class="preview-header">
                  <div class="preview-title">Component Preview</div>
                  <div class="preview-badges">
                    <span style="background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">React</span>
                    <span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${template.language}</span>
                  </div>
                </div>
                <div id="root"></div>
              </div>
              <script type="text/babel">
                const { useState } = React;
                
                const App = () => {
                  return React.createElement('div', { dangerouslySetInnerHTML: { __html: \`${mainCode.replace(/\\`/g, '\\\`')}\` });
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
              <title>Vue Component Preview</title>
              <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f8fafc; }
                .preview-container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb; }
                .preview-title { font-size: 24px; font-weight: bold; color: #1f2937; }
                .preview-badges { display: flex; gap: 8px; }
              </style>
            </head>
            <body>
              <div class="preview-container">
                <div class="preview-header">
                  <div class="preview-title">Component Preview</div>
                  <div class="preview-badges">
                    <span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Vue</span>
                    <span style="background: #059669; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${template.language}</span>
                  </div>
                </div>
                <div id="app"></div>
              </div>
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
    } else {
      return `
        <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Code Preview</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f8fafc; }
                .preview-container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb; }
                .preview-title { font-size: 24px; font-weight: bold; color: #1f2937; }
                .preview-badges { display: flex; gap: 8px; }
                pre { background: #f6f8fb; padding: 20px; border-radius: 6px; overflow-x: auto; font-family: 'Courier New', monospace; }
              </style>
            </head>
            <body>
              <div class="preview-container">
                <div class="preview-header">
                  <div class="preview-title">Code Preview</div>
                  <div class="preview-badges">
                    <span style="background: #6b7280; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${template.framework}</span>
                    <span style="background: #374151; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${template.language}</span>
                  </div>
                </div>
                <pre><code>${mainCode}</code></pre>
              </div>
            </body>
          </html>
      `;
    }
  };

  const handlePreview = () => {
    const htmlContent = generatePreviewHTML();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setShowPreview(true);
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setShowPreview(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{template.framework}</Badge>
            <Badge variant="outline">{template.language}</Badge>
            <Badge variant="outline">{template.componentType}</Badge>
          </div>
          <div className="flex gap-2">
            {isPurchased ? (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Code
              </Button>
            ) : (
              <Button onClick={handlePreview} size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Live Preview
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Template Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Framework</h4>
              <p className="text-sm text-muted-foreground">{template.framework}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Language</h4>
              <p className="text-sm text-muted-foreground">{template.language}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Component Type</h4>
              <p className="text-sm text-muted-foreground">{template.componentType}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Files</h4>
              <p className="text-sm text-muted-foreground">{template.codeFiles.length} files</p>
            </div>
          </div>

          {/* Dependencies */}
          {template.dependencies.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Dependencies</h4>
              <div className="flex flex-wrap gap-2">
                {template.dependencies.map((dep, index) => (
                  <Badge key={index} variant="secondary">{dep}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Live Preview:</span>
              <Badge variant={template.hasLivePreview ? "default" : "secondary"}>
                {template.hasLivePreview ? "Available" : "Not Available"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sandbox:</span>
              <Badge variant={template.sandboxEnabled ? "default" : "secondary"}>
                {template.sandboxEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>

          {/* Preview Modal */}
          {showPreview && previewUrl && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold">Live Preview</h3>
                  <Button onClick={closePreview} variant="outline" size="sm">
                    Close
                  </Button>
                </div>
                <div className="overflow-auto" style={{ height: 'calc(90vh - 80px)' }}>
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title="Code Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
