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
  Upload,
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
      "This document contains confidential information. Distribution is restricted to authorized personnel only.",
    font: "Times New Roman",
    fontSize: 12,
    headerText: "CHEROKEE MULTI-AGENCY NARCOTICS SQUAD",
    footerText: "DO NOT RELEASE WITHOUT COMMANDER APPROVAL",
  });

  const [activeTab, setActiveTab] = useState("layout");
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null,
  );

  const handleSettingChange = <K extends keyof PDFSettings>(
    key: K,
    value: PDFSettings[K],
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      handleSettingChange("coverImage", file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-background">
      <Card>
        <CardHeader>
          <CardTitle>PDF Template Customization</CardTitle>
          <CardDescription>
            Customize the appearance and layout of your PDF document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="layout" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="cover" className="flex items-center gap-2">
                <FileUp className="h-4 w-4" />
                Cover Page
              </TabsTrigger>
              <TabsTrigger value="colors" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Colors
              </TabsTrigger>
              <TabsTrigger
                value="typography"
                className="flex items-center gap-2"
              >
                <Type className="h-4 w-4" />
                Typography
              </TabsTrigger>
            </TabsList>

            <TabsContent value="layout" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="paperSize">Paper Size</Label>
                  <Select
                    value={settings.paperSize}
                    onValueChange={(value) =>
                      handleSettingChange("paperSize", value)
                    }
                  >
                    <SelectTrigger id="paperSize">
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
                  <Label htmlFor="orientation">Orientation</Label>
                  <Select
                    value={settings.orientation}
                    onValueChange={(value) =>
                      handleSettingChange("orientation", value)
                    }
                  >
                    <SelectTrigger id="orientation">
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
                  <Label htmlFor="margins">Margins (mm)</Label>
                  <span className="text-sm text-muted-foreground">
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
                <Label htmlFor="includeCoverPage">Include cover page</Label>
              </div>

              {settings.includeCoverPage && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="coverTitle">Cover Title</Label>
                    <Input
                      id="coverTitle"
                      value={settings.coverTitle}
                      onChange={(e) =>
                        handleSettingChange("coverTitle", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverSubtitle">Cover Subtitle</Label>
                    <Input
                      id="coverSubtitle"
                      value={settings.coverSubtitle}
                      onChange={(e) =>
                        handleSettingChange("coverSubtitle", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverDisclaimer">Cover Disclaimer</Label>
                    <Textarea
                      id="coverDisclaimer"
                      value={settings.coverDisclaimer}
                      onChange={(e) =>
                        handleSettingChange("coverDisclaimer", e.target.value)
                      }
                      placeholder="Enter disclaimer text that will appear below the cover image"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverImage">Cover Image</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-center w-full h-40 border-2 border-dashed rounded-md border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer relative">
                          <input
                            type="file"
                            id="coverImage"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleCoverImageChange}
                          />
                          <div className="flex flex-col items-center justify-center text-center p-4">
                            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center w-full h-40 border rounded-md bg-muted/20">
                        {coverImagePreview ? (
                          <img
                            src={coverImagePreview}
                            alt="Cover preview"
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-4">
                            <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Image preview
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="colors" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="headerColor">Header Color</Label>
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
                  <Label htmlFor="footerColor">Footer Color</Label>
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
                  <Label htmlFor="headerText">Header Text</Label>
                  <Input
                    id="headerText"
                    value={settings.headerText}
                    onChange={(e) =>
                      handleSettingChange("headerText", e.target.value)
                    }
                    placeholder="Custom header text"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerText">Footer Text</Label>
                  <Input
                    id="footerText"
                    value={settings.footerText}
                    onChange={(e) =>
                      handleSettingChange("footerText", e.target.value)
                    }
                    placeholder="Use {pageNumber} and {totalPages} for page numbers"
                  />
                </div>
              </div>

              <div className="p-4 border rounded-md">
                <div
                  className="h-12"
                  style={{ backgroundColor: settings.headerColor }}
                />
                <div className="h-40 bg-white border-x p-4">
                  <p className="text-center text-muted-foreground">
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
                  <Label htmlFor="font">Font Family</Label>
                  <Select
                    value={settings.font}
                    onValueChange={(value) =>
                      handleSettingChange("font", value)
                    }
                  >
                    <SelectTrigger id="font">
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
                    <Label htmlFor="fontSize">Font Size (pt)</Label>
                    <span className="text-sm text-muted-foreground">
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

              <div className="p-6 border rounded-md">
                <p
                  className="mb-4"
                  style={{
                    fontFamily: settings.font,
                    fontSize: `${settings.fontSize}px`,
                  }}
                >
                  Sample text with {settings.font} font at {settings.fontSize}pt
                </p>
                <p
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
                  "This document contains confidential information. Distribution is restricted to authorized personnel only.",
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
