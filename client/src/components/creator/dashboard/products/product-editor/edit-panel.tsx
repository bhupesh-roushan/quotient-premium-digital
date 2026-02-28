"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AssetsRes,
  ImageAsset,
  Product,
  ProductRes,
} from "@/lib/types/product";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import AssetsGrid from "./asset-grid";
import ImageUpload from "./image-upload";
import GoogleImageSearch from "./google-image-search";
import CodeEditor from "@/components/ui/code-editor";
import DeliverablesManager, { ComponentDeliverable } from "@/components/ui/deliverables-manager";
import AIDashboard from "@/components/creator/dashboard/ai-dashboard";
import { useRouter } from "next/navigation";
import { AIDashboard } from "@/components/creator/dashboard/ai-dashboard";

interface CodeFile {
  filename: string;
  content: string;
  language: string;
}


type PatchProductBody = {

  title?: string;

  description?: string;

  price?: number;

  category?: string;

  installInstructions?: string;

  template?: {

    kind?: string;

    tool?: string;

    deliverables?: Array<{ label: string; url: string; kind: "link" | "file" | "code" }>;

    componentDeliverables?: ComponentDeliverable[];

  };

  // Code template fields
  codeFiles?: CodeFile[];

  framework?: string;

  language?: string;

  componentType?: string;

  dependencies?: string[];

  hasLivePreview?: boolean;

  sandboxEnabled?: boolean;

};



function EditPanel({

  productId,

  product,

  assets,

  coverUrl,

  onProductChange,

  onAssetsChange,

  onRefresh,

}: {

  productId: string;

  product: Product;

  assets: ImageAsset[];

  coverUrl: string | null;

  onProductChange: (p: Product) => void;

  onAssetsChange: (a: ImageAsset[]) => void;

  onRefresh: () => Promise<void>;

}) {

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState<string>(product.title);

  const [description, setDescription] = useState<string>(

    (product as unknown as { description?: string }).description ?? ""

  );



  const [price, setPrice] = useState<number>(product.price);

  const [templateKind, setTemplateKind] = useState<string>(
    product?.category || product?.template?.templateType || "generic"
  );

  const [templateTool, setTemplateTool] = useState<string>(
    (product as any)?.codeTemplate?.framework || ""
  );

  const [installInstructions, setInstallInstructions] = useState<string>(
    product?.installInstructions || ""
  );

  const [deliverables, setDeliverables] = useState<

    Array<{ label: string; url: string; kind: "link" | "file" | "code" }>

  >([]);

  // Code template specific states
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
  const [componentDeliverables, setComponentDeliverables] = useState<ComponentDeliverable[]>([]);
  const router = useRouter();

  // Categories matching the new product form
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

  // Check if this is a code template
  const isCodeTemplate = templateKind?.includes("-template") || templateKind?.includes("-component") || 
                        templateTool === "react" || templateTool === "nextjs" || templateTool === "vue" ||
                        templateKind === "react_component" || templateKind === "dev_boilerplate";

  // Initialize code files from product if they exist
  useEffect(() => {
    if ((product as any)?.codeTemplate?.codeFiles) {
      setCodeFiles((product as any).codeTemplate.codeFiles);
    }
    if ((product as any)?.codeTemplate?.framework) {
      setFramework((product as any).codeTemplate.framework);
    }
    if ((product as any)?.codeTemplate?.language) {
      setLanguage((product as any).codeTemplate.language);
    }
    if ((product as any)?.codeTemplate?.componentType) {
      setComponentType((product as any).codeTemplate.componentType);
    }
    if ((product as any)?.codeTemplate?.dependencies) {
      setDependencies((product as any).codeTemplate.dependencies);
    }
    // Initialize component deliverables from template if they exist
    if ((product as any)?.template?.componentDeliverables) {
      setComponentDeliverables((product as any).template.componentDeliverables);
    }
    // Initialize deliverables from product data (top-level or template)
    if ((product as any)?.deliverables?.length > 0) {
      setDeliverables((product as any).deliverables);
    } else if ((product as any)?.template?.deliverables?.length > 0) {
      setDeliverables((product as any).template.deliverables);
    }
  }, [product]);

  // Code file management functions
  const addCodeFile = () => {
    const newFile: CodeFile = {
      filename: `component.${language === 'typescript' ? 'tsx' : language === 'javascript' ? 'js' : 'jsx'}`,
      content: "",
      language: language
    };
    setCodeFiles([...codeFiles, newFile]);
    setActiveCodeFile(codeFiles.length);
  };

  const removeCodeFile = (index: number) => {
    const updated = codeFiles.filter((_, i) => i !== index);
    setCodeFiles(updated);
    if (activeCodeFile >= updated.length) {
      setActiveCodeFile(Math.max(0, updated.length - 1));
    }
  };

  const updateCodeFile = (index: number, field: keyof CodeFile, value: string) => {
    const updated = [...codeFiles];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setCodeFiles(updated);
  };

  const addDependency = () => {
    if (dependencyInput.trim() && !dependencies.includes(dependencyInput.trim())) {
      setDependencies([...dependencies, dependencyInput.trim()]);
      setDependencyInput("");
    }
  };

  const removeDependency = (dep: string) => {
    setDependencies(dependencies.filter(d => d !== dep));
  };

  // Deliverables handlers
  const handleAddToDeliverables = (component: ComponentDeliverable) => {
    setComponentDeliverables(prev => [...prev, component]);
  };

  const handleDeliverablesChange = (updatedDeliverables: ComponentDeliverable[]) => {
    setComponentDeliverables(updatedDeliverables);
  };


  async function saveBasics() {

    setLoading(true);



    try {

      const body: PatchProductBody = {

        title,

        price,

        // Map templateKind to category for consistency with new product form
        category: templateKind,

        // Top-level installInstructions (not in template)
        installInstructions,

        template: {

          kind: templateKind,

          // tool is not in the schema anymore, using framework instead
          ...(templateTool && { tool: templateTool }),

          deliverables,

          // Include component deliverables if it's a code template
          ...(isCodeTemplate && {
            componentDeliverables: componentDeliverables.length > 0 ? componentDeliverables : undefined
          })

        },

        description,

        // Include code template data if it's a code template
        ...(isCodeTemplate && {
          codeFiles: codeFiles.length > 0 ? codeFiles : undefined,
          framework: codeFiles.length > 0 ? framework : undefined,
          language: codeFiles.length > 0 ? language : undefined,
          componentType: codeFiles.length > 0 ? componentType : undefined,
          dependencies: codeFiles.length > 0 ? dependencies : undefined,
          hasLivePreview: codeFiles.length > 0 ? hasLivePreview : undefined,
          sandboxEnabled: codeFiles.length > 0 ? sandboxEnabled : undefined,
          componentDeliverables: componentDeliverables.length > 0 ? componentDeliverables : undefined
        })

      };

      if (typeof description === "string" && description.trim()) {

        body.description = description.trim();

      }

      const res = await apiClient.patch<ProductRes>(

        `/api/creator/products/${productId}`,

        body

      );



      if (!res.data.ok) throw new Error("Failed to update basic details");

      onProductChange(res.data.product);



      onProductChange(res.data.product);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }

  }



  async function setCover(imageAssetId: string) {

    setLoading(true);



    try {

      const res = await apiClient.patch<ProductRes>(

        `/api/creator/products/${productId}/cover`,

        {

          imageAssetId,

        }

      );



      if (!res.data.ok) throw new Error("Failed to save cover image");



      onProductChange(res.data.product);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }

  }



  async function removeAsset(asset: ImageAsset) {

    setLoading(true);

    try {

      const res = await apiClient.delete(

        `/api/creator/products/${productId}/assets/${asset._id}`

      );

      if (!res.data.ok) throw new Error("Failed to remove asset");

      onRefresh();

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }

  }



  async function publish() {

    setLoading(true);



    try {

      const res = await apiClient.patch<ProductRes>(

        `/api/creator/products/${productId}/publish`

      );



      if (!res.data.ok) throw new Error("Failed to publish");



      onProductChange(res.data.product);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }

  }



  async function deleteProduct() {
    if (!confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await apiClient.delete(`/api/creator/products/${productId}`);
      
      if (!res.data.ok) {
        toast.error(res.data.error || "Failed to delete template");
        return;
      }
      
      // Redirect to products list after successful deletion
      router.push("/dashboard/products");
      
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to delete template");
    } finally {
      setLoading(false);
    }
  }

  async function refreshAssetsOnly() {

    setLoading(true);

    try {

      const res = await apiClient.get<AssetsRes>(

        `/api/creator/products/${productId}/assets`

      );



      if (!res.data.ok) throw new Error("Failed to fetch assets");



      onAssetsChange(res.data.assets ?? []);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }

  }



  return (

    <div className="space-y-2">

      <Card className="rounded-lg m-4 border border-border  p-4 md:p-5 bg-black text-white">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="min-w-0">

            <div className="text-base font-medium">Basics</div>

            <div className="text-xs text-white">

              Slug: <span className="text-white">{product?.slug}</span>

            </div>

          </div>



          <div className="flex flex-wrap items-center gap-2">

            <div

              className={`px-2 py-1 text-xs ${

                product?.visibility === "draft"

                  ? "border border-border bg-[#ff90e8] text-black"

                  : "border border-border bg-white text-black"

              } rounded-lg`}

            >

              {product?.visibility === "draft" ? "Draft" : "Published"}

            </div>

            <Button

              className="text-black hover:bg-pink-500 hover:text-black  bg-pink-500 rounded-lg"

              disabled={loading}

              onClick={saveBasics}

            >

              {loading ? "Saving..." : "Save"}

            </Button>

            {product.visibility === "draft" ? (

              <Button

                className="rounded-lg bg-white text-black"

                disabled={loading}

                onClick={publish}

              >

                Publish

              </Button>

            ) : (

              <Button

                className="rounded-lg bg-white text-black"

                disabled={true}

              >

                Published

              </Button>

            )}

            <Button

              onClick={refreshAssetsOnly}

              className="text-black hover:bg-[#ff90e8] hover:text-black  bg-pink-500 rounded-lg"

            >

              Refresh Assets

            </Button>

            <Button

              onClick={deleteProduct}

              disabled={loading}

              className="rounded-lg bg-red-600 text-white hover:bg-red-700"

            >

              Delete

            </Button>

          </div>

        </div>

      </Card>



      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

        <Card className="rounded-md m-4 border border-border  p-4 md:p-5 bg-black text-white">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              {isCodeTemplate && <TabsTrigger value="code">Code Editor</TabsTrigger>}
              {isCodeTemplate && <TabsTrigger value="deliverables">Deliverables</TabsTrigger>}
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid gap-5">
                <div className="grid gap-2 ">
                  <div>Title</div>
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}

                placeholder="Title"

                className="h-10 rounded-lg bg-black shadown-none focus-visible:ring-0 focus-visible:ring-offset-0"

              />

            </div>



            <div className="grid gap-2">

              <div>Description</div>

              <Textarea

                value={description}

                onChange={(event) => setDescription(event.target.value)}

                placeholder="Description"

                className="h-32 rounded-lg bg-black shadown-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white"

              />

            </div>



            <div className="grid gap-2">

              <div>Price</div>

              <Input

                type="number"

                min={1}

                value={price}

                onChange={(event) => setPrice(Number(event.target.value))}

                placeholder="Price"

                className="h-10 rounded-lg bg-black text-white shadown-none focus-visible:ring-0 focus-visible:ring-offset-0"

              />

            </div>



            <div className="grid gap-2">

              <div>Category</div>

              <select

                value={templateKind}

                onChange={(e) => setTemplateKind(e.target.value)}

                className="h-10 rounded-lg bg-black text-white border border-border px-3"

              >

                <option value="">Select a category</option>

                {categories.map((cat) => (

                  <option key={cat.value} value={cat.value} className="bg-black text-white">

                    {cat.label}

                  </option>

                ))}

              </select>

            </div>



            <div className="grid gap-2">

              <div>Primary Tool/Framework</div>

              <select

                value={templateTool}

                onChange={(e) => setTemplateTool(e.target.value)}

                className="h-10 rounded-lg bg-black text-white border border-border px-3"

              >

                <option value="">Select primary tool</option>

                <option value="notion">Notion</option>

                <option value="figma">Figma</option>

                <option value="react">React</option>

                <option value="nextjs">Next.js</option>

                <option value="vue">Vue.js</option>

                <option value="angular">Angular</option>

                <option value="typescript">TypeScript</option>

                <option value="javascript">JavaScript</option>

                <option value="css">CSS</option>

                <option value="html">HTML</option>

                <option value="nodejs">Node.js</option>

                <option value="python">Python</option>

                <option value="framer">Framer Motion</option>

                <option value="tailwind">Tailwind CSS</option>

                <option value="other">Other</option>

                {/* AI Apps for AI Prompts Pack */}

                <option value="chatgpt">ChatGPT</option>

                <option value="claude">Claude</option>

                <option value="gemini">Google Gemini</option>

                <option value="copilot">GitHub Copilot</option>

                <option value="midjourney">Midjourney</option>

                <option value="dall-e">DALL-E</option>

                <option value="stable-diffusion">Stable Diffusion</option>

                <option value="perplexity">Perplexity</option>

                <option value="bard">Google Bard</option>

                <option value="huggingface">Hugging Face</option>

                <option value="openai-api">OpenAI API</option>

                <option value="anthropic-claude">Anthropic Claude</option>

              </select>

            </div>



            <div className="grid gap-2">

              <div>Install / usage instructions</div>

              <Textarea

                value={installInstructions}

                onChange={(e) => setInstallInstructions(e.target.value)}

                placeholder="How to use this template (steps, requirements, etc.)"

                className="h-28 rounded-lg bg-black shadown-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white"

              />

            </div>



            <div className="grid gap-3">

              <div className="flex items-center justify-between">

                <div>Deliverables (required to publish)</div>

                <Button

                  type="button"

                  className="bg-white text-black hover:bg-white"

                  onClick={() =>

                    setDeliverables((d) => [

                      ...d,

                      { label: "", url: "", kind: "link" },

                    ])

                  }

                >

                  + Add

                </Button>

              </div>



              {deliverables.length === 0 ? (

                <div className="text-sm text-white/70">

                  Add a Notion link, ZIP file link, or code resource link.

                </div>

              ) : (

                <div className="space-y-3">

                  {deliverables.map((d, idx) => (

                    <div

                      key={`del-${idx}`}

                      className="rounded-lg border border-border p-3 space-y-2"

                    >

                      <div className="grid gap-2 md:grid-cols-3">

                        <Input

                          value={d.label}

                          onChange={(e) =>

                            setDeliverables((prev) =>

                              prev.map((x, i) =>

                                i === idx ? { ...x, label: e.target.value } : x

                              )

                            )

                          }

                          placeholder="Label (e.g. Notion link, ZIP download)"

                          className="h-10 rounded-lg bg-black text-white shadown-none focus-visible:ring-0 focus-visible:ring-offset-0"

                        />

                        <Input

                          value={d.url}

                          onChange={(e) =>

                            setDeliverables((prev) =>

                              prev.map((x, i) =>

                                i === idx ? { ...x, url: e.target.value } : x

                              )

                            )

                          }

                          placeholder={d.kind === "file" ? "Upload file..." : "URL"}

                          className="h-10 rounded-lg bg-black text-white shadown-none focus-visible:ring-0 focus-visible:ring-offset-0 md:col-span-2"

                        />

                        {/* File Upload Input */}

                        {d.kind === "file" && (

                          <div className="mt-2">

                            <input

                              type="file"

                              onChange={async (e) => {

                                const file = e.target.files?.[0];

                                if (file) {

                                  const formData = new FormData();

                                  formData.append("file", file);

                                  formData.append("productId", productId);

                                  formData.append("label", d.label || "File");

                                  try {

                                    const response = await apiClient.post(

                                      `/api/creator/products/${productId}/upload-file`,

                                      formData,

                                      {

                                        headers: {

                                          "Content-Type": "multipart/form-data",

                                        },

                                      }

                                    );

                                    if (response.data?.ok) {

                                      setDeliverables((prev) =>

                                        prev.map((x, i) =>

                                          i === idx

                                            ? { ...x, url: response.data.fileUrl }

                                            : x

                                        )

                                      );

                                    }

                                  } catch (error) {

                                    console.error("File upload failed:", error);

                                  }

                                }

                              }}

                              className="h-10 rounded-lg bg-black text-white border border-border px-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600"

                            />

                          </div>

                        )}

                      </div>



                      <div className="flex items-center justify-between gap-2">

                        <select

                          value={d.kind}

                          onChange={(e) =>

                            setDeliverables((prev) =>

                              prev.map((x, i) =>

                                i === idx

                                  ? { ...x, kind: e.target.value as any }

                                  : x

                              )

                            )

                          }

                          className="h-10 rounded-lg bg-black text-white border border-border px-3"

                        >

                          <option value="link">Link</option>

                          <option value="file">File</option>

                          <option value="code">Code</option>

                        </select>



                        <Button

                          type="button"

                          className="bg-red-500 text-white hover:bg-red-500"

                          onClick={() =>

                            setDeliverables((prev) =>

                              prev.filter((_, i) => i !== idx)

                            )

                          }

                        >

                          Remove

                        </Button>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>
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
                    className="flex-1 h-10 rounded-lg border border-neutral-800 bg-neutral-950 text-white"
                  />
                  <Button
                    type="button"
                    onClick={addDependency}
                    className="h-10 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                  >
                    Add
                  </Button>
                </div>
                {dependencies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {dependencies.map((dep, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-800 text-neutral-300 rounded text-sm"
                      >
                        {dep}
                        <button
                          type="button"
                          onClick={() => removeDependency(dep)}
                          className="text-neutral-400 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Code Files */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Code Files</h3>
                <Button
                  type="button"
                  onClick={addCodeFile}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  + Add File
                </Button>
              </div>

              {codeFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-neutral-800 rounded-lg">
                  <p>No code files yet. Add your first file to get started.</p>
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
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        )}

        {/* Deliverables Tab */}
        {isCodeTemplate && (
          <TabsContent value="deliverables" className="space-y-6">
            <DeliverablesManager
              deliverables={componentDeliverables}
              onDeliverablesChange={handleDeliverablesChange}
              readOnly={false}
            />
          </TabsContent>
        )}
      </Tabs>
    </Card>

    {/* Right side - Cover Image, Google Image Search, and Preview Images */}
    <div className="space-y-6">
      {/* Cover Image */}
      <Card className="border border-border p-4 md:p-5 bg-black text-white m-4 rounded-lg">
        <div className="text-base font-medium">Cover Image</div>
        <div className="mt-4 overflow-hidden bg-background rounded-md shadow-md shadow-blue-500">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt="Cover image of the digital asset"
              className="h-64 w-full object-cover rounded-md"
            />
          ) : (
            <div className="p-4 text-sm bg-black text-white">
              No Cover set yet.
            </div>
          )}
        </div>
      </Card>

      {/* Google Image Search */}
      <Card className="border border-border p-4 md:p-5 bg-black text-white m-4 rounded-lg">
        <div className="text-base font-medium">Search Google Images</div>
        <GoogleImageSearch
          productId={productId}
          onImagesSelected={async () => {
            // Images are already imported by GoogleImageSearch component
            // Just refresh the assets to show the new images
            onRefresh();
          }}
        />
      </Card>

      {/* Preview Images */}
      <Card className="border border-border bg-black text-white p-4 md:p-5 rounded-lg m-4">
        <AssetsGrid
          assets={assets}
          title="Preview Images"
          emptyText="No preview images yet."
          actionLabel={(asset) => {
            const iscover =
              String(asset._id) === String(product.coverImageAssetId);
            return iscover ? "Cover" : "Set as cover";
          }}
          isActionActive={(asset) =>
            String(asset._id) === String(product.coverImageAssetId)
          }
          onAction={(asset) => setCover(asset._id)}
          onRemove={(asset) => removeAsset(asset)}
        />
      </Card>

      {/* AI Insights */}
      <div className="px-4 pb-4">
        <AIDashboard
          productId={productId}
          productTitle={product.title}
          productCategory={product.category}
          productFeatures={product.template?.features || product.aiPromptPack?.categories || []}
          productPrice={product.price}
          productDescription={product.description || ""}
          deliverables={product.deliverables || []}
        />
      </div>
    </div>
  </div>
    </div>
);
}

export default EditPanel;
