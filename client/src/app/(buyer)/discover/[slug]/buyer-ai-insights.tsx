"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { Loader2, TrendingUp, Star, Target, Lightbulb, CheckCircle, AlertCircle, Minimize2, Maximize2, X } from "lucide-react";

interface BuyerAIInsightsProps {
  product: {
    title: string;
    description: string;
    category?: string;
    features?: string[];
    price: number;
  };
}

interface AIInsights {
  valueAnalysis?: {
    score: number;
    strengths: string[];
    considerations: string[];
    priceComparison: string;
  };
  qualityAssessment?: {
    overallRating: string;
    features: string[];
    benefits: string[];
    completeness: string;
  };
  useCases?: {
    primary: string[];
    secondary: string[];
    targetAudience: string[];
  };
  recommendation?: {
    shouldBuy: boolean;
    confidence: number;
    reasoning: string;
    alternatives: string[];
  };
}

export function BuyerAIInsights({ product }: BuyerAIInsightsProps) {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post("/api/ai/buyer-analysis", {
        title: product.title,
        description: product.description,
        category: product.category || "general",
        features: product.features || [],
        price: product.price,
      });

      if (response.data?.ok) {
        setInsights(response.data);
        setIsClosed(false);
      } else {
        setError("Failed to generate insights");
      }
    } catch (err) {
      console.error("Error generating AI insights:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRecommendationIcon = (shouldBuy: boolean) => {
    return shouldBuy ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };

  if (isClosed) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            AI Product Insights
          </h3>
          <Button onClick={() => setIsClosed(false)} className="flex items-center gap-2 cursor-pointer">
            <Lightbulb className="w-4 h-4" />
            Show Insights
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          AI Product Insights
        </h3>
        <div className="flex items-center gap-2">
          {insights && (
            <Button
              onClick={() => setIsMinimized(!isMinimized)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 cursor-pointer"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              {isMinimized ? "Expand" : "Minimize"}
            </Button>
          )}
          <Button
            onClick={() => setIsClosed(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
            Close
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </Card>
      )}

      {loading && (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Analyzing product...</span>
          </div>
        </Card>
      )}

      {insights && !isMinimized && (
        <div className="space-y-4">
          {/* Scrollable container for AI insights */}
          <div className="max-h-96 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {/* Recommendation */}
            {insights.recommendation && (
              <Card className="p-6">
                <div className="flex items-start gap-3">
                  {getRecommendationIcon(insights.recommendation.shouldBuy)}
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">
                      {insights.recommendation.shouldBuy ? "Recommended" : "Consider Carefully"}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">{insights.recommendation.reasoning}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        insights.recommendation.shouldBuy 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {insights.recommendation.confidence}% Confidence
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Value Analysis */}
            {insights.valueAnalysis && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5" />
                  <h4 className="font-semibold">Value Analysis</h4>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(insights.valueAnalysis.score)}`}>
                    {insights.valueAnalysis.score}/100
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-green-600 mb-1">Strengths:</h5>
                    <ul className="text-sm space-y-1">
                      {insights.valueAnalysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-yellow-600 mb-1">Considerations:</h5>
                    <ul className="text-sm space-y-1">
                      {insights.valueAnalysis.considerations.map((consideration, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 text-yellow-600 mt-0.5 shrink-0" />
                          {consideration}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <p className="text-sm text-gray-600 italic">{insights.valueAnalysis.priceComparison}</p>
                </div>
              </Card>
            )}

            {/* Quality Assessment */}
            {insights.qualityAssessment && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5" />
                  <h4 className="font-semibold">Quality Assessment</h4>
                  <div className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {insights.qualityAssessment.overallRating}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium mb-1">Key Features:</h5>
                    <ul className="text-sm space-y-1">
                      {insights.qualityAssessment.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-blue-600 mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-1">Benefits:</h5>
                    <ul className="text-sm space-y-1">
                      {insights.qualityAssessment.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="w-3 h-3 text-green-600 mt-0.5 shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <p className="text-sm text-gray-600">{insights.qualityAssessment.completeness}</p>
                </div>
              </Card>
            )}

            {/* Use Cases */}
            {insights.useCases && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5" />
                  <h4 className="font-semibold">Best Use Cases</h4>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium mb-1">Primary Use Cases:</h5>
                    <div className="flex flex-wrap gap-1">
                      {insights.useCases.primary.map((useCase, index) => (
                        <div key={index} className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {useCase}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-1">Secondary Use Cases:</h5>
                    <div className="flex flex-wrap gap-1">
                      {insights.useCases.secondary.map((useCase, index) => (
                        <div key={index} className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {useCase}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-1">Target Audience:</h5>
                    <div className="flex flex-wrap gap-1">
                      {insights.useCases.targetAudience.map((audience, index) => (
                        <div key={index} className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          {audience}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Refresh button outside scrollable area */}
          <Button onClick={generateInsights} disabled={loading} variant="outline" className="w-full cursor-pointer">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Refresh Analysis
          </Button>
        </div>
      )}

      {!insights && !loading && (
        <Button onClick={generateInsights} disabled={loading} className="flex items-center gap-2 cursor-pointer">
          {loading && <Loader2 className="w-4 h-4 animate-spin " />}
          Analyze Product
        </Button>
      )}
    </div>
  );
}
