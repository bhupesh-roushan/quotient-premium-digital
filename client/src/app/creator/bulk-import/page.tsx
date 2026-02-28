"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Loader2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import CreatorSidebar from "@/components/creator/common/sidebar";
import { BackgroundBeams } from "@/components/ui/background-beams";

interface ValidationResult {
  index: number;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface ImportResult {
  index: number;
  productId?: string;
  title?: string;
  slug?: string;
  error?: string;
}

export default function BulkImportPage() {
  const [activeTab, setActiveTab] = useState<"json" | "csv">("json");
  const [jsonInput, setJsonInput] = useState("");
  const [csvInput, setCsvInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[] | null>(null);
  const [importResults, setImportResults] = useState<{
    successful: ImportResult[];
    failed: ImportResult[];
  } | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);

  const sampleTemplate = {
    products: [
      {
        title: "AI Marketing Prompt Pack",
        category: "ai-prompt-pack",
        price: 99,
        currency: "INR",
        description: "50+ AI prompts for marketing campaigns",
        visibility: "published",
        license: "Commercial Use",
        tags: ["ai", "marketing", "prompts"],
        deliverables: [
          { label: "Prompts PDF", kind: "file", filename: "prompts.pdf" }
        ],
        seo: {
          title: "AI Marketing Prompt Pack",
          description: "Boost your marketing with AI prompts",
          keywords: ["ai prompts", "marketing"],
          tags: ["ai", "marketing"]
        },
        page: {
          sections: [
            { heading: "Features", bullets: ["50+ prompts", "PDF format"] }
          ],
          pricingTiers: []
        }
      }
    ]
  };

  const csvTemplate = `title,category,price,currency,description,visibility,license,tags
echo "AI Marketing Prompt Pack,ai-prompt-pack,99,INR,50+ AI prompts for marketing,published,Commercial Use,ai;marketing
AI Sales Prompt Pack,ai-prompt-pack,79,INR,40+ sales prompts,published,Commercial Use,ai;sales`;

  const validateData = useCallback(async () => {
    setIsValidating(true);
    setValidationResults(null);
    
    try {
      let products;
      if (activeTab === "json") {
        const parsed = JSON.parse(jsonInput);
        products = parsed.products || parsed;
      } else {
        // Parse CSV
        const lines = csvInput.trim().split("\n");
        if (lines.length < 2) {
          toast.error("CSV must have header and data rows");
          setIsValidating(false);
          return;
        }
        
        const headers = lines[0].split(",").map(h => h.trim());
        products = lines.slice(1).map(line => {
          const values = line.split(",").map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, i) => {
            if (header === "tags") {
              obj[header] = values[i]?.split(";").map(t => t.trim()).filter(Boolean) || [];
            } else if (header === "price") {
              obj[header] = parseFloat(values[i]) || 0;
            } else {
              obj[header] = values[i];
            }
          });
          return obj;
        });
      }

      if (!Array.isArray(products) || products.length === 0) {
        toast.error("No valid products found");
        setIsValidating(false);
        return;
      }

      if (products.length > 50) {
        toast.error("Maximum 50 products allowed per import");
        setIsValidating(false);
        return;
      }

      const res = await fetch("/api/bulk-import/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ products }),
      });

      if (!res.ok) throw new Error("Validation failed");
      
      const data = await res.json();
      setValidationResults(data.results);
      
      const validCount = data.results.filter((r: ValidationResult) => r.valid).length;
      toast.success(`${validCount} of ${data.results.length} products are valid`);
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsValidating(false);
    }
  }, [activeTab, jsonInput, csvInput]);

  const handleImport = useCallback(async () => {
    if (!validationResults || validationResults.some(r => !r.valid)) {
      toast.error("Please validate and fix errors before importing");
      return;
    }

    setIsImporting(true);
    setImportResults(null);

    try {
      let products;
      if (activeTab === "json") {
        const parsed = JSON.parse(jsonInput);
        products = parsed.products || parsed;
      } else {
        const lines = csvInput.trim().split("\n");
        const headers = lines[0].split(",").map(h => h.trim());
        products = lines.slice(1).map(line => {
          const values = line.split(",").map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, i) => {
            if (header === "tags") {
              obj[header] = values[i]?.split(";").map(t => t.trim()).filter(Boolean) || [];
            } else if (header === "price") {
              obj[header] = parseFloat(values[i]) || 0;
            } else {
              obj[header] = values[i];
            }
          });
          return obj;
        });
      }

      const res = await fetch("/api/bulk-import/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ products }),
      });

      if (!res.ok) throw new Error("Import failed");
      
      const data = await res.json();
      setImportResults(data.results);
      
      toast.success(
        `Import complete: ${data.summary.successful} successful, ${data.summary.failed} failed`
      );
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsImporting(false);
    }
  }, [activeTab, jsonInput, csvInput, validationResults]);

  const downloadTemplate = (format: "json" | "csv") => {
    if (format === "json") {
      const blob = new Blob([JSON.stringify(sampleTemplate, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "import-template.json";
      a.click();
    } else {
      const blob = new Blob([csvTemplate], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "import-template.csv";
      a.click();
    }
  };

  return (
    <div className="flex h-screen flex-col lg:flex-row bg-black">
      <CreatorSidebar />
      <main className="flex-1 overflow-y-auto relative">
        <div className="min-h-screen bg-neutral-950 text-white p-6 pb-24 relative">
          <BackgroundBeams className="fixed inset-0 z-0" />
          <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Bulk Import Products</h1>
          <p className="text-white/60">Import multiple products at once using JSON or CSV</p>
        </motion.div>

        {/* Template Toggle */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader className="pb-2">
            <Button
              variant="ghost"
              onClick={() => setShowTemplate(!showTemplate)}
              className="flex items-center justify-between w-full bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white transition-all"
            >
              <span className="flex items-center gap-2">
                <Download size={18} /> Download Template
              </span>
              {showTemplate ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </Button>
          </CardHeader>
          {showTemplate && (
            <CardContent className="pt-0">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate("json")}
                  className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white transition-all"
                >
                  <FileJson size={18} className="mr-2" /> JSON Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate("csv")}
                  className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white transition-all"
                >
                  <FileSpreadsheet size={18} className="mr-2" /> CSV Template
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Format Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "json" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("json");
              setValidationResults(null);
              setImportResults(null);
            }}
              className={`gap-2 ${
                activeTab === "json"
                  ? "bg-neutral-800/50 backdrop-blur-sm border border-violet-500/50 text-white"
                  : "bg-neutral-900/30 backdrop-blur-sm border border-neutral-800 text-white hover:bg-neutral-800/50 hover:border-neutral-700"
              }`}
          >
            <FileJson size={18} /> JSON
          </Button>
          <Button
            variant={activeTab === "csv" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("csv");
              setValidationResults(null);
              setImportResults(null);
            }}
              className={`gap-2 ${
                activeTab === "csv"
                  ? "bg-neutral-800/50 backdrop-blur-sm border border-violet-500/50 text-white"
                  : "bg-neutral-900/30 backdrop-blur-sm border border-neutral-800 text-white hover:bg-neutral-800/50 hover:border-neutral-700"
              }`}
          >
            <FileSpreadsheet size={18} /> CSV
          </Button>
        </div>

        {/* Input Area */}
        <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-white">
              {activeTab === "json" ? "Paste JSON Data" : "Paste CSV Data"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={activeTab === "json" ? jsonInput : csvInput}
              onChange={(e) => activeTab === "json" ? setJsonInput(e.target.value) : setCsvInput(e.target.value)}
              placeholder={
                activeTab === "json"
                  ? '{"products": [{"title": "...", "category": "..."}]}'
                  : "title,category,price,description..."
              }
              className="w-full h-64 bg-black/30 border border-white/10 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-white/30"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={validateData}
            disabled={isValidating || (!jsonInput && !csvInput)}
            className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white transition-all disabled:opacity-50"
          >
            {isValidating ? (
              <><Loader2 className="animate-spin mr-2" size={18} /> Validating...</>
            ) : (
              <><CheckCircle size={18} className="mr-2" /> Validate</>
            )}
          </Button>
          <Button
            onClick={handleImport}
            disabled={isImporting || !validationResults || validationResults.some(r => !r.valid)}
            className="bg-neutral-800/50 backdrop-blur-sm border border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50 text-green-400 transition-all disabled:opacity-50"
          >
            {isImporting ? (
              <><Loader2 className="animate-spin mr-2" size={18} /> Importing...</>
            ) : (
              <><Upload size={18} className="mr-2" /> Import Products</>
            )}
          </Button>
        </div>

        {/* Validation Results */}
        {validationResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  Validation Results
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {validationResults.filter(r => r.valid).length} Valid
                  </Badge>
                  {validationResults.some(r => !r.valid) && (
                    <Badge className="bg-red-500/20 text-red-400">
                      {validationResults.filter(r => !r.valid).length} Invalid
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto">
                {validationResults.map((result) => (
                  <div
                    key={result.index}
                    className={`p-3 mb-2 rounded-lg border ${
                      result.valid
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-red-500/10 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {result.valid ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <XCircle size={16} className="text-red-400" />
                      )}
                      <span className="font-medium">Product #{result.index + 1}</span>
                    </div>
                    {result.errors.length > 0 && (
                      <div className="ml-6 text-sm text-red-400">
                        {result.errors.map((error, i) => (
                          <div key={i}>• {error}</div>
                        ))}
                      </div>
                    )}
                    {result.warnings.length > 0 && (
                      <div className="ml-6 text-sm text-yellow-400">
                        {result.warnings.map((warning, i) => (
                          <div key={i}>⚠ {warning}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Import Results */}
        {importResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  Import Results
                  <Badge className="bg-green-500/20 text-green-400">
                    {importResults.successful.length} Success
                  </Badge>
                  {importResults.failed.length > 0 && (
                    <Badge className="bg-red-500/20 text-red-400">
                      {importResults.failed.length} Failed
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto">
                {importResults.successful.map((result) => (
                  <div
                    key={result.index}
                    className="p-3 mb-2 rounded-lg bg-green-500/10 border border-green-500/30"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="font-medium">{result.title}</span>
                      <span className="text-white/40 text-sm">({result.slug})</span>
                    </div>
                  </div>
                ))}
                {importResults.failed.map((result) => (
                  <div
                    key={result.index}
                    className="p-3 mb-2 rounded-lg bg-red-500/10 border border-red-500/30"
                  >
                    <div className="flex items-center gap-2">
                      <XCircle size={16} className="text-red-400" />
                      <span>Product #{result.index + 1}</span>
                    </div>
                    <div className="ml-6 text-sm text-red-400">{result.error}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
        </div>
        </div>
      </main>
    </div>
  );
}
