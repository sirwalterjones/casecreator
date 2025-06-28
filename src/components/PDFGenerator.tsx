"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";

interface Attachment {
  id: number;
  title: string;
  url: string;
  type: string;
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

interface PDFGeneratorProps {
  selectedPosts?: Array<{
    id: number;
    title: string;
    content: string;
    featuredImage?: string;
    attachments?: Attachment[];
    date?: string;
    excerpt?: string;
  }>;
  templateSettings?: PDFSettings;
  categoryName?: string;
  siteUrl?: string;
  onGenerationComplete?: (pdfUrl: string) => void;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  selectedPosts = [],
  templateSettings = {
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
  },
  categoryName = "",
  siteUrl = "",
  onGenerationComplete = () => {},
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState("");

  // Helper function to convert hex color to RGB for jsPDF
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  // Check if text is a field label that should be bolded
  const isFieldLabel = (text: string): boolean => {
    const trimmedText = text.trim();
    return (
      trimmedText === 'Date of Report' ||
      trimmedText === 'Time of Report' ||
      trimmedText === 'Incident Location' ||
      trimmedText === 'Report Title' ||
      trimmedText === 'Narrative' ||
      trimmedText === 'Attachments' ||
      trimmedText === 'ATTACHMENTS' ||
      trimmedText === 'Submitting Agent' ||
      trimmedText === 'Approving Supervisor' ||
      trimmedText === 'Approving Commander' ||
      trimmedText.endsWith(':')
    );
  };

  // Extract Report Title from post content
  const extractReportTitle = (content: string): string | null => {
    try {
      // Create a temporary div to parse HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      // Look for "Report Title" field in various formats
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      // Try different patterns to find Report Title
      const patterns = [
        /Report Title[:\s]*([^\n\r]+)/i,
        /Report Title Cell Phone[:\s]*([^\n\r]+)/i,
        /Report Title:\s*([^\n\r]+)/i,
        /Report Title\s+([^\n\r]+)/i
      ];
      
      for (const pattern of patterns) {
        const match = textContent.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      
      // Also try to find it in HTML structure
      const allElements = tempDiv.querySelectorAll('*');
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        const text = element.textContent || '';
        if (text.toLowerCase().includes('report title')) {
          const nextSibling = element.nextElementSibling;
          if (nextSibling && nextSibling.textContent) {
            const reportTitle = nextSibling.textContent.trim();
            if (reportTitle && reportTitle.length > 0 && reportTitle.length < 200) {
              return reportTitle;
            }
          }
          
          // Try to extract from the same element
          const afterReportTitle = text.substring(text.toLowerCase().indexOf('report title') + 12);
          const cleaned = afterReportTitle.replace(/^[:\s]*/, '').split('\n')[0].trim();
          if (cleaned && cleaned.length > 0 && cleaned.length < 200) {
            return cleaned;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Error extracting report title:', error);
      return null;
    }
  };

  // Enhanced HTML content parser
  const parseHtmlContent = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    
    const content: Array<{
      type: 'paragraph' | 'heading' | 'list' | 'label';
      text: string;
      level?: number;
      style?: 'bold' | 'italic' | 'normal';
      centered?: boolean;
    }> = [];

    // First, try to split by line breaks to catch standalone field labels
    const lines = html.split(/\n|<br\s*\/?>/i).map(line => line.trim()).filter(line => line);
    
    for (const line of lines) {
      // Remove HTML tags but preserve special characters and numbers
      const cleanText = line.replace(/<[^>]*>/g, '').trim();
      
      // Decode HTML entities to handle special characters properly
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cleanText;
      const decodedText = tempDiv.textContent || tempDiv.innerText || cleanText;
      
      // Filter out date-like patterns that appear to be case numbers or IDs
      const isDateLikePattern = /^\d{2}-\d{4}-\d{2}-\d{2}$/.test(decodedText.trim());
      
      // Filter out horizontal lines and separators
      const isHorizontalLine = /^[-_=]{3,}$/.test(decodedText.trim()) || 
                               decodedText.trim() === '' ||
                               /^[\s\-_=]*$/.test(decodedText);
      
      if (decodedText && !isDateLikePattern && !isHorizontalLine) {
        if (isFieldLabel(decodedText)) {
          content.push({
            type: 'label',
            text: decodedText,
            style: 'bold'
          });
        } else {
          // Check if it's a heading
          if (line.match(/<h[1-6][^>]*>/i)) {
            const level = parseInt(line.match(/<h([1-6])[^>]*>/i)?.[1] || '1');
            content.push({
              type: 'heading',
              text: decodedText,
              level,
              centered: level <= 3,
              style: 'bold'
            });
          } else {
            content.push({
              type: 'paragraph',
              text: decodedText,
              style: 'normal'
            });
          }
        }
      }
    }

    // If no content found from line parsing, fall back to DOM parsing
    if (content.length === 0) {
      const walkNodes = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text) {
            content.push({
              type: isFieldLabel(text) ? 'label' : 'paragraph',
              text,
              style: isFieldLabel(text) ? 'bold' : 'normal'
            });
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const tagName = element.tagName.toLowerCase();
          const text = element.textContent?.trim() || '';

          switch (tagName) {
            case 'h1':
            case 'h2':
            case 'h3':
              const level = parseInt(tagName.charAt(1));
              content.push({
                type: 'heading',
                text,
                level,
                centered: true,
                style: 'bold'
              });
              break;
              
            case 'h4':
            case 'h5':
            case 'h6':
              content.push({
                type: 'heading',
                text,
                level: parseInt(tagName.charAt(1)),
                style: 'bold'
              });
              break;
              
            case 'p':
              if (text) {
                content.push({
                  type: isFieldLabel(text) ? 'label' : 'paragraph',
                  text,
                  style: isFieldLabel(text) ? 'bold' : 'normal'
                });
              }
              break;
              
            case 'ul':
            case 'ol':
              const listItems = element.querySelectorAll('li');
              listItems.forEach(li => {
                const liText = li.textContent?.trim();
                if (liText) {
                  content.push({
                    type: 'list',
                    text: liText
                  });
                }
              });
              break;
              
            case 'hr':
              // Skip horizontal rule elements completely
              break;
              
            default:
              // For other elements, process child nodes
              Array.from(element.childNodes).forEach(walkNodes);
          }
        }
      };

      Array.from(div.childNodes).forEach(walkNodes);
    }
    
    return content;
  };

  // Function to parse HTML attachments and extract clean filename and URL
  const parseAttachment = (attachment: Attachment): { filename: string; url: string } => {
    let filename = attachment.title;
    let url = attachment.url;
    
    // Check if title contains HTML (like <a href="url">filename</a>)
    if (attachment.title && attachment.title.includes('<a')) {
      try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = attachment.title;
        const linkElement = tempDiv.querySelector('a');
        
        if (linkElement) {
          filename = linkElement.textContent?.trim() || 'Attachment';
          const href = linkElement.getAttribute('href');
          if (href) {
            url = href;
          }
        }
      } catch (e) {
        console.warn('Failed to parse HTML attachment:', e);
      }
    }
    
    // Clean up the filename
    if (filename) {
      // Remove parenthetical content like "(path/to/file)"
      filename = filename.replace(/\s*\([^)]*\)/g, '');
      
      // If still has path separators, extract just the filename
      if (filename.includes('/')) {
        const parts = filename.split('/');
        filename = parts[parts.length - 1] || filename;
      }
    }
    
    // If we still don't have a clean filename, try extracting from URL
    if (!filename || filename.includes('/')) {
      const urlParts = url.split('/');
      const urlFilename = urlParts[urlParts.length - 1];
      if (urlFilename && urlFilename.includes('.')) {
        filename = urlFilename;
      }
    }
    
    // Enhanced URL construction for Formidable Forms and other upload systems
    if (!url.startsWith('http')) {
      // If it's just a filename, try common upload paths
      if (!url.includes('/') || url.startsWith('/')) {
        const cleanFilename = filename || url.replace(/^\//, '');
        
        // Try different common upload paths
        const possiblePaths = [
          `/wp-content/uploads/formidable/${cleanFilename}`,
          `/wp-content/uploads/${cleanFilename}`,
          `/uploads/${cleanFilename}`,
          `/files/${cleanFilename}`,
          `/attachments/${cleanFilename}`,
          `/${cleanFilename}`
        ];
        
        // Use the first path (most likely for Formidable Forms)
        url = possiblePaths[0];
      }
    }
    
    return {
      filename: (filename || 'Attachment').trim().replace(/[\\\/]/g, ''),
      url: url
    };
  };

  // Extract clean filename from attachment (for backward compatibility)
  const getCleanFilename = (attachment: Attachment): string => {
    return parseAttachment(attachment).filename;
  };

  // Normalize filename by removing size indicators and duplicates
  const normalizeFilename = (filename: string): string => {
    // Remove common size/variation indicators
    return filename
      .replace(/-\d+x\d+/g, '') // Remove size indicators like -150x150
      .replace(/-\d+$/g, '') // Remove trailing numbers like -1, -2
      .replace(/_\d+x\d+/g, '') // Remove underscore size indicators
      .replace(/\s+\(\d+\)/g, '') // Remove parenthetical numbers
      .replace(/\s*-\s*copy/gi, '') // Remove "copy" indicators
      .trim();
  };

  // Deduplicate attachments based on normalized filenames
  const deduplicateAttachments = (attachments: Attachment[]): Attachment[] => {
    const seen = new Set<string>();
    const deduplicated: Attachment[] = [];
    
    attachments.forEach(attachment => {
      const { filename } = parseAttachment(attachment);
      const normalizedName = normalizeFilename(filename);
      
      if (!seen.has(normalizedName)) {
        seen.add(normalizedName);
        deduplicated.push(attachment);
      }
    });
    
    return deduplicated;
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", 
      day: "numeric"
    });
  };

  // Convert image to base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Function to load the default logo image
  const loadDefaultLogo = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        try {
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load default logo'));
      img.src = '/images/cropped-newestcmanslogo.png';
    });
  };

  // Main PDF generation function
  const generateProfessionalPDF = async () => {
    if (selectedPosts.length === 0) {
      setError("No posts selected for PDF generation");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setProgress(0);
      setCurrentStep("Initializing PDF generation...");

      const pdf = new jsPDF({
        orientation: templateSettings.orientation as 'portrait' | 'landscape',
        unit: 'mm',
        format: templateSettings.paperSize === 'letter' ? [216, 279] : 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margins = templateSettings.margins;
      const contentWidth = pageWidth - (margins * 2);
      
      const headerColor = hexToRgb(templateSettings.headerColor);
      const footerColor = hexToRgb(templateSettings.footerColor);

      setProgress(10);
      setCurrentStep("Creating cover page...");

      // Cover Page
      if (templateSettings.includeCoverPage) {
        // Add header to cover page
        pdf.setFillColor(headerColor.r, headerColor.g, headerColor.b);
        pdf.rect(0, 0, pageWidth, 20, "F");
        pdf.setFont("times", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(255, 255, 255);
        pdf.text(templateSettings.headerText, margins, 12);
        
        // Add case number to top right
        const coverCaseText = `Case #: ${categoryName || 'General'}`;
        const coverCaseTextWidth = pdf.getTextWidth(coverCaseText);
        pdf.text(coverCaseText, pageWidth - margins - coverCaseTextWidth, 12);
        
        // Always use the default CMANS logo
        try {
          const defaultLogo = await loadDefaultLogo();
          pdf.addImage(defaultLogo, 'PNG', pageWidth/2 - 25, 40, 50, 50);
        } catch (e) {
          console.warn('Failed to add default logo:', e);
          // Continue without logo if it fails to load
        }

        // Title
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("times", "bold");
        pdf.setFontSize(24);
        const titleLines = pdf.splitTextToSize(templateSettings.coverTitle, contentWidth);
        let yPos = 110; // Always position after logo
        titleLines.forEach((line: string) => {
          const lineWidth = pdf.getTextWidth(line);
          pdf.text(line, (pageWidth - lineWidth) / 2, yPos);
          yPos += 12;
        });

        // Subtitle
        pdf.setFontSize(16);
        yPos += 10;
        const subtitleLines = pdf.splitTextToSize(templateSettings.coverSubtitle, contentWidth);
        subtitleLines.forEach((line: string) => {
          const lineWidth = pdf.getTextWidth(line);
          pdf.text(line, (pageWidth - lineWidth) / 2, yPos);
          yPos += 8;
        });

        // Case info - centered
        yPos += 20;
        pdf.setFont("times", "normal");
        pdf.setFontSize(12);
        
        const generatedText = `Generated: ${formatDate()}`;
        const caseText = `Case #: ${categoryName || 'General'}`;
        const reportsText = `Total Reports: ${selectedPosts.length}`;
        
        // Center each line
        const generatedWidth = pdf.getTextWidth(generatedText);
        const caseWidth = pdf.getTextWidth(caseText);
        const reportsWidth = pdf.getTextWidth(reportsText);
        
        pdf.text(generatedText, (pageWidth - generatedWidth) / 2, yPos);
        pdf.text(caseText, (pageWidth - caseWidth) / 2, yPos + 8);
        pdf.text(reportsText, (pageWidth - reportsWidth) / 2, yPos + 16);

        // Disclaimer - centered
        yPos = pageHeight - 60;
        pdf.setFontSize(10);
        const disclaimerLines = pdf.splitTextToSize(templateSettings.coverDisclaimer, contentWidth);
        disclaimerLines.forEach((line: string) => {
          const lineWidth = pdf.getTextWidth(line);
          pdf.text(line, (pageWidth - lineWidth) / 2, yPos);
          yPos += 5;
        });

        pdf.addPage();
      }

      // Calculate page numbers for TOC (we'll build this during content generation)
      const tocEntries: Array<{
        reportNumber: number;
        postTitle: string;
        reportTitle: string | null;
        pageNumber: number;
      }> = [];

      // Track current page number manually
      let currentPageCount = templateSettings.includeCoverPage ? 1 : 0;

      // We'll temporarily store the TOC page number to come back to it
      let tocPageNumber = -1;
      if (templateSettings.includeCoverPage && selectedPosts.length > 0) {
        currentPageCount++; // TOC will be page 2
        tocPageNumber = currentPageCount;
        pdf.addPage(); // Add placeholder page for TOC
      }

      setProgress(20);
      setCurrentStep("Processing case file content...");

      // Process each post
      let currentPostIndex = 0;
      for (const post of selectedPosts) {
        setCurrentStep(`Processing report ${currentPostIndex + 1} of ${selectedPosts.length}...`);
        
        // Track the page this report starts on
        currentPageCount++;
        const reportStartPage = currentPageCount;
        
        // Extract report title for TOC
        const reportTitle = extractReportTitle(post.content);
        
        // Add entry to TOC
        tocEntries.push({
          reportNumber: currentPostIndex + 1,
          postTitle: post.title,
          reportTitle: reportTitle,
          pageNumber: reportStartPage
        });
        
        // Add header to page
        pdf.setFillColor(headerColor.r, headerColor.g, headerColor.b);
        pdf.rect(0, 0, pageWidth, 20, "F");
        pdf.setFont("times", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(255, 255, 255);
        pdf.text(templateSettings.headerText, margins, 12);
        
        // Add case number to top right
        const caseText = `Case #: ${categoryName || 'General'}`;
        const caseTextWidth = pdf.getTextWidth(caseText);
        pdf.text(caseText, pageWidth - margins - caseTextWidth, 12);
        
        let yPos = 32;

        // Parse and render content
        // Remove attachment sections from content before parsing
        let cleanContent = post.content;
        const contentAttachmentRegex = /ATTACHMENTS[\s\S]*?(?=\n\n|\n[A-Z][A-Z]|$)/gi;
        cleanContent = cleanContent.replace(contentAttachmentRegex, '');
        
        const parsedContent = parseHtmlContent(cleanContent);
        const lineHeight = templateSettings.fontSize * 0.6;

        for (let i = 0; i < parsedContent.length; i++) {
          const item = parsedContent[i];
          
          // Estimate height needed for this content item
          let estimatedHeight = 0;
          switch (item.type) {
            case 'heading':
              estimatedHeight = 25;
              break;
            case 'label':
              estimatedHeight = 20;
              break;
            case 'paragraph':
              // Estimate based on text length and wrapping
              const paragraphLines = pdf.splitTextToSize(item.text, contentWidth);
              estimatedHeight = paragraphLines.length * lineHeight + 5;
              break;
            case 'list':
              const listLines = pdf.splitTextToSize(item.text, contentWidth - 10);
              estimatedHeight = listLines.length * lineHeight + 5;
              break;
            default:
              estimatedHeight = 15;
          }
          
          // Check if we need a new page BEFORE rendering this item
          if (yPos + estimatedHeight > pageHeight - 40) {
            // Add footer
            pdf.setFillColor(footerColor.r, footerColor.g, footerColor.b);
            pdf.rect(0, pageHeight - 12, pageWidth, 12, "F");
            pdf.setFont("times", "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(255, 255, 255);
            pdf.text(templateSettings.footerText, margins, pageHeight - 4);
            
            pdf.addPage();
            currentPageCount++; // Track new page
            
            // Add header to new page
            pdf.setFillColor(headerColor.r, headerColor.g, headerColor.b);
            pdf.rect(0, 0, pageWidth, 20, "F");
            pdf.setFont("times", "bold");
            pdf.setFontSize(10);
            pdf.setTextColor(255, 255, 255);
            pdf.text(templateSettings.headerText, margins, 12);
            
            // Add case number to top right
            const caseText = `Case #: ${categoryName || 'General'}`;
            const caseTextWidth = pdf.getTextWidth(caseText);
            pdf.text(caseText, pageWidth - margins - caseTextWidth, 12);
            
            yPos = 32;
          }

          switch (item.type) {
            case 'heading':
              const headingSize = templateSettings.fontSize + (4 - (item.level || 1));
              pdf.setFont("times", "bold");
              pdf.setFontSize(headingSize);
              pdf.setTextColor(0, 0, 0);
              
              const headingLines = pdf.splitTextToSize(item.text, contentWidth);
              headingLines.forEach((line: string) => {
                if (item.centered) {
                  const lineWidth = pdf.getTextWidth(line);
                  const xPos = margins + (contentWidth - lineWidth) / 2;
                  pdf.text(line, xPos, yPos);
                } else {
                  pdf.text(line, margins, yPos);
                }
                yPos += headingSize * 0.6;
              });
              yPos += 5;
              break;

            case 'label':
              pdf.setFont("times", "bold");
              pdf.setFontSize(templateSettings.fontSize);
              pdf.setTextColor(0, 0, 0);
              
              const labelLines = pdf.splitTextToSize(item.text, contentWidth);
              labelLines.forEach((line: string) => {
                pdf.text(line, margins, yPos);
                yPos += lineHeight;
              });
              yPos += 3;
              break;

            case 'paragraph':
              pdf.setFont("times", "normal");
              pdf.setFontSize(templateSettings.fontSize);
              pdf.setTextColor(0, 0, 0);
              
              const paragraphLines = pdf.splitTextToSize(item.text, contentWidth);
              paragraphLines.forEach((line: string) => {
                pdf.text(line, margins, yPos);
                yPos += lineHeight;
              });
              yPos += 3;
              break;

            case 'list':
              pdf.setFont("times", "normal");
              pdf.setFontSize(templateSettings.fontSize);
              pdf.setTextColor(0, 0, 0);
              
              const listLines = pdf.splitTextToSize(item.text, contentWidth - 10);
              pdf.text("•", margins, yPos);
              listLines.forEach((line: string) => {
                pdf.text(line, margins + 8, yPos);
                yPos += lineHeight;
              });
              yPos += 2;
              break;
          }
        }

        // Extract attachments from content text (for Formidable Forms and text-based lists)
        const contentAttachments: Attachment[] = [];
        let attachmentIdCounter = (post.attachments?.length || 0) + 1;
        
        // Look for attachment sections in the content
        const attachmentExtractionRegex = /ATTACHMENTS[\s\S]*?(?=\n\n|\n[A-Z][A-Z]|$)/gi;
        const attachmentMatches = post.content.match(attachmentExtractionRegex);
        
        if (attachmentMatches) {
          attachmentMatches.forEach(section => {
            // Extract filenames from the section
            const filenameRegex = /([A-Za-z0-9_-]+\.(jpg|jpeg|png|gif|pdf|doc|docx|txt|xlsx|xls|ppt|pptx|zip|rar|7z))/gi;
            const filenames = section.match(filenameRegex);
            
            if (filenames) {
              filenames.forEach(filename => {
                // Determine file type
                let type = 'file';
                if (filename.match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/i)) type = 'image';
                else if (filename.match(/\.(pdf)$/i)) type = 'pdf';
                else if (filename.match(/\.(doc|docx)$/i)) type = 'doc';
                else if (filename.match(/\.(txt)$/i)) type = 'txt';
                
                // Create attachment object
                contentAttachments.push({
                  id: attachmentIdCounter++,
                  title: filename,
                  url: `/${filename}`, // Will be processed by parseAttachment
                  type: type
                });
              });
            }
          });
        }
        
        // Combine original attachments with content-extracted ones and deduplicate
        const combinedAttachments = [...(post.attachments || []), ...contentAttachments];
        const allAttachments = deduplicateAttachments(combinedAttachments);
        
        // Attachments section
        if (allAttachments && allAttachments.length > 0) {
          yPos += 15;
          
          // Calculate estimated height needed for attachments section
          let attachmentSectionHeight = 30; // Base height for title and box
          allAttachments.forEach(attachment => {
            attachmentSectionHeight += 20; // Each attachment needs ~20 pixels
          });
          
          // Check if we need a new page for the entire attachments section
          if (yPos + attachmentSectionHeight > pageHeight - 40) {
            pdf.setFillColor(footerColor.r, footerColor.g, footerColor.b);
            pdf.rect(0, pageHeight - 12, pageWidth, 12, "F");
            pdf.setFont("times", "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(255, 255, 255);
            pdf.text(templateSettings.footerText, margins, pageHeight - 4);
            
            pdf.addPage();
            
            // Add header to new page
            pdf.setFillColor(headerColor.r, headerColor.g, headerColor.b);
            pdf.rect(0, 0, pageWidth, 20, "F");
            pdf.setFont("times", "bold");
            pdf.setFontSize(10);
            pdf.setTextColor(255, 255, 255);
            pdf.text(templateSettings.headerText, margins, 12);
            
            // Add case number to top right
            const caseText = `Case #: ${categoryName || 'General'}`;
            const caseTextWidth = pdf.getTextWidth(caseText);
            pdf.text(caseText, pageWidth - margins - caseTextWidth, 12);
            
            yPos = 32;
          }
          
          // Attachments heading
          pdf.setFont("times", "bold");
          pdf.setFontSize(templateSettings.fontSize);
          pdf.setTextColor(0, 0, 0);
          pdf.text("Attachments", margins, yPos);
          yPos += 10;
          
          // Calculate simpler attachment box height (just for filenames)
          let estimatedBoxHeight = 20 + (allAttachments.length * 15); // Base + filename lines
          
          pdf.setFillColor(250, 250, 250);
          pdf.rect(margins, yPos, contentWidth, estimatedBoxHeight, "F");
          pdf.setDrawColor(150, 150, 150);
          pdf.rect(margins, yPos, contentWidth, estimatedBoxHeight, "S");
          
          yPos += 6;
          
          allAttachments.forEach((attachment, index) => {
            const { filename, url } = parseAttachment(attachment);
            
            // Create clickable link with better URL construction
            let fullUrl = url;
            
            // Ensure we have a complete URL
            if (!fullUrl.startsWith('http')) {
              if (siteUrl && siteUrl.trim()) {
                const cleanSiteUrl = siteUrl.replace(/\/+$/, '');
                const cleanAttachmentUrl = url.startsWith('/') ? url : `/${url}`;
                fullUrl = `${cleanSiteUrl}${cleanAttachmentUrl}`;
              } else {
                // Default to cmansrms.us if no siteUrl provided
                fullUrl = url.startsWith('/') ? `https://cmansrms.us${url}` : `https://cmansrms.us/${url}`;
              }
            }
            
            // Display filename as clickable link in blue
            pdf.setTextColor(0, 0, 255);
            pdf.setFont("times", "normal");
            pdf.setFontSize(10);
            
            const attachmentText = `${index + 1}. ${filename}`;
            pdf.text(attachmentText, margins + 5, yPos);
            
            // Add visual underline to indicate it's a clickable link
            pdf.setDrawColor(0, 0, 255);
            pdf.setLineWidth(0.3);
            const textWidth = pdf.getTextWidth(attachmentText);
            pdf.line(margins + 5, yPos + 1, margins + 5 + textWidth, yPos + 1);
            
            // Try to add clickable link functionality
            try {
              pdf.link(margins + 5, yPos - 8, textWidth, 12, { url: fullUrl });
            } catch (e) {
              // Link creation failed, continue without it
              console.warn('Failed to create attachment link:', e);
            }
            
            yPos += 12;
            
            // Reset font styling
            pdf.setFont("times", "normal");
            pdf.setTextColor(0, 0, 0);
          });
        }

        currentPostIndex++;
        setProgress(40 + (currentPostIndex / selectedPosts.length) * 50);
        
        // ALWAYS add a page break after each complete post (except the last one)
        if (currentPostIndex < selectedPosts.length) {
          // Add footer before new page
          pdf.setFillColor(footerColor.r, footerColor.g, footerColor.b);
          pdf.rect(0, pageHeight - 15, pageWidth, 15, "F");
          pdf.setFont("times", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(255, 255, 255);
          pdf.text(templateSettings.footerText, margins, pageHeight - 5);
          
          // Force new page for next post
          pdf.addPage();
          // Don't increment currentPageCount here - it will be incremented at the start of the next post loop
          
          // Add header to new page
          pdf.setFillColor(headerColor.r, headerColor.g, headerColor.b);
          pdf.rect(0, 0, pageWidth, 20, "F");
          pdf.setFont("times", "bold");
          pdf.setFontSize(10);
          pdf.setTextColor(255, 255, 255);
          pdf.text(templateSettings.headerText, margins, 12);
          
          // Add case number to top right
          const caseText = `Case #: ${categoryName || 'General'}`;
          const caseTextWidth = pdf.getTextWidth(caseText);
          pdf.text(caseText, pageWidth - margins - caseTextWidth, 12);
          
          yPos = 32; // Reset Y position for new page
        }
      }



      setCurrentStep("Creating table of contents...");

      // Now generate the Table of Contents with actual page numbers
      if (templateSettings.includeCoverPage && selectedPosts.length > 0 && tocPageNumber > 0) {
        pdf.setPage(tocPageNumber);
        
        // Add header to table of contents page
        pdf.setFillColor(headerColor.r, headerColor.g, headerColor.b);
        pdf.rect(0, 0, pageWidth, 20, "F");
        pdf.setFont("times", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(255, 255, 255);
        pdf.text(templateSettings.headerText, margins, 12);
        
        // Add case number to top right
        const tocCaseText = `Case #: ${categoryName || 'General'}`;
        const tocCaseTextWidth = pdf.getTextWidth(tocCaseText);
        pdf.text(tocCaseText, pageWidth - margins - tocCaseTextWidth, 12);
        
        // Table of Contents title
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("times", "bold");
        pdf.setFontSize(18);
        let tocYPos = 35;
        const tocTitle = "TABLE OF CONTENTS";
        const tocTitleWidth = pdf.getTextWidth(tocTitle);
        pdf.text(tocTitle, (pageWidth - tocTitleWidth) / 2, tocYPos);
        
        tocYPos += 20;
        
        // Report entries with page numbers
        pdf.setFont("times", "normal");
        pdf.setFontSize(11);
        
        tocEntries.forEach((entry) => {
          // Check if we need a new page
          if (tocYPos > pageHeight - 40) {
            // Add footer
            pdf.setFillColor(footerColor.r, footerColor.g, footerColor.b);
            pdf.rect(0, pageHeight - 12, pageWidth, 12, "F");
            pdf.setFont("times", "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(255, 255, 255);
            pdf.text(templateSettings.footerText, margins, pageHeight - 4);
            
            pdf.addPage();
            
            // Add header to new page
            pdf.setFillColor(headerColor.r, headerColor.g, headerColor.b);
            pdf.rect(0, 0, pageWidth, 20, "F");
            pdf.setFont("times", "bold");
            pdf.setFontSize(10);
            pdf.setTextColor(255, 255, 255);
            pdf.text(templateSettings.headerText, margins, 12);
            
            // Add case number to top right
            const tocCaseText2 = `Case #: ${categoryName || 'General'}`;
            const tocCaseTextWidth2 = pdf.getTextWidth(tocCaseText2);
            pdf.text(tocCaseText2, pageWidth - margins - tocCaseTextWidth2, 12);
            
            tocYPos = 40;
          }
          
          // Report number and title
          pdf.setTextColor(0, 0, 0);
          pdf.setFont("times", "normal");
          pdf.setFontSize(12);
          
          const reportNum = `${entry.reportNumber}.`;
          
          // Use report title if available, otherwise use post title
          const displayTitle = entry.reportTitle || entry.postTitle;
          
          // Create a clickable link to the page
          const pageNumText = `Page ${entry.pageNumber}`;
          const pageNumWidth = pdf.getTextWidth(pageNumText);
          
          // Split long titles to fit on page (leave space for page number)
          const availableWidth = contentWidth - pageNumWidth - 40;
          const titleLines = pdf.splitTextToSize(displayTitle, availableWidth);
          
          // Print report number
          pdf.text(reportNum, margins, tocYPos);
          
          // Print title (indented)
          titleLines.forEach((line: string, lineIndex: number) => {
            pdf.text(line, margins + 20, tocYPos + (lineIndex * 5));
          });
          
          // Print page number (right-aligned)
          pdf.text(pageNumText, pageWidth - margins - pageNumWidth, tocYPos);
          
          // Add clickable link to page
          try {
            pdf.link(margins, tocYPos - 4, contentWidth, titleLines.length * 5 + 4, { pageNumber: entry.pageNumber });
          } catch (e) {
            // Link creation failed, continue without it
            console.warn('Failed to create TOC link:', e);
          }
          
          // Only show the post title - no second line with report title
          tocYPos += (titleLines.length * 5) + 6;
        });
        
        // Add footer to table of contents page
        pdf.setFillColor(footerColor.r, footerColor.g, footerColor.b);
        pdf.rect(0, pageHeight - 12, pageWidth, 12, "F");
        pdf.setFont("times", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.text(templateSettings.footerText, margins, pageHeight - 4);
      }

      setCurrentStep("Finalizing document...");

      // Update all page headers and footers with correct page numbers
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        if (i > 1 || !templateSettings.includeCoverPage) {
          // Update header
          pdf.setFillColor(headerColor.r, headerColor.g, headerColor.b);
          pdf.rect(0, 0, pageWidth, 20, "F");
          pdf.setFont("times", "bold");
          pdf.setFontSize(10);
          pdf.setTextColor(255, 255, 255);
          pdf.text(templateSettings.headerText, margins, 12);
          
          // Add case number to top right
          const caseText = `Case #: ${categoryName || 'General'}`;
          const caseTextWidth = pdf.getTextWidth(caseText);
          pdf.text(caseText, pageWidth - margins - caseTextWidth, 12);
          
          // Update footer with page numbers
          pdf.setFillColor(footerColor.r, footerColor.g, footerColor.b);
          pdf.rect(0, pageHeight - 12, pageWidth, 12, "F");
          
          pdf.setFont("times", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(255, 255, 255);
          
          // Left-aligned footer text
          pdf.text(templateSettings.footerText, margins, pageHeight - 4);
          
          // Right-aligned page numbers
          const pageText = `Page ${i} of ${totalPages}`;
          const pageTextWidth = pdf.getTextWidth(pageText);
          pdf.text(pageText, pageWidth - margins - pageTextWidth, pageHeight - 4);
        }
      }

      setProgress(95);
      setCurrentStep("Generating PDF file...");

      // Generate and download PDF
      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const filename = `${categoryName || 'General'}.pdf`;
      
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onGenerationComplete(pdfUrl);
      setProgress(100);
      setCurrentStep("PDF generation completed successfully!");
      
      setTimeout(() => {
        setIsGenerating(false);
        setCurrentStep("");
        setProgress(0);
      }, 2000);

    } catch (err) {
      console.error("PDF generation error:", err);
      setError(err instanceof Error ? err.message : "An error occurred during PDF generation");
      setIsGenerating(false);
      setCurrentStep("");
      setProgress(0);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isGenerating && (
        <div className="space-y-3 mb-4">
          <Progress value={progress} className="w-full h-2 sm:h-3" />
          <div className="text-sm sm:text-base text-slate-600 px-2">
            {currentStep}
          </div>
        </div>
      )}

      <Button
        onClick={generateProfessionalPDF}
        disabled={selectedPosts.length === 0 || isGenerating}
        className="w-full h-12 sm:h-14 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-base sm:text-lg font-medium touch-manipulation transition-all duration-200 active:scale-95"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
            <span className="hidden sm:inline">Generating Professional Case File...</span>
            <span className="sm:hidden">Generating PDF...</span>
          </>
        ) : (
          <>
            <Download className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="hidden sm:inline">Generate Professional Case File PDF</span>
            <span className="sm:hidden">Generate PDF</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default PDFGenerator; 