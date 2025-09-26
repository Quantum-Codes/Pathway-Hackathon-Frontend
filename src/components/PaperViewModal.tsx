import { useState } from "react";
import { X, FileText, Lightbulb, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ArxivPaper {
  title: string;
  url: string;
  authors: string;
  abstract: string;
}

interface PaperViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPaper: ArxivPaper | null;
  allPapers: ArxivPaper[];
  onPaperSelect: (paper: ArxivPaper) => void;
  llmResponse: string;
}

export function PaperViewModal({ 
  isOpen, 
  onClose, 
  selectedPaper, 
  allPapers, 
  onPaperSelect, 
  llmResponse 
}: PaperViewModalProps) {
  if (!selectedPaper) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0 bg-background/95 backdrop-blur-xl border border-white/20">
        {/* Modal Header with Paper Tabs */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-card/60">
          <div className="flex items-center space-x-4 flex-1">
            <div className="p-2 rounded-lg bg-gradient-primary/10">
              <FileText className="h-5 w-5 text-research-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground truncate">Paper Viewer</h2>
              <p className="text-sm text-muted-foreground">Research Analysis</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Paper Navigation Tabs */}
        <div className="border-b border-white/10 bg-muted/20">
          <ScrollArea className="w-full">
            <div className="flex p-2 gap-2 min-w-max">
              {allPapers.map((paper, index) => (
                <Button
                  key={index}
                  variant={selectedPaper === paper ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onPaperSelect(paper)}
                  className={`min-w-[200px] justify-start text-left ${
                    selectedPaper === paper 
                      ? "bg-gradient-primary text-white shadow-glow" 
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="truncate">
                    <div className="font-medium text-xs truncate">
                      {paper.title.substring(0, 40)}...
                    </div>
                    <div className="text-xs opacity-70 truncate">
                      {paper.authors.split(',')[0]}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Split View Content */}
        <div className="flex flex-1 h-full overflow-hidden">
          {/* LLM Response - Left Side */}
          <div className="w-1/2 border-r border-white/10 flex flex-col bg-card/30">
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-muted/30 to-transparent">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-research-primary" />
                <h3 className="font-bold text-foreground">AI Analysis</h3>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="prose prose-slate max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {llmResponse}
                </p>
              </div>
            </ScrollArea>
          </div>

          {/* Paper Viewer - Right Side */}
          <div className="w-1/2 flex flex-col bg-background/30">
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-muted/30 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-foreground text-sm leading-tight mb-1">
                    {selectedPaper.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedPaper.authors}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedPaper.url, '_blank')}
                  className="h-8 gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </Button>
              </div>
            </div>
            
            <div className="flex-1 bg-background/50">
              <iframe
                src={selectedPaper.url}
                className="w-full h-full border-0"
                title={selectedPaper.title}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}