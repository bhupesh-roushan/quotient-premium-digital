"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api/client";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { HoverBorderGradientDemo } from "@/components/accertainity/sellingbutton";
import CodeEditor from "@/components/ui/code-editor";
import DeliverablesManager, { ComponentDeliverable } from "@/components/ui/deliverables-manager";

interface CodeFile {
  filename: string;
  content: string;
  language: string;
}

function NewProductForm({ formId }: { formId: string }) {
  const router = useRouter();
  
  // Basic product info
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(100);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Deliverables
  const [deliverables, setDeliverables] = useState<ComponentDeliverable[]>([]);
  
  // Code template specific
  const [framework, setFramework] = useState("react");
  const [language, setLanguage] = useState("typescript");
  const [componentType, setComponentType] = useState("component");
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [dependencyInput, setDependencyInput] = useState("");
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);
  const [activeCodeFile, setActiveCodeFile] = useState(0);
  const [hasLivePreview, setHasLivePreview] = useState(true);
  const [sandboxEnabled, setSandboxEnabled] = useState(true);
  const [currentTab, setCurrentTab] = useState("basic");

  const categories = [
    { value: "notion-template", label: "Notion Template" },
    { value: "resume-template", label: "Resume Template" },
    { value: "ui-kit", label: "UI Kit" },
    { value: "figma-assets", label: "Figma Assets" },
    { value: "productivity-dashboard", label: "Productivity Dashboard" },
    { value: "ai-prompt-pack", label: "AI Prompt Pack" },
    { value: "dev-boilerplate", label: "Developer Boilerplate" },
    { value: "mern-starter", label: "MERN Starter" },
    { value: "auth-system", label: "Auth System" },
    { value: "saas-starter", label: "SaaS Starter" },
    { value: "api-scaffold", label: "API Scaffold" },
    { value: "workflow-system", label: "Workflow System" },
    { value: "automation-pipeline", label: "Automation Pipeline" },
    { value: "ai-productivity", label: "AI Productivity" },
    { value: "business-guide", label: "Business Guide" },
    { value: "automation-guide", label: "Automation Guide" },
    { value: "productivity-framework", label: "Productivity Framework" },
    // Code template categories
    { value: "react-template", label: "React Template" },
    { value: "vue-template", label: "Vue Template" },
    { value: "angular-template", label: "Angular Template" },
    { value: "javascript-component", label: "JavaScript Component" },
    { value: "typescript-component", label: "TypeScript Component" },
    { value: "css-template", label: "CSS Template" },
    { value: "html-template", label: "HTML Template" },
  ];

  const isCodeTemplate = category?.includes("-template") || category?.includes("-component");

  // Code template functions
  const addDependency = () => {
    if (dependencyInput.trim() && !dependencies.includes(dependencyInput.trim())) {
      setDependencies([...dependencies, dependencyInput.trim()]);
      setDependencyInput("");
    }
  };

  const removeDependency = (index: number) => {
    setDependencies(dependencies.filter((_, i) => i !== index));
  };

  const addCodeFile = () => {
    const newFile: CodeFile = {
      filename: `file${codeFiles.length + 1}.${language === 'typescript' ? 'tsx' : language === 'javascript' ? 'js' : language}`,
      content: `// ${language} code file ${codeFiles.length + 1}\n\n// Write your code here\n`,
      language: language
    };
    setCodeFiles([...codeFiles, newFile]);
    setActiveCodeFile(codeFiles.length);
  };

  const removeCodeFile = (index: number) => {
    setCodeFiles(codeFiles.filter((_, i) => i !== index));
    if (activeCodeFile >= codeFiles.length - 1) {
      setActiveCodeFile(Math.max(0, codeFiles.length - 2));
    }
  };

  const updateCodeFile = (index: number, field: 'filename' | 'content', value: string) => {
    const updatedFiles = [...codeFiles];
    updatedFiles[index] = {
      ...updatedFiles[index],
      [field]: value
    };
    setCodeFiles(updatedFiles);
  };

  // Debug: Log state changes
  console.log("Form state:", { title, price, category, description, loading, isCodeTemplate });

  const handleAddToDeliverables = (component: ComponentDeliverable) => {
    setDeliverables(prev => [...prev, component]);
  };

  const handleDeliverablesChange = (updatedDeliverables: ComponentDeliverable[]) => {
    setDeliverables(updatedDeliverables);
  };

  const onNewProductFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form submitted!");
    setLoading(true);

    try {
      const productData: any = {
        title,
        price,
        category,
        description: description || `A high-quality ${category?.replace('-', ' ')} for creators and professionals.`,
        codeFiles: codeFiles.length > 0 ? codeFiles : undefined,
        framework: codeFiles.length > 0 ? framework : undefined,
        language: codeFiles.length > 0 ? language : undefined,
        componentType: codeFiles.length > 0 ? componentType : undefined,
        dependencies: codeFiles.length > 0 ? dependencies : undefined,
        hasLivePreview: codeFiles.length > 0 ? hasLivePreview : undefined,
        sandboxEnabled: codeFiles.length > 0 ? sandboxEnabled : undefined,
        deliverables: deliverables.length > 0 ? deliverables : undefined
      };

      console.log("Sending product data:", JSON.stringify(productData, null, 2));

      const res = await apiClient.post("/api/creator/products", productData);

      console.log("API Response:", res);

      if (res?.data?.ok) {
        router.push("/dashboard/products");
        router.refresh();
      } else {
        console.error("Product creation failed:", res?.data?.error);
        toast.error(`Error: ${res?.data?.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error("Error creating product:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        toast.error(`Error ${err.response.status}: ${err.response.data?.error || err.response.data?.message || 'Unknown error'}`);
      } else {
        toast.error(`Error: ${err.message || 'Network error'}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full bg-neutral-950 relative antialiased">
      <BackgroundBeams className="absolute inset-0" />
      <form
        id={formId}
        onSubmit={onNewProductFormSubmit}
        className="max-w-6xl w-full mx-auto p-6 relative z-30"
      >
        <h1 className="text-2xl md:text-3xl bg-clip-text text-transparent bg-linear-to-b from-neutral-200 to-neutral-600 text-center font-bold mb-8">
          Create New Template
        </h1>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            {isCodeTemplate && <TabsTrigger value="code">Code Editor</TabsTrigger>}
            {isCodeTemplate && <TabsTrigger value="deliverables">Deliverables</TabsTrigger>}
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <fieldset className="space-y-2">
                <legend className="text-neutral-300">Template Name</legend>
                <Input
                  placeholder="Name of your template"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  className="h-10 rounded-lg border border-neutral-800 bg-neutral-950 text-white placeholder:text-neutral-600 focus:ring-2 focus:ring-teal-500"
                  required
                  autoFocus
                />
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="text-neutral-300">Category</legend>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 rounded-lg border border-neutral-800 bg-neutral-950 text-white px-3 w-full"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-neutral-950 text-white">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="text-neutral-300">Price</legend>
                <Input
                  placeholder="Price of your template"
                  value={price}
                  type="number"
                  min={1}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  disabled={loading}
                  className="h-10 rounded-lg border border-neutral-800 bg-neutral-950 text-white placeholder:text-neutral-600 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="text-neutral-300">Description (Optional)</legend>
                <Textarea
                  placeholder="Describe your template..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  className="min-h-25 rounded-lg border border-neutral-800 bg-neutral-950 text-white placeholder:text-neutral-600 focus:ring-2 focus:ring-teal-500"
                />
              </fieldset>
            </div>
          </TabsContent>

          {/* Code Editor Tab */}
          {isCodeTemplate && (
            <TabsContent value="code" className="space-y-6">
              {/* Code Template Settings */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Code Template Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Framework</label>
                    <select 
                      value={framework} 
                      onChange={(e) => setFramework(e.target.value)}
                      className="h-10 rounded-lg border border-neutral-800 bg-neutral-950 text-white px-3 w-full"
                    >
                      <option value="react">React</option>
                      <option value="vue">Vue</option>
                      <option value="angular">Angular</option>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="css">CSS</option>
                      <option value="html">HTML</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Language</label>
                    <select 
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value)}
                      className="h-10 rounded-lg border border-neutral-800 bg-neutral-950 text-white px-3 w-full"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="jsx">JSX</option>
                      <option value="tsx">TSX</option>
                      <option value="vue">Vue</option>
                      <option value="scss">SCSS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Component Type</label>
                    <select 
                      value={componentType} 
                      onChange={(e) => setComponentType(e.target.value)}
                      className="h-10 rounded-lg border border-neutral-800 bg-neutral-950 text-white px-3 w-full"
                    >
                      <option value="component">Component</option>
                      <option value="page">Page</option>
                      <option value="hook">Hook</option>
                      <option value="utility">Utility</option>
                      <option value="template">Template</option>
                      <option value="layout">Layout</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-6 mb-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={hasLivePreview}
                      onChange={(e) => setHasLivePreview(e.target.checked)}
                      className="rounded border-neutral-800 bg-neutral-950 text-white"
                    />
                    <span className="text-sm text-neutral-300">Enable Live Preview</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={sandboxEnabled}
                      onChange={(e) => setSandboxEnabled(e.target.checked)}
                      className="rounded border-neutral-800 bg-neutral-950 text-white"
                    />
                    <span className="text-sm text-neutral-300">Enable Sandbox</span>
                  </label>
                </div>

                {/* Dependencies */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-white mb-3">Dependencies</h4>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Add dependency (e.g., react, lodash)"
                      value={dependencyInput}
                      onChange={(e) => setDependencyInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addDependency();
                        }
                      }}
                      className="flex-1 h-10 rounded-lg border border-neutral-800 bg-neutral-950 text-white placeholder:text-neutral-600"
                    />
                    <button
                      type="button"
                      onClick={addDependency}
                      disabled={!dependencyInput.trim()}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>

                  {dependencies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {dependencies.map((dep, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-800 text-white rounded-full text-sm">
                          {dep}
                          <button
                            type="button"
                            onClick={() => removeDependency(index)}
                            className="ml-1 text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Code Files */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-white">Code Files</h4>
                    <button
                      type="button"
                      onClick={addCodeFile}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      + Add File
                    </button>
                  </div>

                  {codeFiles.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-neutral-700 rounded-lg">
                      <p className="text-neutral-400 mb-4">No code files yet. Add your first file to get started.</p>
                      <button
                        type="button"
                        onClick={addCodeFile}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                      >
                        + Add First File
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* File Tabs */}
                      <div className="flex border-b border-neutral-800">
                        {codeFiles.map((file, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setActiveCodeFile(index)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                              activeCodeFile === index
                                ? 'border-teal-500 text-teal-400 bg-neutral-800'
                                : 'border-transparent text-neutral-400 hover:text-white'
                            }`}
                          >
                            {file.filename}
                          </button>
                        ))}
                      </div>

                      {/* Active File Editor */}
                      {codeFiles.map((file, index) => (
                        <div key={index} className={activeCodeFile === index ? 'block' : 'hidden'}>
                          <div className="flex items-center gap-2 mb-2">
                            <Input
                              value={file.filename}
                              onChange={(e) => updateCodeFile(index, 'filename', e.target.value)}
                              placeholder="Filename"
                              className="flex-1 h-10 rounded-lg border border-neutral-800 bg-neutral-950 text-white"
                            />
                            <button
                              type="button"
                              onClick={() => removeCodeFile(index)}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                          <Textarea
                            value={file.content}
                            onChange={(e) => updateCodeFile(index, 'content', e.target.value)}
                            placeholder={`Write your ${language} code here...`}
                            className="min-h-50 rounded-lg border border-neutral-800 bg-neutral-950 text-white placeholder:text-neutral-600 font-mono text-sm"
                            rows={15}
                          />
                        </div>
                      ))}

                      {/* Code Preview */}
                      {codeFiles.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-md font-medium text-white mb-3">Live Preview</h4>
                          <div className="border border-neutral-800 rounded-lg overflow-hidden">
                            <CodeEditor
                              template={{
                                framework,
                                language,
                                componentType,
                                dependencies,
                                hasLivePreview,
                                sandboxEnabled,
                                codeFiles
                              }}
                              onAddToDeliverables={handleAddToDeliverables}
                              showAddToDeliverables={true}
                            />
                          </div>
                          {/* Debug info */}
                          <div className="mt-4 p-4 bg-neutral-900 rounded text-xs text-neutral-400">
                            <p>Debug: Framework: {framework}</p>
                            <p>Debug: Language: {language}</p>
                            <p>Debug: Code Files: {codeFiles.length}</p>
                            <p>Debug: First file content: {codeFiles[0]?.content?.substring(0, 100)}...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Deliverables Tab */}
          {isCodeTemplate && (
            <TabsContent value="deliverables" className="space-y-6">
              <DeliverablesManager
                deliverables={deliverables}
                onDeliverablesChange={handleDeliverablesChange}
                readOnly={false}
              />
            </TabsContent>
          )}
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-center mt-8">
          <HoverBorderGradientDemo
            text={loading ? "Creating..." : "Create Template"}
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}

export default NewProductForm;
