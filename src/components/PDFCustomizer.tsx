"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  FileUp,
  Image as ImageIcon,
  Layout,
  Type,
  Palette,
} from "lucide-react";

interface PDFCustomizerProps {
  onSettingsChange?: (settings: PDFSettings) => void;
  onPreview?: () => void;
}

interface PDFSettings {
  paperSize: string;
  orientation: string;
  margins: number;
  headerColor: string;
  footerColor: string;
  includeCoverPage: boolean;
  coverImage: File | null;
  coverTitle: string;
  coverSubtitle: string;
  coverDisclaimer: string;
  font: string;
  fontSize: number;
  headerText: string;
  footerText: string;
}

const PDFCustomizer: React.FC<PDFCustomizerProps> = ({
  onSettingsChange = () => {},
  onPreview = () => {},
}) => {
  const [settings, setSettings] = useState<PDFSettings>({
    paperSize: "a4",
    orientation: "portrait",
    margins: 20,
    headerColor: "#000000",
    footerColor: "#000000",
    includeCoverPage: true,
    coverImage: null,
    coverTitle: "CHEROKEE MULTI-AGENCY NARCOTICS SQUAD",
    coverSubtitle: "OFFICIAL CASE FILE",
    coverDisclaimer:
      "The contents of this report have been generated for release to the requested prosecuting authority. The release of these documents has been approved by the Commander of CMANS or his/her designee. The copying or redistribution of these documents is strictly prohibited for non-official purposes. The reports in this document are in the order they were entered into the RMS system. This may result in the reports not being chronologically listed based on the date that events occurred. The Date field on each report represents the actual chronological order of events. BLANK PAGES NEVER CONTAINED CONTENT.",
    font: "Times New Roman",
    fontSize: 12,
    headerText: "CHEROKEE MULTI-AGENCY NARCOTICS SQUAD",
    footerText: "DO NOT RELEASE WITHOUT COMMANDER APPROVAL",
  });

  const [activeTab, setActiveTab] = useState("layout");


  const handleSettingChange = <K extends keyof PDFSettings>(
    key: K,
    value: PDFSettings[K],
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };



  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-white border-slate-200 shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200/50 p-6">
          <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 2v8H4V6h12z" />
            </svg>
            PDF Template Customization
          </CardTitle>
          <CardDescription className="text-slate-600">
            Customize the appearance and layout of your PDF document
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 mb-6 bg-slate-100">
              <TabsTrigger value="layout" className="flex items-center gap-2 text-slate-700 data-[state=active]:text-white">
                <Layout className="h-4 w-4" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="cover" className="flex items-center gap-2 text-slate-700 data-[state=active]:text-white">
                <FileUp className="h-4 w-4" />
                Cover Page
              </TabsTrigger>
              <TabsTrigger value="colors" className="flex items-center gap-2 text-slate-700 data-[state=active]:text-white">
                <Palette className="h-4 w-4" />
                Colors
              </TabsTrigger>
              <TabsTrigger
                value="typography"
                className="flex items-center gap-2 text-slate-700 data-[state=active]:text-white"
              >
                <Type className="h-4 w-4" />
                Typography
              </TabsTrigger>
            </TabsList>

            <TabsContent value="layout" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="paperSize" className="text-slate-700 font-medium">Paper Size</Label>
                  <Select
                    value={settings.paperSize}
                    onValueChange={(value) =>
                      handleSettingChange("paperSize", value)
                    }
                  >
                    <SelectTrigger id="paperSize" className="text-slate-900">
                      <SelectValue placeholder="Select paper size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="tabloid">Tabloid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orientation" className="text-slate-700 font-medium">Orientation</Label>
                  <Select
                    value={settings.orientation}
                    onValueChange={(value) =>
                      handleSettingChange("orientation", value)
                    }
                  >
                    <SelectTrigger id="orientation" className="text-slate-900">
                      <SelectValue placeholder="Select orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="margins" className="text-slate-700 font-medium">Margins (mm)</Label>
                  <span className="text-sm text-slate-600">
                    {settings.margins}mm
                  </span>
                </div>
                <Slider
                  id="margins"
                  min={0}
                  max={50}
                  step={1}
                  value={[settings.margins]}
                  onValueChange={(value) =>
                    handleSettingChange("margins", value[0])
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="cover" className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeCoverPage"
                  checked={settings.includeCoverPage}
                  onCheckedChange={(checked) =>
                    handleSettingChange("includeCoverPage", checked)
                  }
                />
                <Label htmlFor="includeCoverPage" className="text-slate-700 font-medium">Include cover page</Label>
              </div>

              {settings.includeCoverPage && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="coverTitle" className="text-slate-700 font-medium">Cover Title</Label>
                    <Input
                      id="coverTitle"
                      value={settings.coverTitle}
                      onChange={(e) =>
                        handleSettingChange("coverTitle", e.target.value)
                      }
                      className="text-slate-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverSubtitle" className="text-slate-700 font-medium">Cover Subtitle</Label>
                    <Input
                      id="coverSubtitle"
                      value={settings.coverSubtitle}
                      onChange={(e) =>
                        handleSettingChange("coverSubtitle", e.target.value)
                      }
                      className="text-slate-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverDisclaimer" className="text-slate-700 font-medium">Cover Disclaimer</Label>
                    <Textarea
                      id="coverDisclaimer"
                      value={settings.coverDisclaimer}
                      onChange={(e) =>
                        handleSettingChange("coverDisclaimer", e.target.value)
                      }
                      placeholder="Enter disclaimer text that will appear below the cover image"
                      rows={3}
                      className="text-slate-900 placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Cover Image</Label>
                    <div className="flex items-center justify-center w-full h-40 border rounded-md bg-muted/20">
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <ImageIcon className="h-10 w-10 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">
                          Default CMANS Logo
                        </p>
                        <p className="text-xs text-slate-500">
                          (Cannot be changed)
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="colors" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="headerColor" className="text-slate-700 font-medium">Header Color</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-md border"
                      style={{ backgroundColor: settings.headerColor }}
                    />
                    <Input
                      id="headerColor"
                      type="color"
                      value={settings.headerColor}
                      onChange={(e) =>
                        handleSettingChange("headerColor", e.target.value)
                      }
                      className="w-full h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerColor" className="text-slate-700 font-medium">Footer Color</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-md border"
                      style={{ backgroundColor: settings.footerColor }}
                    />
                    <Input
                      id="footerColor"
                      type="color"
                      value={settings.footerColor}
                      onChange={(e) =>
                        handleSettingChange("footerColor", e.target.value)
                      }
                      className="w-full h-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="headerText" className="text-slate-700 font-medium">Header Text</Label>
                  <Input
                    id="headerText"
                    value={settings.headerText}
                    onChange={(e) =>
                      handleSettingChange("headerText", e.target.value)
                    }
                    placeholder="Custom header text"
                    className="text-slate-900 placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerText" className="text-slate-700 font-medium">Footer Text</Label>
                  <Input
                    id="footerText"
                    value={settings.footerText}
                    onChange={(e) =>
                      handleSettingChange("footerText", e.target.value)
                    }
                    placeholder="Use {pageNumber} and {totalPages} for page numbers"
                    className="text-slate-900 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="p-4 border rounded-md">
                <div
                  className="h-12"
                  style={{ backgroundColor: settings.headerColor }}
                />
                <div className="h-40 bg-white border-x p-4">
                  <p className="text-center text-slate-600">
                    Document content preview
                  </p>
                </div>
                <div
                  className="h-8"
                  style={{ backgroundColor: settings.footerColor }}
                />
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="font" className="text-slate-700 font-medium">Font Family</Label>
                  <Select
                    value={settings.font}
                    onValueChange={(value) =>
                      handleSettingChange("font", value)
                    }
                  >
                    <SelectTrigger id="font" className="text-slate-900">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Times New Roman">
                        Times New Roman
                      </SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="fontSize" className="text-slate-700 font-medium">Font Size (pt)</Label>
                    <span className="text-sm text-slate-600">
                      {settings.fontSize}pt
                    </span>
                  </div>
                  <Slider
                    id="fontSize"
                    min={8}
                    max={24}
                    step={1}
                    value={[settings.fontSize]}
                    onValueChange={(value) =>
                      handleSettingChange("fontSize", value[0])
                    }
                  />
                </div>
              </div>

              <div className="p-6 border rounded-md bg-white">
                <p
                  className="mb-4 text-slate-800"
                  style={{
                    fontFamily: settings.font,
                    fontSize: `${settings.fontSize}px`,
                  }}
                >
                  Sample text with {settings.font} font at {settings.fontSize}pt
                </p>
                <p
                  className="text-slate-700"
                  style={{
                    fontFamily: settings.font,
                    fontSize: `${settings.fontSize * 0.9}px`,
                  }}
                >
                  This is how your body text will appear in the generated PDF
                  document. The font and size settings will be applied to all
                  text content from your WordPress posts.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <Separator className="my-2" />

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() =>
              setSettings({
                paperSize: "a4",
                orientation: "portrait",
                margins: 20,
                headerColor: "#000000",
                footerColor: "#000000",
                includeCoverPage: true,
                coverImage: null,
                coverTitle: "CHEROKEE MULTI-AGENCY NARCOTICS SQUAD",
                coverSubtitle: "OFFICIAL CASE FILE",
                      coverDisclaimer:
        "The contents of this report have been generated for release to the requested prosecuting authority. The release of these documents has been approved by the Commander of CMANS or his/her designee. The copying or redistribution of these documents is strictly prohibited for non-official purposes. The reports in this document are in the order they were entered into the RMS system. This may result in the reports not being chronologically listed based on the date that events occurred. The Date field on each report represents the actual chronological order of events. BLANK PAGES NEVER CONTAINED CONTENT.",
                font: "Times New Roman",
                fontSize: 12,
                headerText: "CHEROKEE MULTI-AGENCY NARCOTICS SQUAD",
                footerText: "DO NOT RELEASE WITHOUT COMMANDER APPROVAL",
              })
            }
          >
            Reset to Default
          </Button>
          <Button onClick={onPreview}>Preview PDF</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PDFCustomizer;
