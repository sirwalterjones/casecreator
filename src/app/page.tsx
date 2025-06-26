"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategorySelector from "@/components/CategorySelector";
import PostPreview from "@/components/PostPreview";
import PDFCustomizer from "@/components/PDFCustomizer";
import PDFGenerator from "@/components/PDFGenerator";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface Category {
  id: number;
  name: string;
  count: number;
  selected?: boolean;
}

interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  featuredImage?: string;
  attachments: Array<{
    id: number;
    title: string;
    url: string;
    type: string;
  }>;
}

export default function Home() {
  const [activeTab, setActiveTab] = React.useState("categories");
  const [selectedCategories, setSelectedCategories] = React.useState<
    Category[]
  >([]);
  const [selectedPosts, setSelectedPosts] = React.useState<number[]>([]);
  const [allPosts, setAllPosts] = React.useState<Post[]>([]);
  const [pdfSettings, setPdfSettings] = React.useState<any>({});
  const [siteUrl, setSiteUrl] = React.useState<string>("");

  const handleNextStep = () => {
    if (activeTab === "categories") setActiveTab("posts");
    else if (activeTab === "posts") setActiveTab("customize");
    else if (activeTab === "customize") setActiveTab("generate");
  };

  const handlePreviousStep = () => {
    if (activeTab === "posts") setActiveTab("categories");
    else if (activeTab === "customize") setActiveTab("posts");
    else if (activeTab === "generate") setActiveTab("customize");
  };

  return (
    <main className="min-h-screen bg-black p-6 md:p-10">
      <div className="container mx-auto max-w-7xl">
        {/* Header with Badge Design */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-4 shadow-2xl">
            <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl mb-2">
            CMANS Case File Generator
          </h1>
          <div className="text-yellow-400 font-semibold text-lg mb-2">
            Cherokee Multi-Agency Narcotics Squad
          </div>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Professional case file documentation system for law enforcement
            operations
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-full text-red-300 text-sm font-medium">
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            CONFIDENTIAL - LAW ENFORCEMENT USE ONLY
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-800/50 border border-slate-700 p-2 rounded-xl">
            <TabsTrigger
              value="categories"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 font-medium transition-all duration-200 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  1
                </div>
                Select Case Number
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="posts"
              disabled={selectedCategories.length === 0}
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 font-medium transition-all duration-200 rounded-lg disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-600 text-white text-xs flex items-center justify-center font-bold">
                  2
                </div>
                Preview Reports
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="customize"
              disabled={selectedPosts.length === 0}
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 font-medium transition-all duration-200 rounded-lg disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-600 text-white text-xs flex items-center justify-center font-bold">
                  3
                </div>
                Customize File
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="generate"
              disabled={Object.keys(pdfSettings).length === 0}
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 font-medium transition-all duration-200 rounded-lg disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-600 text-white text-xs flex items-center justify-center font-bold">
                  4
                </div>
                Generate File
              </div>
            </TabsTrigger>
          </TabsList>

          <Card className="border border-slate-700/50 shadow-2xl bg-slate-800/30 backdrop-blur-sm">
            <CardHeader className="pb-4 bg-gradient-to-r from-slate-800/50 to-blue-900/30 border-b border-slate-700/50">
              <CardTitle className="text-white text-xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  {activeTab === "categories" && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  )}
                  {activeTab === "posts" && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {activeTab === "customize" && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {activeTab === "generate" && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                {activeTab === "categories" && "Case Source Selection"}
                {activeTab === "posts" && "Case Report Preview"}
                {activeTab === "customize" && "Document Template Configuration"}
                {activeTab === "generate" && "Case File Generation"}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {activeTab === "categories" &&
                  "Select case number for case file compilation"}
                {activeTab === "posts" &&
                  "Review and select specific reports for inclusion in case file"}
                {activeTab === "customize" &&
                  "Configure document formatting and security parameters"}
                {activeTab === "generate" &&
                  "Generate secure case file documentation"}
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-slate-900/20">
              <TabsContent value="categories" className="mt-0">
                <CategorySelector
                  onCategoriesSelected={(categories, url) => {
                    setSelectedCategories(categories);
                    setSiteUrl(url);
                  }}
                />
              </TabsContent>

              <TabsContent value="posts" className="mt-0">
                <PostPreview
                  selectedCategories={selectedCategories}
                  siteUrl={siteUrl}
                  onSelectionChange={(posts) => setSelectedPosts(posts)}
                  onPostsLoaded={(posts) => setAllPosts(posts)}
                />
              </TabsContent>

              <TabsContent value="customize" className="mt-0">
                <PDFCustomizer
                  onSettingsChange={(settings) => setPdfSettings(settings)}
                />
              </TabsContent>

              <TabsContent value="generate" className="mt-0">
                <PDFGenerator
                  selectedPosts={allPosts.filter((post) =>
                    selectedPosts.includes(post.id),
                  )}
                  templateSettings={pdfSettings}
                  categoryName={
                    selectedCategories.length > 0
                      ? selectedCategories[0].name
                      : "wordpress-category"
                  }
                />
              </TabsContent>
            </CardContent>
          </Card>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={activeTab === "categories"}
              className="flex items-center gap-2 bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" /> Previous Step
            </Button>

            <Button
              onClick={handleNextStep}
              disabled={
                (activeTab === "categories" &&
                  selectedCategories.length === 0) ||
                (activeTab === "posts" && selectedPosts.length === 0) ||
                (activeTab === "customize" &&
                  Object.keys(pdfSettings).length === 0) ||
                activeTab === "generate"
              }
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              {activeTab !== "generate" ? (
                <>
                  Continue <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Download Case File
                </>
              )}
            </Button>
          </div>
        </Tabs>
      </div>
    </main>
  );
}
