"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api/client";
import { Product, ProductCategory } from "@/lib/types/product";
import { 
  Sparkles, 
  TrendingUp, 
  Search, 
  FileText, 
  BarChart3, 
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Target,
  Zap,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface AIDashboardProps {
  productId: string;
  productTitle: string;
  productCategory: ProductCategory;
  productFeatures: string[];
  productPrice: number;
  productDescription: string;
  deliverables: Array<{
    label: string;
    kind: "link" | "file" | "code" | "structured";
  }>;
}

export function AIDashboard({
  productId,
  productTitle,
  productCategory,
  productFeatures,
  productPrice,
  productDescription,
  deliverables,
}: AIDashboardProps) {
  const [activeTab, setActiveTab] = useState("structure");
  const [loading, setLoading] = useState(false);
  const [usingAI, setUsingAI] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{
    structure?: any;
    seo?: any;
    content?: any;
    competitor?: any;
    trends?: any;
    comprehensive?: any;
  }>({});

  const isFallbackData = (data: any) => {
    if (!data) return true;
    const str = JSON.stringify(data);
    return str.includes('"Product Title"') || 
           str.includes('"Description here"') || 
           str.includes('"Point 1"') ||
           str.includes('"Short version"') ||
           str.includes('"Optimized description"');
  };

  const runSEOAnalysis = async () => {
    setLoading(true);
    try {
      const result = await apiClient.post("/api/ai/generate-seo", {
        title: productTitle,
        description: productDescription,
        category: productCategory,
        features: productFeatures,
        targetAudience: "creators"
      });

      if (result?.data?.ok) {
        setAnalysisResults(prev => ({ ...prev, seo: result.data }));
        setUsingAI(!isFallbackData(result.data));
      } else {
        console.error("Failed to run SEO analysis:", result.data?.error);
      }
    } catch (err) {
      console.error("Error running SEO analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  const runContentOptimization = async () => {
    setLoading(true);
    try {
      const result = await apiClient.post("/api/ai/optimize-content", {
        title: productTitle,
        description: productDescription,
        features: productFeatures,
        targetTone: "professional"
      });

      if (result?.data?.ok) {
        setAnalysisResults(prev => ({ ...prev, content: result.data }));
        setUsingAI(!isFallbackData(result.data));
      } else {
        console.error("Failed to run content optimization:", result.data?.error);
      }
    } catch (err) {
      console.error("Error running content optimization:", err);
    } finally {
      setLoading(false);
    }
  };

  const runStructureAnalysis = async () => {
    setLoading(true);
    try {
      const result = await apiClient.post("/api/ai/analyze-structure", {
        title: productTitle,
        description: productDescription,
        features: productFeatures,
        pricing: productPrice,
        deliverables
      });

      if (result?.data?.ok) {
        setAnalysisResults(prev => ({ ...prev, structure: result.data }));
        setUsingAI(!isFallbackData(result.data));
      } else {
        console.error("Failed to run structure analysis:", result.data?.error);
      }
    } catch (err) {
      console.error("Error running structure analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  const runCompetitorAnalysis = async () => {
    setLoading(true);
    try {
      const result = await apiClient.post("/api/ai/analyze-competitors", {
        urls: [], // Add competitor URLs here
        productCategory: productCategory
      });

      if (result?.data?.ok) {
        setAnalysisResults(prev => ({ ...prev, competitor: result.data }));
      } else {
        console.error("Failed to run competitor analysis:", result.data?.error);
      }
    } catch (err) {
      console.error("Error running competitor analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  const runTrendAnalysis = async () => {
    setLoading(true);
    try {
      const result = await apiClient.post("/api/ai/analyze-trends", {
        category: productCategory,
        timeframe: "30d"
      });

      if (result?.data?.ok) {
        setAnalysisResults(prev => ({ ...prev, trends: result.data }));
        setUsingAI(!isFallbackData(result.data));
      } else {
        console.error("Failed to run trend analysis:", result.data?.error);
      }
    } catch (err) {
      console.error("Error running trend analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  const runComprehensiveAnalysis = async () => {
    setLoading(true);
    try {
      const result = await apiClient.post("/api/ai/comprehensive-analysis", {
        title: productTitle,
        description: productDescription,
        category: productCategory,
        features: productFeatures,
        pricing: productPrice,
        deliverables,
        competitorUrls: [], // You can add competitor URLs here
        targetAudience: "creators"
      });

      console.log("Comprehensive analysis result:", result);

      if (result?.data?.ok) {
        setAnalysisResults({ comprehensive: result.data });
        setUsingAI(!isFallbackData(result.data));
      } else {
        console.error("Failed to run comprehensive analysis:", result.data?.error);
      }
    } catch (err) {
      console.error("Error running comprehensive analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  const ScoreRing = ({ score, label }: { score: number; label: string }) => {
    const getColor = (s: number) => {
      if (s >= 80) return "text-emerald-400";
      if (s >= 60) return "text-yellow-400";
      if (s >= 40) return "text-orange-400";
      return "text-red-400";
    };

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-neutral-800"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${score}, 100`}
              className={`${getColor(score)} transition-all duration-1000`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${getColor(score)}`}>{score}</span>
          </div>
        </div>
        <span className="text-sm text-neutral-400 mt-2">{label}</span>
      </div>
    );
  };

  const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <Card className={`bg-neutral-900/50 border-neutral-800 backdrop-blur-sm ${className}`}>
      {children}
    </Card>
  );

  const ActionButton = ({ onClick, loading: btnLoading, children, icon: Icon }: any) => (
    <Button 
      onClick={onClick} 
      disabled={btnLoading}
      className="w-full bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white transition-all disabled:opacity-50 h-12"
    >
      {btnLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Icon className="w-4 h-4 mr-2" />
      )}
      {children}
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center border border-violet-500/20">
            <Sparkles className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Intelligence Dashboard</h2>
            <p className="text-sm text-neutral-400">AI-powered insights for your product</p>
          </div>
        </div>
        {usingAI && (
          <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/30">
            <Zap className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 p-1 rounded-xl min-w-0">
          {[
            { id: "structure", label: "Structure", icon: BarChart3 },
            { id: "seo", label: "SEO", icon: Search },
            { id: "content", label: "Content", icon: FileText },
            { id: "trends", label: "Trends", icon: TrendingUp },
            { id: "comprehensive", label: "All Analysis", icon: Sparkles },
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center justify-center gap-1.5 rounded-lg data-[state=active]:bg-neutral-800/50 data-[state=active]:backdrop-blur-sm data-[state=active]:border data-[state=active]:border-violet-500/50 data-[state=active]:text-white text-neutral-400 transition-all hover:text-white py-2 px-1 text-xs sm:text-sm whitespace-nowrap overflow-hidden"
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          {/* Structure Analysis */}
          <TabsContent key="structure" value="structure" className="space-y-4">
            <GlassCard>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Product Structure Analysis</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Analyze your product structure, features, and overall quality score
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ActionButton 
                  onClick={runStructureAnalysis} 
                  loading={loading} 
                  icon={Sparkles}
                >
                  Analyze Structure
                </ActionButton>

                {analysisResults.structure && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-center">
                      <ScoreRing 
                        score={analysisResults.structure.optimizationScore} 
                        label="Optimization Score" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800">
                        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4 text-violet-400" />
                          Title Analysis
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Length:</span>
                            <span className="text-white capitalize">{analysisResults.structure.titleAnalysis?.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Clarity:</span>
                            <span className="text-white capitalize">{analysisResults.structure.titleAnalysis?.clarity}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800">
                        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-pink-400" />
                          Description Analysis
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Depth:</span>
                            <span className="text-white capitalize">{analysisResults.structure.descriptionAnalysis?.depth}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Clarity:</span>
                            <span className="text-white capitalize">{analysisResults.structure.descriptionAnalysis?.clarity}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {analysisResults.structure.recommendations?.length > 0 && (
                      <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/20">
                        <h4 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {analysisResults.structure.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-neutral-300">
                              <span className="text-yellow-400 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </GlassCard>
          </TabsContent>

          {/* SEO Analysis */}
          <TabsContent key="seo" value="seo" className="space-y-4">
            <GlassCard>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Search className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">SEO Analysis</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Generate SEO-optimized metadata and keywords
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ActionButton 
                  onClick={runSEOAnalysis} 
                  loading={loading} 
                  icon={Sparkles}
                >
                  Generate SEO
                </ActionButton>

                {analysisResults.seo && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800">
                        <h4 className="text-sm font-medium text-blue-400 mb-2">SEO Title</h4>
                        <p className="text-sm text-white">{analysisResults.seo.title}</p>
                      </div>
                      <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800">
                        <h4 className="text-sm font-medium text-blue-400 mb-2">Meta Description</h4>
                        <p className="text-sm text-white">{analysisResults.seo.description}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800">
                      <h4 className="text-sm font-medium text-blue-400 mb-3">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResults.seo.keywords?.map((keyword: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full border border-blue-500/20">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800">
                      <h4 className="text-sm font-medium text-blue-400 mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResults.seo.tags?.map((tag: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-violet-500/10 text-violet-400 text-sm rounded-full border border-violet-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </GlassCard>
          </TabsContent>

          {/* Content Optimization */}
          <TabsContent key="content" value="content" className="space-y-4">
            <GlassCard>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Content Optimization</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Optimize your product description and marketing content
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ActionButton 
                  onClick={runContentOptimization} 
                  loading={loading} 
                  icon={Sparkles}
                >
                  Optimize Content
                </ActionButton>

                {analysisResults.content && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800">
                      <h4 className="text-sm font-medium text-pink-400 mb-2">Optimized Description</h4>
                      <p className="text-sm text-white leading-relaxed">{analysisResults.content.optimized}</p>
                    </div>

                    <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800">
                      <h4 className="text-sm font-medium text-pink-400 mb-2">Short Version</h4>
                      <p className="text-sm text-white">{analysisResults.content.shortVersion}</p>
                    </div>

                    <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800">
                      <h4 className="text-sm font-medium text-pink-400 mb-3">Key Features</h4>
                      <ul className="space-y-2">
                        {analysisResults.content.bulletPoints?.map((bullet: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-white">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </GlassCard>
          </TabsContent>

          {/* Trends Analysis */}
          <TabsContent key="trends" value="trends" className="space-y-4">
            <GlassCard>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Market Trends Analysis</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Analyze current market trends for your product category
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ActionButton 
                  onClick={runTrendAnalysis} 
                  loading={loading} 
                  icon={Sparkles}
                >
                  Analyze Trends
                </ActionButton>

                {analysisResults.trends && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800 text-center">
                        <h4 className="text-sm text-neutral-400 mb-2">Market Saturation</h4>
                        <p className="text-lg font-semibold text-white capitalize">{analysisResults.trends.marketSaturation}</p>
                      </div>
                      <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800 text-center">
                        <h4 className="text-sm text-neutral-400 mb-2">Opportunity Score</h4>
                        <p className="text-lg font-semibold text-emerald-400">{analysisResults.trends.opportunityScore}/100</p>
                      </div>
                    </div>

                    <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800">
                      <h4 className="text-sm font-medium text-emerald-400 mb-3">Trending Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResults.trends.trendingTags?.map((tag: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-sm rounded-full border border-emerald-500/20">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800">
                      <h4 className="text-sm font-medium text-emerald-400 mb-3">Emerging Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResults.trends.emergingTopics?.map((topic: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-violet-500/10 text-violet-400 text-sm rounded-full border border-violet-500/20">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </GlassCard>
          </TabsContent>

          {/* Comprehensive Analysis */}
          <TabsContent key="comprehensive" value="comprehensive" className="space-y-4">
            <GlassCard>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center border border-violet-500/20">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Comprehensive Analysis</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Get a complete analysis of your product including all aspects
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ActionButton 
                  onClick={runComprehensiveAnalysis} 
                  loading={loading} 
                  icon={Sparkles}
                >
                  Run Full Analysis
                </ActionButton>

                {analysisResults.comprehensive && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-center">
                      <ScoreRing 
                        score={analysisResults.comprehensive.optimizationScore} 
                        label="Overall Score" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800">
                        <h4 className="text-sm font-medium text-violet-400 mb-2">SEO Analysis</h4>
                        <p className="text-sm text-white">{analysisResults.comprehensive.seo?.title}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {analysisResults.comprehensive.seo?.keywords?.slice(0, 3).map((kw: string, i: number) => (
                            <span key={i} className="text-xs text-neutral-400">#{kw}</span>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800">
                        <h4 className="text-sm font-medium text-pink-400 mb-2">Content Analysis</h4>
                        <p className="text-sm text-white">Tone: {analysisResults.comprehensive.content?.tone}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {analysisResults.comprehensive.content?.bulletPoints?.length} features identified
                        </p>
                      </div>

                      <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800">
                        <h4 className="text-sm font-medium text-blue-400 mb-2">Structure Analysis</h4>
                        <p className="text-sm text-white">Completeness: {analysisResults.comprehensive.structure?.completenessScore}/100</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {analysisResults.comprehensive.structure?.featureCount} features analyzed
                        </p>
                      </div>

                      <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800">
                        <h4 className="text-sm font-medium text-emerald-400 mb-2">Market Trends</h4>
                        <p className="text-sm text-white">Saturation: {analysisResults.comprehensive.trends?.marketSaturation}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          Opportunity: {analysisResults.comprehensive.trends?.opportunityScore}/100
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </GlassCard>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

export default AIDashboard;
