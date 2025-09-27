import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { SimpleLoadingAnimation } from "@/components/SimpleLoadingAnimation";
import { CollapsiblePaperSidebar } from "@/components/CollapsiblePaperSidebar";
import { PaperViewModal } from "@/components/PaperViewModal";
import { useToast } from "@/hooks/use-toast";

interface ArxivPaperValue {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  similarity_score: number;
  url: string;
  primary_category: string;
  file_path: string;
  matched_keywords: string[];
}

interface ArxivPaper {
  _value: ArxivPaperValue;
}

interface ArxivPaperFlat {
  title: string;
  url: string;
  authors: string;
  abstract: string;
}

interface ApiResponse {
  message: string;
  papers: ArxivPaper[];
  flatPapers?: ArxivPaperFlat[];
}

export default function Results() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<ArxivPaperFlat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  const initialQuery = searchParams.get('q');

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setResponse(null);

    // Admin bypass
    if (searchQuery.toLowerCase().trim() === "admin") {
      setTimeout(() => {
        const mockData: ApiResponse = {
          message: "Admin mode activated. This is a mock response demonstrating the research assistant interface. The system would normally analyze your query, search through academic papers, and provide AI-powered insights with relevant citations from arXiv and other academic databases.",
          papers: [
            {
              _value: {
                id: "2301.00001",
                title: "Sample Research Paper: Advanced Machine Learning Techniques",
                url: "https://arxiv.org/pdf/2301.00001",
                authors: ["Dr. Jane Smith", "Prof. John Doe"],
                abstract: "This paper explores cutting-edge machine learning methodologies and their applications in real-world scenarios. We present novel algorithms and demonstrate their effectiveness across multiple domains.",
                similarity_score: 0.95,
                primary_category: "cs.LG",
                file_path: "papers_text/2301.00001.txt",
                matched_keywords: ["machine learning", "algorithms"]
              }
            },
            {
              _value: {
                id: "2301.00002",
                title: "Quantum Computing Applications in Modern Research",
                url: "https://arxiv.org/pdf/2301.00002",
                authors: ["Dr. Alice Johnson", "Dr. Bob Wilson"],
                abstract: "An comprehensive overview of quantum computing applications in contemporary research, including optimization problems, cryptography, and simulation of quantum systems.",
                similarity_score: 0.92,
                primary_category: "quant-ph",
                file_path: "papers_text/2301.00002.txt",
                matched_keywords: ["quantum computing", "cryptography"]
              }
            },
            {
              _value: {
                id: "2301.00003",
                title: "Neural Networks and Deep Learning: A Systematic Review",
                url: "https://arxiv.org/pdf/2301.00003",
                authors: ["Prof. Sarah Chen", "Dr. Michael Brown"],
                abstract: "This systematic review examines the evolution of neural networks and deep learning architectures, analyzing their impact across various fields of study.",
                similarity_score: 0.89,
                primary_category: "cs.LG",
                file_path: "papers_text/2301.00003.txt",
                matched_keywords: ["neural networks", "deep learning"]
              }
            }
          ]
        };
        
        // Transform mock data too
        const transformedMockData = {
          ...mockData,
          flatPapers: mockData.papers?.map(paper => ({
            title: paper._value.title,
            url: paper._value.url,
            authors: paper._value.authors.join(', '),
            abstract: paper._value.abstract
          })) || []
        };
        
        setResponse(transformedMockData);
        setIsLoading(false);
        toast({
          title: "Admin Demo Complete!",
          description: `Loaded ${mockData.papers.length} sample papers for demonstration.`,
        });
      }, 1500);
      return;
    }

    try {
      const res = await fetch("https://pathway-hackathon-2025.onrender.com/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: searchQuery }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: ApiResponse = await res.json();
      
      // Transform papers to flat structure for easier use
      const transformedData = {
        ...data,
        flatPapers: data.papers?.map(paper => ({
          title: paper._value.title,
          url: paper._value.url,
          authors: paper._value.authors.join(', '),
          abstract: paper._value.abstract
        })) || []
      };
      
      setResponse(transformedData);
      
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

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Please enter a research topic",
        description: "Enter a topic you'd like to explore to get started.",
        variant: "destructive",
      });
      return;
    }

    // Update URL and perform search
    navigate(`/results?q=${encodeURIComponent(query)}`);
    await performSearch(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSearch();
    }
  };

  const handlePaperClick = (paper: ArxivPaperFlat) => {
    setSelectedPaper(paper);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header with Search */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-white/10 shadow-elegant sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="p-2 hover:bg-muted/50"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-primary shadow-glow">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-foreground">AI Research Assistant</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4 flex-1 max-w-2xl mx-8">
              <div className="relative flex-1">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search research topics..."
                  className="h-10 pl-4 pr-4 bg-background/80 backdrop-blur border border-muted hover:border-primary/30 focus:border-primary transition-all duration-300"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="h-10 px-6 bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-muted/50"
            >
              <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Loading Animation */}
        {isLoading && <SimpleLoadingAnimation />}

        {/* Results Layout */}
        {response && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
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
            </div>

            {/* Papers Sidebar */}
            {!sidebarCollapsed && (
              <div className="lg:col-span-1">
                <CollapsiblePaperSidebar
                  papers={response.flatPapers || []}
                  onPaperClick={handlePaperClick}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Paper View Modal */}
      <PaperViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPaper={selectedPaper}
        allPapers={response?.flatPapers || []}
        onPaperSelect={setSelectedPaper}
        llmResponse={response?.message || ""}
      />
    </div>
  );
}
