"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Eye, Trash2, Plus } from "lucide-react";

interface CodeFile {
  filename: string;
  content: string;
  language: string;
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

interface DeliverablesManagerProps {
  deliverables: ComponentDeliverable[];
  onDeliverablesChange: (deliverables: ComponentDeliverable[]) => void;
  readOnly?: boolean;
}

export default function DeliverablesManager({ 
  deliverables, 
  onDeliverablesChange, 
  readOnly = false 
}: DeliverablesManagerProps) {
  const [selectedDeliverable, setSelectedDeliverable] = useState<ComponentDeliverable | null>(null);

  const handleRemoveDeliverable = (id: string) => {
    const updated = deliverables.filter(d => d.id !== id);
    onDeliverablesChange(updated);
    if (selectedDeliverable?.id === id) {
      setSelectedDeliverable(null);
    }
  };

  const handleAddDeliverable = (deliverable: ComponentDeliverable) => {
    const updated = [...deliverables, deliverable];
    onDeliverablesChange(updated);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-neutral-900/30 border-neutral-800/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Package className="h-5 w-5 text-violet-400" />
            Component Deliverables
            <Badge variant="outline" className="border-neutral-600 text-neutral-300">{deliverables.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deliverables.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No components added to deliverables yet.</p>
              <p className="text-sm">Create components in the code editor and add them here.</p>
            </div>
          ) : (
            <Tabs   value={selectedDeliverable?.id || ""} onValueChange={(value) => {
              const deliverable = deliverables.find(d => d.id === value);
              setSelectedDeliverable(deliverable || null);
            }}>
              <TabsList className="grid w-full h-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 bg-neutral-900/30 border border-neutral-800/50 backdrop-blur-md  rounded-lg mb-4">
                {deliverables.map((deliverable) => (
                  <TabsTrigger 
                    key={deliverable.id} 
                    value={deliverable.id}
                    type="button"
                    className="justify-start  data-[state=active]:bg-violet-500/30 data-[state=active]:text-white data-[state=active]:border-violet-500/50 border border-transparent hover:bg-neutral-800/50 text-neutral-300 rounded-md transition-all"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Package className="h-4 w-4" />
                      <span className="truncate">{deliverable.name}</span>
                      <Badge variant="secondary" className="ml-auto bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {deliverable.framework}
                      </Badge>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {deliverables.map((deliverable) => (
                <TabsContent key={deliverable.id} value={deliverable.id} className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Component Info */}
                    <Card className="bg-neutral-900/30 border-neutral-800/50 backdrop-blur-md">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-white">
                          {deliverable.name}
                          {!readOnly && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveDeliverable(deliverable.id)}
                              className="bg-red-600/50 backdrop-blur-sm border border-red-500/30 hover:bg-red-500/70"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-white">
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">{deliverable.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Type</h4>
                            <Badge className="text-white bg-violet-500/20  border-violet-500/30" variant="outline">{deliverable.componentType}</Badge>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Framework</h4>
                            <Badge className="text-white bg-violet-500/20  border-violet-500/30" variant="outline">{deliverable.framework}</Badge>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Dependencies</h4>
                          <div className="flex flex-wrap gap-2">
                            {deliverable.dependencies.length > 0 ? (
                              deliverable.dependencies.map((dep, index) => (
                                <Badge key={index} variant="secondary">{dep}</Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">No dependencies</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Files</h4>
                          <div className="space-y-1">
                            {deliverable.codeFiles.map((file, index) => (
                              <div key={index} className="text-sm text-muted-foreground">
                                📄 {file.filename} ({file.language})
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Preview */}
                    <Card className="bg-neutral-900/30 border-neutral-800/50 backdrop-blur-md">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Eye className="h-4 w-4 text-violet-400" />
                          Live Preview
                          <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/30">Buyer View</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {deliverable.previewUrl ? (
                          <div className="border rounded-lg overflow-hidden" style={{ height: '400px' }}>
                            <iframe
                              src={deliverable.previewUrl}
                              className="w-full h-full"
                              title="Component Preview"
                              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                            />
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground border rounded-lg">
                            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No preview available</p>
                            <p className="text-sm">Run the code to generate a preview</p>
                          </div>
                        )}
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>🔒 Buyers see only the preview, not the source code</p>
                          <p>💰 Code is accessible after purchase</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export type { ComponentDeliverable };
