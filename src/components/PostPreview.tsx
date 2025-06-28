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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  FileText,
  Image,
  Paperclip,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Attachment {
  id: number;
  title: string;
  url: string;
  type: string;
}

interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  featuredImage?: string;
  attachments: Attachment[];
}

interface PostPreviewProps {
  posts?: Post[];
  selectedCategories?: Array<{
    id: number;
    name: string;
    count: number;
    slug?: string;
    selected?: boolean;
  }>;
  siteUrl?: string;
  onSelectionChange?: (selectedPosts: number[]) => void;
  onPostsLoaded?: (posts: Post[]) => void;
}

const PostPreview = ({
  posts = [],
  selectedCategories = [],
  siteUrl = "",
  onSelectionChange = () => {},
  onPostsLoaded = () => {},
}: PostPreviewProps) => {
  const [fetchedPosts, setFetchedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);

  // Fetch posts from the remote site based on selected categories
  const fetchPostsFromCategories = async () => {
    if (!siteUrl || selectedCategories.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try WordPress REST API first
      const categoryIds = selectedCategories.map((cat) => cat.id.toString());
      const apiUrl = siteUrl.endsWith("/")
        ? `${siteUrl}wp-json/wp/v2/posts`
        : `${siteUrl}/wp-json/wp/v2/posts`;

      try {
        const response = await fetch(
          `${apiUrl}?per_page=20&categories=${categoryIds.join(",")}&_embed`,
        );
        if (response.ok) {
          const apiPosts = await response.json();
          const formattedPosts: Post[] = apiPosts.map((post: any) => ({
            id: post.id,
            title: post.title.rendered || post.title,
            excerpt: post.excerpt?.rendered?.replace(/<[^>]*>/g, "") || "",
            content: post.content?.rendered || post.content || "",
            date: post.date,
            featuredImage:
              post.featured_media && post._embedded?.["wp:featuredmedia"]?.[0]
                ? post._embedded["wp:featuredmedia"][0].source_url
                : undefined,
            attachments: [],
          }));
          setFetchedPosts(formattedPosts);
          const allPostIds = formattedPosts.map((post) => post.id);
          setSelectedPosts(allPostIds);
          onSelectionChange(allPostIds); // Auto-select all posts
          onPostsLoaded(formattedPosts);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.log("WordPress API not available, trying HTML parsing...");
      }

      // Fallback to HTML parsing
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(siteUrl)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const htmlContent = data.contents;
      const parsedPosts = parseHtmlForPosts(htmlContent);

      setFetchedPosts(parsedPosts);
      const allPostIds = parsedPosts.map((post) => post.id);
      setSelectedPosts(allPostIds);
      onSelectionChange(allPostIds); // Auto-select all posts
      onPostsLoaded(parsedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(
        "Failed to fetch posts from the selected categories. Showing sample data instead.",
      );

      // Don't show sample posts - leave empty
      setFetchedPosts([]);
      setSelectedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const parseHtmlForPosts = (html: string): Post[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const posts: Post[] = [];
    let postId = 1;

    // Look for common post selectors
    const postSelectors = [
      "article",
      ".post",
      ".entry",
      ".blog-post",
      ".post-item",
      ".entry-content",
      ".wp-block-post",
    ];

    postSelectors.forEach((selector) => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach((element) => {
        const titleElement = element.querySelector(
          "h1, h2, h3, .post-title, .entry-title, .title",
        );
        const excerptElement = element.querySelector(".excerpt, .summary, p");
        const imageElement = element.querySelector("img");

        if (titleElement && titleElement.textContent) {
          const title = titleElement.textContent.trim();
          const excerpt =
            excerptElement?.textContent?.trim().substring(0, 200) || "";
          const featuredImage = imageElement?.getAttribute("src") || undefined;
          
          // Extract full content for better attachment detection and PDF generation
          const fullContent = element.innerHTML || `<p>${excerpt}</p>`;

          // Extract attachments from the post element
          const attachments: Attachment[] = [];
          let attachmentId = 1;

          // Look for attachment links in various formats, including Formidable Forms
          const attachmentSelectors = [
            // File type selectors
            'a[href*=".pdf"]',
            'a[href*=".doc"]', 
            'a[href*=".docx"]',
            'a[href*=".txt"]',
            'a[href*=".jpg"]',
            'a[href*=".jpeg"]',
            'a[href*=".png"]',
            'a[href*=".gif"]',
            'a[href*=".bmp"]',
            'a[href*=".tiff"]',
            'a[href*=".xlsx"]',
            'a[href*=".xls"]',
            'a[href*=".ppt"]',
            'a[href*=".pptx"]',
            'a[href*=".zip"]',
            'a[href*=".rar"]',
            'a[href*=".7z"]',
            // WordPress upload directories
            'a[href*="/wp-content/uploads/"]',
            'a[href*="/uploads/"]',
            'a[href*="/files/"]',
            'a[href*="/attachments/"]',
            // Formidable Forms specific paths
            'a[href*="/wp-content/uploads/formidable/"]',
            'a[href*="/formidable/"]',
            'a[href*="/frm_uploads/"]',
            'a[href*="/form-uploads/"]',
            // Other common upload folders
            'a[href*="/media/"]',
            'a[href*="/documents/"]',
            'a[href*="/download/"]',
            'a[href*="/downloads/"]',
            'a[href*="/assets/"]',
            'a[href*="/content/"]',
            'a[href*="/storage/"]',
            'a[href*="/public/"]',
            // Year-based upload folders (common in WordPress)
            'a[href*="/2024/"]',
            'a[href*="/2023/"]',
            'a[href*="/2025/"]'
          ];

          attachmentSelectors.forEach(selector => {
            const attachmentLinks = element.querySelectorAll(selector);
            attachmentLinks.forEach(link => {
              const href = link.getAttribute('href');
              const linkText = link.textContent?.trim();
              
              if (href && linkText && linkText.length > 0) {
                // Determine file type from URL or extension
                let type = 'file';
                if (href.includes('.pdf')) type = 'pdf';
                else if (href.includes('.doc')) type = 'doc';
                else if (href.includes('.txt')) type = 'txt';
                else if (href.match(/\.(jpg|jpeg|png|gif)$/i)) type = 'image';

                // Avoid duplicates
                const isDuplicate = attachments.some(att => att.url === href);
                if (!isDuplicate) {
                  attachments.push({
                    id: attachmentId++,
                    title: linkText,
                    url: href,
                    type: type
                  });
                }
              }
            });
          });

          // Also look for attachment lists or sections, including Formidable Forms
          const attachmentSections = element.querySelectorAll([
            '[class*="attachment"]',
            '[class*="file"]', 
            '[id*="attachment"]',
            '[id*="file"]',
            // Formidable Forms specific selectors
            '[class*="frm_upload"]',
            '[class*="frm-upload"]',
            '[class*="frm_file"]',
            '[class*="frm-file"]',
            '[class*="formidable"]',
            '[class*="frm_form"]',
            '[class*="frm-form"]',
            '.frm_file_container',
            '.frm_upload_field',
            '.frm_file_field',
            // Generic form upload selectors
            '[class*="upload"]',
            '[class*="document"]',
            '[class*="media"]',
            '.file-upload',
            '.document-upload',
            '.media-upload'
          ].join(', '));
          attachmentSections.forEach(section => {
            const links = section.querySelectorAll('a[href]');
            links.forEach(link => {
              const href = link.getAttribute('href');
              const linkText = link.textContent?.trim();
              
              if (href && linkText && linkText.length > 0) {
                // Determine file type
                let type = 'file';
                if (href.includes('.pdf')) type = 'pdf';
                else if (href.includes('.doc')) type = 'doc';
                else if (href.includes('.txt')) type = 'txt';
                else if (href.match(/\.(jpg|jpeg|png|gif)$/i)) type = 'image';

                // Avoid duplicates
                const isDuplicate = attachments.some(att => att.url === href);
                if (!isDuplicate) {
                  attachments.push({
                    id: attachmentId++,
                    title: linkText,
                    url: href,
                    type: type
                  });
                }
              }
            });
          });

          // Additional search for file references in text content (Formidable Forms often embeds file info)
          const textContent = element.textContent || '';
          const filePatterns = [
            // Look for file URLs in text
            /https?:\/\/[^\s]+\.(pdf|doc|docx|txt|jpg|jpeg|png|gif|bmp|tiff|xlsx|xls|ppt|pptx|zip|rar|7z)/gi,
            // Look for wp-content/uploads paths
            /\/wp-content\/uploads\/[^\s]+\.(pdf|doc|docx|txt|jpg|jpeg|png|gif|bmp|tiff|xlsx|xls|ppt|pptx|zip|rar|7z)/gi,
            // Look for formidable specific paths
            /\/formidable\/[^\s]+\.(pdf|doc|docx|txt|jpg|jpeg|png|gif|bmp|tiff|xlsx|xls|ppt|pptx|zip|rar|7z)/gi,
            // Look for any upload folder paths
            /\/(?:uploads?|files?|documents?|media|attachments?)\/[^\s]+\.(pdf|doc|docx|txt|jpg|jpeg|png|gif|bmp|tiff|xlsx|xls|ppt|pptx|zip|rar|7z)/gi
          ];

          filePatterns.forEach(pattern => {
            const matches = textContent.match(pattern);
            if (matches) {
              matches.forEach(match => {
                // Extract filename from path
                const urlParts = match.split('/');
                const filename = urlParts[urlParts.length - 1];
                
                if (filename && filename.includes('.')) {
                  // Determine file type
                  let type = 'file';
                  if (match.includes('.pdf')) type = 'pdf';
                  else if (match.includes('.doc')) type = 'doc';
                  else if (match.includes('.txt')) type = 'txt';
                  else if (match.match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/i)) type = 'image';
                  else if (match.match(/\.(xlsx?|ppt|pptx)$/i)) type = 'doc';

                  // Avoid duplicates
                  const isDuplicate = attachments.some(att => att.url === match);
                  if (!isDuplicate) {
                    attachments.push({
                      id: attachmentId++,
                      title: filename,
                      url: match,
                      type: type
                    });
                  }
                }
              });
            }
          });

          if (title.length > 5 && title.length < 200) {
            posts.push({
              id: postId++,
              title,
              excerpt,
              content: fullContent,
              date: new Date().toISOString(),
              featuredImage,
              attachments: attachments,
            });
          }
        }
      });
    });

    return posts.slice(0, 10);
  };

  // Fetch posts when categories or site URL changes
  React.useEffect(() => {
    if (selectedCategories.length > 0 && siteUrl) {
      fetchPostsFromCategories();
    }
  }, [selectedCategories, siteUrl]);

  // No default posts - only show actual fetched data
  const displayPosts =
    fetchedPosts.length > 0 ? fetchedPosts : posts.length > 0 ? posts : [];

  const handlePostSelection = (postId: number) => {
    setSelectedPosts((prev) => {
      const newSelection = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];

      onSelectionChange(newSelection);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    const allPostIds = displayPosts.map((post) => post.id);
    setSelectedPosts(allPostIds);
    onSelectionChange(allPostIds);
  };

  const handleDeselectAll = () => {
    setSelectedPosts([]);
    onSelectionChange([]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg rounded-2xl p-6">
      <div className="space-y-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
              clipRule="evenodd"
            />
          </svg>
          <span className="leading-tight">Case Report Preview</span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSelectAll}
            className="h-12 bg-white/70 border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all duration-200 touch-manipulation"
          >
            Select All Reports
          </Button>
          <Button
            variant="outline"
            onClick={handleDeselectAll}
            className="h-12 bg-white/70 border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-200 touch-manipulation"
          >
            Deselect All
          </Button>
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <div className="mb-6 p-4 sm:p-6 bg-blue-50/70 border border-blue-200/50 rounded-xl backdrop-blur-sm">
          <p className="text-sm font-medium mb-3 text-slate-700">
            Selected Case #'s:
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {selectedCategories.map((category) => (
              <Badge key={category.id} className="bg-blue-100 text-blue-800 border-blue-200 text-xs sm:text-sm py-1 px-2 sm:px-3">
                {category.name} ({category.count})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50/80 text-red-800">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <p className="text-slate-600 mb-4">
          {loading
            ? "Loading case reports..."
            : `${selectedPosts.length} of ${displayPosts.length} reports selected for case file generation`}
        </p>
        
        {displayPosts.length > 0 && (
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="leading-tight">Available Case Reports ({displayPosts.length} total):</span>
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {displayPosts.map((post, index) => {
                const reportTitle = extractReportTitle(post.content);
                return (
                  <div
                    key={post.id}
                    className={`text-sm sm:text-base p-4 rounded-lg border transition-all duration-200 cursor-pointer touch-manipulation min-h-[60px] flex flex-col justify-center ${
                      selectedPosts.includes(post.id)
                        ? "bg-blue-100 border-blue-300 text-blue-800"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                    }`}
                    onClick={() => handlePostSelection(post.id)}
                  >
                    <div className="font-medium mb-2 leading-tight">
                      <span className="text-xs text-slate-500">#{index + 1}:</span> {post.title}
                    </div>
                    {reportTitle && (
                      <div className="text-xs sm:text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        <span className="font-semibold">Report:</span> {reportTitle}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="h-[400px] sm:h-[500px] pr-2 sm:pr-4">
        <div className="space-y-4 sm:space-y-6">
          {displayPosts.map((post) => (
            <Card
              key={post.id}
              className="overflow-hidden bg-white/70 backdrop-blur-sm border-slate-200 hover:bg-white/90 hover:shadow-lg transition-all duration-200 rounded-xl"
            >
              <div className="flex flex-col sm:flex-row items-start p-4 sm:p-6 gap-4 sm:gap-0">
                <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
                  <Checkbox
                    id={`post-${post.id}`}
                    checked={selectedPosts.includes(post.id)}
                    onCheckedChange={() => handlePostSelection(post.id)}
                    className="mr-3 sm:mr-4 h-5 w-5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <span className="text-sm text-slate-500 font-medium sm:hidden">Select this report</span>
                </div>
                <div className="flex-1 w-full">
                  <CardHeader className="p-0 pb-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-100 mb-3">
                      <CardTitle className="text-lg sm:text-xl lg:text-2xl text-slate-900 font-bold leading-tight mb-2">
                        {post.title}
                      </CardTitle>
                      {(() => {
                        const reportTitle = extractReportTitle(post.content);
                        return reportTitle ? (
                          <div className="bg-amber-100 border border-amber-200 rounded-md p-2 sm:p-3 mt-2">
                            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Report Title:</span>
                            <p className="text-sm font-medium text-amber-900 mt-1 leading-tight">{reportTitle}</p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <Calendar className="h-4 w-4 mr-2 shrink-0" />
                      <span className="font-medium">{formatDate(post.date)}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 pb-4">
                    <div className="flex flex-col gap-4">
                      {post.featuredImage && (
                        <div className="w-full">
                          <div className="relative aspect-video rounded-lg overflow-hidden shadow-sm max-w-md mx-auto sm:mx-0">
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                      )}
                      <div className="w-full">
                        <p className="text-slate-700 leading-relaxed text-sm sm:text-base">{post.excerpt}</p>

                        {post.attachments.length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Paperclip className="h-4 w-4 text-slate-600 shrink-0" />
                              <span className="text-sm font-medium text-slate-700">
                                Attachments ({post.attachments.length}):
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {post.attachments.map((attachment) => (
                                <Badge
                                  key={attachment.id}
                                  className="flex items-center gap-2 bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 p-2 justify-start min-h-[40px]"
                                >
                                  <div className="shrink-0">
                                    {attachment.type === "pdf" && (
                                      <FileText className="h-4 w-4" />
                                    )}
                                    {attachment.type === "doc" && (
                                      <FileText className="h-4 w-4" />
                                    )}
                                    {attachment.type === "txt" && (
                                      <FileText className="h-4 w-4" />
                                    )}
                                    {attachment.type === "image" && (
                                      <Image className="h-4 w-4" />
                                    )}
                                  </div>
                                  <span className="truncate text-xs sm:text-sm">{attachment.title}</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PostPreview;
