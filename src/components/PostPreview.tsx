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
          setSelectedPosts(formattedPosts.map((post) => post.id));
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
      setSelectedPosts(parsedPosts.map((post) => post.id));
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

          if (title.length > 5 && title.length < 200) {
            posts.push({
              id: postId++,
              title,
              excerpt,
              content: `<p>${excerpt}</p>`,
              date: new Date().toISOString(),
              featuredImage,
              attachments: [],
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

  return (
    <div className="w-full bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <svg
            className="w-6 h-6 text-blue-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
              clipRule="evenodd"
            />
          </svg>
          Case Report Preview
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white"
          >
            Select All Reports
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white"
          >
            Deselect All
          </Button>
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <div className="mb-4 p-3 bg-slate-700/30 border border-slate-600/50 rounded-lg">
          <p className="text-sm font-medium mb-2 text-slate-300">
            Selected Case #'s:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge key={category.id} variant="secondary">
                {category.name} ({category.count})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {error && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-4">
        <p className="text-slate-400">
          {loading
            ? "Loading case reports..."
            : `${selectedPosts.length} of ${displayPosts.length} reports selected for case file generation`}
        </p>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {displayPosts.map((post) => (
            <Card
              key={post.id}
              className="overflow-hidden bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 transition-all duration-200"
            >
              <div className="flex items-start p-4">
                <Checkbox
                  id={`post-${post.id}`}
                  checked={selectedPosts.includes(post.id)}
                  onCheckedChange={() => handlePostSelection(post.id)}
                  className="mr-4 mt-1"
                />
                <div className="flex-1">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-xl text-white">
                      {post.title}
                    </CardTitle>
                    <div className="flex items-center text-sm text-slate-400 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 pb-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {post.featuredImage && (
                        <div className="md:w-1/3">
                          <div className="relative aspect-video rounded-md overflow-hidden">
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                      )}
                      <div
                        className={post.featuredImage ? "md:w-2/3" : "w-full"}
                      >
                        <p className="text-slate-300">{post.excerpt}</p>

                        {post.attachments.length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Paperclip className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                Attachments:
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {post.attachments.map((attachment) => (
                                <Badge
                                  key={attachment.id}
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  {attachment.type === "pdf" && (
                                    <FileText className="h-3 w-3" />
                                  )}
                                  {attachment.type === "doc" && (
                                    <FileText className="h-3 w-3" />
                                  )}
                                  {attachment.type === "txt" && (
                                    <FileText className="h-3 w-3" />
                                  )}
                                  {attachment.type === "image" && (
                                    <Image className="h-3 w-3" />
                                  )}
                                  {attachment.title}
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
