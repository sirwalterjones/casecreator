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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronLeft, FileText, Users, Settings, Download, Lock, Shield } from "lucide-react";
import Image from "next/image";

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

// Password protection component
const PasswordProtection = ({ onAuthenticated }: { onAuthenticated: () => void }) => {
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "cmans600") {
      onAuthenticated();
    } else {
      setError("Invalid password. Please try again.");
      setPassword("");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23f1f5f9%22%20fill-opacity=%220.4%22%3E%3Ccircle%20cx=%227%22%20cy=%227%22%20r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border-b border-slate-200/50 p-6 sm:p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-xl mx-auto p-2 sm:p-3">
              <Image
                src="/images/cropped-newestcmanslogo.png"
                alt="CMANS Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            </div>
            
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
              Secure Access Required
            </CardTitle>
            <CardDescription className="text-slate-600 text-sm sm:text-base">
              Cherokee Multi-Agency Narcotics Squad<br />
              Case File Generator
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Access Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/70 border-slate-300 text-slate-800 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-base"
                />
                {error && (
                  <p className="text-sm text-red-600 mt-2">{error}</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 h-12 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 touch-manipulation active:scale-95"
              >
                Access System
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("categories");
  const [selectedCategories, setSelectedCategories] = React.useState<
    Category[]
  >([]);
  const [selectedPosts, setSelectedPosts] = React.useState<number[]>([]);
  const [allPosts, setAllPosts] = React.useState<Post[]>([]);
  const [pdfSettings, setPdfSettings] = React.useState<any>({});
  const [siteUrl, setSiteUrl] = React.useState<string>("");

  // Show password protection if not authenticated
  if (!isAuthenticated) {
    return <PasswordProtection onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const handleNextStep = () => {
    if (activeTab === "categories") setActiveTab("posts");
    else if (activeTab === "posts") {
      // Skip customization tab and go directly to generation
      // Set default PDF settings
      setPdfSettings({
        paperSize: "a4",
        orientation: "portrait",
        margins: 20,
        headerColor: "#000000",
        footerColor: "#000000",
        includeCoverPage: true,
        coverImage: null,
        coverTitle: "CHEROKEE MULTI-AGENCY NARCOTICS SQUAD",
        coverSubtitle: "OFFICIAL CASE FILE",
        coverDisclaimer: "The contents of this report have been generated for release to the requested prosecuting authority. The release of these documents has been approved by the Commander of CMANS or his/her designee. The copying or redistribution of these documents is strictly prohibited for non-official purposes. The reports in this document are in the order they were entered into the RMS system. This may result in the reports not being chronologically listed based on the date that events occurred. The Date field on each report represents the actual chronological order of events. BLANK PAGES NEVER CONTAINED CONTENT.",
        font: "Times New Roman",
        fontSize: 12,
        headerText: "CHEROKEE MULTI-AGENCY NARCOTICS SQUAD",
        footerText: "DO NOT RELEASE WITHOUT COMMANDER APPROVAL",
      });
      setActiveTab("generate");
    }
  };

  const handlePreviousStep = () => {
    if (activeTab === "posts") setActiveTab("categories");
    else if (activeTab === "generate") setActiveTab("posts");
  };

  const getStepProgress = () => {
    const steps = ["categories", "posts", "generate"];
    return ((steps.indexOf(activeTab) + 1) / steps.length) * 100;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23f1f5f9%22%20fill-opacity=%220.4%22%3E%3Ccircle%20cx=%227%22%20cy=%227%22%20r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
      <div className="relative z-10 container mx-auto max-w-6xl px-2 sm:px-4 py-4 sm:py-8">
        {/* Modern Header */}
        <header className="text-center mb-6 sm:mb-12">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => window.open('/access-logs', '_blank')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border-slate-300 text-slate-700 hover:bg-white hover:text-slate-900 rounded-lg shadow-lg transition-all duration-200"
            >
              <Shield className="h-4 w-4" />
              Access Logs
            </Button>
          </div>
          
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300 p-2 sm:p-3">
            <Image
              src="/images/cropped-newestcmanslogo.png"
              alt="CMANS Logo"
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 bg-clip-text text-transparent mb-2 sm:mb-4 px-2">
            Case File Generator
          </h1>
          
          <p className="text-sm sm:text-lg md:text-xl text-slate-600 mb-2 font-medium px-2">
            Cherokee Multi-Agency Narcotics Squad
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4 sm:mt-8 max-w-xs sm:max-w-md mx-auto px-4">
            <div className="flex justify-between text-xs sm:text-sm font-medium text-slate-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(getStepProgress())}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getStepProgress()}%` }}
              ></div>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Modern Tab Navigation */}
          <div className="mb-4 sm:mb-8 p-1 sm:p-2 bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20">
            <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 h-auto gap-1 sm:gap-2">
              <TabsTrigger
                value="categories"
                className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-6 rounded-lg sm:rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-600 hover:text-slate-800 transition-all duration-200 border-0"
              >
                <div className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-blue-100 data-[state=active]:bg-white/20">
                  <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 data-[state=active]:text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-xs sm:text-sm">Select Source</div>
                  <div className="text-xs opacity-70 hidden sm:block">Choose case data</div>
                </div>
              </TabsTrigger>
              
              <TabsTrigger
                value="posts"
                disabled={selectedCategories.length === 0}
                className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-6 rounded-lg sm:rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-600 hover:text-slate-800 transition-all duration-200 border-0 disabled:opacity-40"
              >
                <div className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-emerald-100 data-[state=active]:bg-white/20">
                  <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600 data-[state=active]:text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-xs sm:text-sm">Review Content</div>
                  <div className="text-xs opacity-70 hidden sm:block">Preview reports</div>
                </div>
              </TabsTrigger>
              
              
              <TabsTrigger
                value="generate"
                disabled={selectedPosts.length === 0}
                className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-6 rounded-lg sm:rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-600 hover:text-slate-800 transition-all duration-200 border-0 disabled:opacity-40"
              >
                <div className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-orange-100 data-[state=active]:bg-white/20">
                  <Download className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600 data-[state=active]:text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-xs sm:text-sm">Generate</div>
                  <div className="text-xs opacity-70 hidden sm:block">Create PDF</div>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content Card */}
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border-b border-slate-200/50 p-4 sm:p-8">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  {activeTab === "categories" && <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
                  {activeTab === "posts" && <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
                  {activeTab === "generate" && <Download className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 mb-1 truncate">
                    {activeTab === "categories" && "Source Selection"}
                    {activeTab === "posts" && "Content Review"}
                    {activeTab === "generate" && "File Generation"}
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-sm sm:text-base hidden sm:block">
                    {activeTab === "categories" && "Choose your case data source and select the case number"}
                    {activeTab === "posts" && "Review available reports and select which ones to include"}
                    {activeTab === "generate" && "Generate and download your professional case file"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-8">
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


              <TabsContent value="generate" className="mt-0">
                <PDFGenerator
                  selectedPosts={allPosts.filter((post) =>
                    selectedPosts.includes(post.id),
                  )}
                  templateSettings={Object.keys(pdfSettings).length > 0 ? pdfSettings : {
                    paperSize: "a4",
                    orientation: "portrait",
                    margins: 20,
                    headerColor: "#000000",
                    footerColor: "#000000",
                    includeCoverPage: true,
                    coverImage: null,
                    coverTitle: "CHEROKEE MULTI-AGENCY NARCOTICS SQUAD",
                    coverSubtitle: "OFFICIAL CASE FILE",
                    coverDisclaimer: "The contents of this report have been generated for release to the requested prosecuting authority. The release of these documents has been approved by the Commander of CMANS or his/her designee. The copying or redistribution of these documents is strictly prohibited for non-official purposes. The reports in this document are in the order they were entered into the RMS system. This may result in the reports not being chronologically listed based on the date that events occurred. The Date field on each report represents the actual chronological order of events. BLANK PAGES NEVER CONTAINED CONTENT.",
                    font: "Times New Roman",
                    fontSize: 12,
                    headerText: "CHEROKEE MULTI-AGENCY NARCOTICS SQUAD",
                    footerText: "DO NOT RELEASE WITHOUT COMMANDER APPROVAL",
                  }}
                  siteUrl={siteUrl}
                  categoryName={
                    selectedCategories.length > 0
                      ? selectedCategories[0].name
                      : "wordpress-category"
                  }
                />
              </TabsContent>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-8 gap-4 sm:gap-0 px-2 sm:px-0">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={activeTab === "categories"}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/70 backdrop-blur-sm border-slate-300 text-slate-700 hover:bg-white hover:text-slate-900 rounded-lg sm:rounded-xl shadow-lg transition-all duration-200 disabled:opacity-40 w-full sm:w-auto order-2 sm:order-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 order-1 sm:order-2">
              <span>Step {["categories", "posts", "generate"].indexOf(activeTab) + 1} of 3</span>
            </div>

            <Button
              onClick={handleNextStep}
              disabled={
                (activeTab === "categories" && selectedCategories.length === 0) ||
                (activeTab === "posts" && selectedPosts.length === 0) ||
                activeTab === "generate"
              }
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 w-full sm:w-auto order-3"
            >
              {activeTab !== "generate" ? (
                <>
                  Continue <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download File
                </>
              )}
            </Button>
          </div>
        </Tabs>
      </div>
    </main>
  );
}
