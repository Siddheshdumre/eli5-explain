
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface WikipediaSummaryProps {
  summary: string;
}

const WikipediaSummary: React.FC<WikipediaSummaryProps> = ({ summary }) => {
  if (!summary) return null;

  return (
    <Card className="shadow-2xl border border-gray-800 bg-gray-900/90 backdrop-blur-xl">
      <CardHeader className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-b border-gray-700">
        <CardTitle className="flex items-center gap-3 text-xl text-white">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <BookOpen className="h-5 w-5 text-green-400" />
          </div>
          Background Information
        </CardTitle>
        <CardDescription className="text-gray-400">
          Context from Wikipedia to enhance your explanation
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-300 leading-relaxed text-lg">{summary}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WikipediaSummary;
