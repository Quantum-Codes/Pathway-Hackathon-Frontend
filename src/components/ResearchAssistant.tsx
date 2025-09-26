import { useState } from "react";
import { Search, FileText, Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { SimpleLoadingAnimation } from "./SimpleLoadingAnimation";
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

    // Admin bypass
    if (query.toLowerCase().trim() === "admin") {
      setTimeout(() => {
        const mockData: ApiResponse = {
          message: "Admin mode activated. This is a mock response demonstrating the research assistant interface. The system would normally analyze your query, search through academic papers, and provide AI-powered insights with relevant citations from arXiv and other academic databases.",
          papers: [
            {
              title: "Sample Research Paper: Advanced Machine Learning Techniques",
              url: "https://arxiv.org/pdf/2301.00001",
              authors: "Dr. Jane Smith, Prof. John Doe",
              abstract: "This paper explores cutting-edge machine learning methodologies and their applications in real-world scenarios. We present novel algorithms and demonstrate their effectiveness across multiple domains."
            },
            {
              title: "Quantum Computing Applications in Modern Research",
              url: "https://arxiv.org/pdf/2301.00002", 
              authors: "Dr. Alice Johnson, Dr. Bob Wilson",
              abstract: "An comprehensive overview of quantum computing applications in contemporary research, including optimization problems, cryptography, and simulation of quantum systems."
            },
            {
              title: "Neural Networks and Deep Learning: A Systematic Review",
              url: "https://arxiv.org/pdf/2301.00003",
              authors: "Prof. Sarah Chen, Dr. Michael Brown",
              abstract: "This systematic review examines the evolution of neural networks and deep learning architectures, analyzing their impact across various fields of study."
            }
          ]
        };
        setResponse(mockData);
        setIsLoading(false);
        toast({
          title: "Admin Demo Complete!",
          description: `Loaded ${mockData.papers.length} sample papers for demonstration.`,
        });
      }, 1500);
      return;
    }

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
      <header className="bg-card/80 backdrop-blur-xl border-b border-white/10 shadow-elegant sticky top-0 z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-primary shadow-glow">
                <Lightbulb className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  AI Research Assistant
                </h1>
                <p className="text-muted-foreground font-medium">
                  Explore academic research with AI-powered insights
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-muted/50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground font-medium">Live</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Search Interface */}
        <Card className="p-10 mb-8 shadow-elegant bg-card/60 backdrop-blur-xl border border-white/10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8">
              <div className="relative mb-6">
                <FileText className="h-16 w-16 text-research-primary mx-auto mb-4 drop-shadow-lg" />
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-research-primary/20 rounded-full blur-xl"></div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3 leading-tight">
                What would you like to research today?
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
                Enter any topic and get AI-powered insights with relevant academic papers from leading research databases
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., machine learning in healthcare, quantum computing applications..."
                  className="h-14 text-lg pl-4 pr-4 bg-background/80 backdrop-blur border-2 border-muted hover:border-primary/30 focus:border-primary transition-all duration-300 shadow-inner"
                  disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none"></div>
              </div>
              <Button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="h-14 px-8 bg-gradient-primary hover:shadow-glow transition-all duration-300 font-semibold"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Search className="h-5 w-5 mr-2" />
                )}
                {isLoading ? "Analyzing..." : "Research"}
              </Button>
            </div>
            
            {/* Suggestion Pills */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["Neural Networks", "Quantum Computing", "Climate Science", "Bioengineering"].map((topic) => (
                <button
                  key={topic}
                  onClick={() => setQuery(topic)}
                  className="px-4 py-2 text-sm bg-muted/50 hover:bg-muted transition-colors rounded-full text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Loading Animation */}
        {isLoading && <SimpleLoadingAnimation />}

        {/* Results Layout */}
        {response && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="p-8 shadow-elegant bg-card/60 backdrop-blur-xl border border-white/10 animate-fade-in-up">
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-primary/10">
                      <Lightbulb className="h-5 w-5 text-research-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Research Summary</h3>
                  </div>
                  <div className="h-1 w-20 bg-gradient-primary rounded-full shadow-glow"></div>
                </div>
                <div className="prose prose-slate max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-lg">
                    {response.message}
                  </p>
                </div>
              </Card>

              {/* Paper Viewer */}
              {selectedPaper && (
                <Card className="mt-6 shadow-elegant bg-card/60 backdrop-blur-xl border border-white/10 animate-fade-in-up overflow-hidden">
                  <div className="p-6 border-b border-white/10 bg-gradient-to-r from-muted/30 to-transparent">
                    <h4 className="font-bold text-foreground text-lg mb-2">{selectedPaper.title}</h4>
                    <p className="text-muted-foreground font-medium">{selectedPaper.authors}</p>
                  </div>
                  <div className="aspect-[4/5] bg-background/50 backdrop-blur">
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