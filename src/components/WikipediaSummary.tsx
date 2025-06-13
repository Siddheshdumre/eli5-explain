
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface WikipediaSummaryProps {
  summary: string;
}

const WikipediaSummary: React.FC<WikipediaSummaryProps> = ({ summary }) => {
  if (!summary) return null;

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-green-100 rounded-lg">
            <BookOpen className="h-5 w-5 text-green-600" />
          </div>
          Background Information
        </CardTitle>
        <CardDescription className="text-gray-600">
          Context from Wikipedia to enhance your explanation
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed text-lg">{summary}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WikipediaSummary;
