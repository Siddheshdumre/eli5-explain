
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Mic, Volume2, BookOpen, Users, Zap, Globe, Shield, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Features = () => {
  const mainFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Explanations",
      description: "Advanced AI technology that understands context and adapts explanations to your needs",
      details: [
        "Powered by state-of-the-art language models",
        "Context-aware responses",
        "Continuously improving accuracy",
        "Multi-domain knowledge base"
      ]
    },
    {
      icon: Users,
      title: "Multiple Difficulty Levels",
      description: "From ELI5 (Explain Like I'm 5) to expert level explanations",
      details: [
        "Beginner-friendly explanations",
        "Intermediate depth analysis",
        "Expert-level technical details",
        "Adaptive complexity scaling"
      ]
    },
    {
      icon: Mic,
      title: "Voice Input",
      description: "Ask questions naturally using your voice for hands-free interaction",
      details: [
        "Speech recognition technology",
        "Multi-language support",
        "Natural conversation flow",
        "Noise cancellation"
      ]
    },
    {
      icon: Volume2,
      title: "Text-to-Speech",
      description: "Listen to explanations with high-quality voice synthesis",
      details: [
        "Natural-sounding voices",
        "Adjustable speech rate",
        "Multiple voice options",
        "Perfect pronunciation"
      ]
    },
    {
      icon: BookOpen,
      title: "Wikipedia Integration",
      description: "Enhanced with real-time Wikipedia context for comprehensive understanding",
      details: [
        "Real-time Wikipedia data",
        "Contextual background information",
        "Fact-checking support",
        "Rich multimedia content"
      ]
    },
    {
      icon: Zap,
      title: "Format Options",
      description: "Choose how you want to receive information - stories, technical breakdowns, or standard format",
      details: [
        "Storytelling format with analogies",
        "Technical bullet points",
        "Standard explanations",
        "Visual diagrams (coming soon)"
      ]
    }
  ];

  const additionalFeatures = [
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Get explanations in your preferred language"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your questions and data are always kept private and secure"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ELI5.AI
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover all the ways ELI5.AI can transform your learning experience with 
            cutting-edge AI technology and intuitive design.
          </p>
        </div>

        {/* Main Features */}
        <section className="mb-20">
          <div className="grid lg:grid-cols-2 gap-8">
            {mainFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{detail}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Additional Features */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional Features</h2>
            <p className="text-lg text-gray-600">More ways we make learning better</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Demo Section */}
        <section className="mb-16">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-100 to-purple-100">
            <CardContent className="p-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">See It In Action</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Experience the power of ELI5.AI with our interactive demo. 
                    Ask any question and see how our AI adapts its response to your chosen difficulty level.
                  </p>
                  <Link to="/app">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Try Demo Now
                    </Button>
                  </Link>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b">
                      <Brain className="h-6 w-6 text-blue-600" />
                      <span className="font-semibold">ELI5.AI Demo</span>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Question:</div>
                        <div className="font-medium">"How does artificial intelligence work?"</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">ELI5 Answer:</div>
                        <div className="text-sm">"Imagine AI like a really smart robot brain that learns by looking at lots of examples..."</div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Difficulty: Beginner</span>
                        <span>Format: Storytelling</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Experience These Features?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of learners who are already using ELI5.AI to understand complex topics effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/app">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-purple-600">
                    Try Demo First
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Features;
