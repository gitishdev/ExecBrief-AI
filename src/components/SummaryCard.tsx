import React, { useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { Download, Linkedin, Twitter, ExternalLink, Loader2, Youtube, Link, Check } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import LZString from 'lz-string';
import { cn } from '../lib/utils';

interface SummaryCardProps {
  url: string;
  summary: string;
  className?: string;
}

export function SummaryCard({ url, summary, className }: SummaryCardProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const sourceLinkRef = useRef<HTMLAnchorElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsDownloading(true);
    
    try {
      // Add a class to apply print-like styles during capture
      printRef.current.classList.add('pdf-exporting');
      
      const dataUrl = await toJpeg(printRef.current, {
        quality: 0.85,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        style: {
          margin: '0',
        }
      });
      
      let linkCoords = null;
      if (sourceLinkRef.current && printRef.current) {
        const containerRect = printRef.current.getBoundingClientRect();
        const linkRect = sourceLinkRef.current.getBoundingClientRect();
        linkCoords = {
          x: linkRect.left - containerRect.left,
          y: linkRect.top - containerRect.top,
          w: linkRect.width,
          h: linkRect.height,
          containerW: containerRect.width,
          containerH: containerRect.height
        };
      }

      printRef.current.classList.remove('pdf-exporting');
      
      // Get image dimensions
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => { img.onload = resolve; });
      
      // Create a PDF with dimensions matching the canvas to ensure nothing is cut off
      const pdf = new jsPDF({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [img.width, img.height]
      });
      
      pdf.addImage(dataUrl, 'JPEG', 0, 0, img.width, img.height);
      
      if (linkCoords) {
        const scaleX = img.width / linkCoords.containerW;
        const scaleY = img.height / linkCoords.containerH;
        pdf.link(
          linkCoords.x * scaleX,
          linkCoords.y * scaleY,
          linkCoords.w * scaleX,
          linkCoords.h * scaleY,
          { url: url }
        );
      }

      pdf.save('execbrief-synthesis.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      if (printRef.current) {
        printRef.current.classList.remove('pdf-exporting');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    try {
      const data = JSON.stringify({ url, summary });
      const compressed = LZString.compressToEncodedURIComponent(data);
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${compressed}`;
      
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to generate share link", err);
      alert("Failed to generate share link.");
    }
  };

  const handleShareLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
  };

  const handleShareTwitter = () => {
    const text = `Check out this executive synthesis of: ${url}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className={cn("bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col", className)}>
      <div className="p-6 md:p-8 flex-grow bg-white" ref={printRef}>
        
        {/* PDF Export Header (Hidden by default, shown during PDF export) */}
        <div className="hidden print:flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
          <div className="bg-slate-900 p-1.5 rounded-md">
            <Youtube className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">ExecBrief AI</span>
        </div>

        <div className="flex justify-between items-start mb-6 print:hidden">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Source Video
          </a>
        </div>
        
        <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-a:text-blue-600">
          <Markdown>{summary}</Markdown>
        </div>
        
        {/* Print-only source link */}
        <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500">
          Source: <a ref={sourceLinkRef} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 no-underline">{url}</a>
        </div>
      </div>
      
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-wrap gap-3 print:hidden">
        <button 
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {isDownloading ? 'Generating PDF...' : 'Download PDF'}
        </button>
        <button 
          onClick={handleCopyLink}
          className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Link className="w-4 h-4 mr-2" />
              Copy Link
            </>
          )}
        </button>
        <button 
          onClick={handleShareLinkedIn}
          className="inline-flex items-center px-4 py-2 bg-[#0A66C2] text-white text-sm font-medium rounded-lg hover:bg-[#004182] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A66C2]"
        >
          <Linkedin className="w-4 h-4 mr-2" />
          Share
        </button>
        <button 
          onClick={handleShareTwitter}
          className="inline-flex items-center px-4 py-2 bg-[#1DA1F2] text-white text-sm font-medium rounded-lg hover:bg-[#0c85d0] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1DA1F2]"
        >
          <Twitter className="w-4 h-4 mr-2" />
          Tweet
        </button>
      </div>
    </div>
  );
}
