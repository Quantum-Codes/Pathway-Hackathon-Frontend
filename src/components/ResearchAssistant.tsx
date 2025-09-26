import { useState } from "react";
import { Search, FileText, Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LoadingAnimation } from "./LoadingAnimation";
import { PaperSidebar } from "./PaperSidebar";
import { useToast } from "@/hooks/use-toast";

interface ArxivPaper {
  title: string;
  url: string;
  authors: string;
  abstract: string;
}

interface ApiResponse {
  message: string;
  papers: ArxivPaper[];
}

export function ResearchAssistant() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<ArxivPaper | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Please enter a research topic",
        description: "Enter a topic you'd like to explore to get started.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResponse(null);
    setSelectedPaper(null);

    try {
      const res = await fetch("http://localhost:8080/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: query }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: ApiResponse = await res.json();
      setResponse(data);
      
      toast({
        title: "Research Complete!",
        description: `Found ${data.papers?.length || 0} relevant papers for your query.`,
      });
    } catch (error) {
      console.error("Error fetching research:", error);
      toast({
        title: "Research Failed",
        description: "Unable to connect to the research API. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="bg-card border-b shadow-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Research Assistant</h1>
              <p className="text-muted-foreground">Explore academic research with AI-powered insights</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Search Interface */}
        <Card className="p-8 mb-8 shadow-card">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <FileText className="h-12 w-12 text-research-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                What would you like to research today?
              </h2>
              <p className="text-muted-foreground">
                Enter any topic and get AI-powered insights with relevant academic papers
              </p>
            </div>
            
            <div className="flex space-x-4">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., machine learning in healthcare, quantum computing applications..."
                className="flex-1 h-12 text-lg"
                disabled={isLoading}
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="h-12 px-8 bg-gradient-primary hover:shadow-research"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
                {!isLoading && "Research"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Loading Animation */}
        {isLoading && <LoadingAnimation />}

        {/* Results Layout */}
        {response && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="p-6 shadow-card animate-fade-in-up">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Research Summary</h3>
                  <div className="h-1 w-16 bg-gradient-primary rounded-full"></div>
                </div>
                <div className="prose prose-slate max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {response.message}
                  </p>
                </div>
              </Card>

              {/* Paper Viewer */}
              {selectedPaper && (
                <Card className="mt-6 shadow-card animate-fade-in-up">
                  <div className="p-4 border-b bg-muted/50">
                    <h4 className="font-semibold text-foreground">{selectedPaper.title}</h4>
                    <p className="text-sm text-muted-foreground">{selectedPaper.authors}</p>
                  </div>
                  <div className="aspect-[4/5] bg-background">
                    <iframe
                      src={selectedPaper.url}
                      className="w-full h-full border-0"
                      title={selectedPaper.title}
                    />
                  </div>
                </Card>
              )}
            </div>

            {/* Papers Sidebar */}
            <div className="lg:col-span-1">
              <PaperSidebar
                papers={response.papers || []}
                selectedPaper={selectedPaper}
                onPaperSelect={setSelectedPaper}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}