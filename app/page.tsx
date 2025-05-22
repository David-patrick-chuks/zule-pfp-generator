"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, X, ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ZulePfpGenerator() {
  const [username, setUsername] = useState("");
  const [inscription, setInscription] = useState("");
  const [hatColor, setHatColor] = useState("");
  const [gender, setGender] = useState("");
  const [description, setDescription] = useState("");
  const [customColor, setCustomColor] = useState("#5CEFFF");
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
  const alertsContainerRef = useRef(null);

  // Backend API base URL
  const API_BASE_URL = "https://zule-pfp-backend.onrender.com";

  // Function to generate a random alert (keeping for user experience)
  const generateRandomAlert = () => {
    const sampleUsernames = [
      "ZuleWarrior",
      "CryptoRaider",
      "TokenHunter",
      "MoonShot",
      "DiamondHands",
      "CoinCollector",
      "BlockchainBro",
      "SatoshiFan",
      "CryptoQueen",
      "TokenKing",
    ];
    const randomUsername = sampleUsernames[Math.floor(Math.random() * sampleUsernames.length)];
    const randomTime = Math.floor(Math.random() * 60) + 1;
    const newAlert = {
      id: Date.now(),
      username: randomUsername,
      timeAgo: `${randomTime} seconds ago`,
    };

    setAlerts((prevAlerts) => [...prevAlerts, newAlert]);

    setTimeout(() => {
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== newAlert.id));
    }, 8000);
  };

  // Generate random alerts
  useEffect(() => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => generateRandomAlert(), i * 2000);
    }
    const interval = setInterval(() => {
      generateRandomAlert();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch gallery items from backend
  useEffect(() => {
    fetchGallery();
  }, [currentPage]);

async function fetchGallery() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/gallery?page=${currentPage}`);
      if (!res.ok) throw new Error("Failed to fetch gallery");
      const { total, items } = await res.json();
      setGalleryItems((prevItems) => [...prevItems, ...items]); // Append new items
      setTotalItems(total);
    } catch (error) {
      console.error("Error loading gallery:", error);
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        {
          id: Date.now(),
          username: "System",
          timeAgo: "just now",
          message: "Failed to load gallery. Please try again.",
        },
      ]);
    }
  }

  const handleGenerate = async () => {
    if (!username) {
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        {
          id: Date.now(),
          username: "System",
          timeAgo: "just now",
          message: "Please enter a username",
        },
      ]);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          inscription: inscription || "ZULE Army",
          hatColor: isCustomColor ? "custom" : hatColor,
          gender,
          description: description || "A crypto raider repping ZULE",
          customColor: isCustomColor ? customColor : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      setGalleryItems((prev) => [data.galleryItem, ...prev]);

      // Add success alert
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        {
          id: Date.now(),
          username,
          timeAgo: "just now",
          message: "PFP generated successfully!",
        },
      ]);

      // Remove alert after 5 seconds
      setTimeout(() => {
        setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.message !== "PFP generated successfully!"));
      }, 5000);
    } catch (error) {
      console.error("Error generating image:", error);
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        {
          id: Date.now(),
          username: "System",
          timeAgo: "just now",
          message: "Failed to generate PFP. Please try again.",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShowMore = () => {
    if (galleryItems.length < totalItems) {
      setCurrentPage((prev) => prev + 1);
    }
  };


  const handleGalleryItemClick = (item) => {
    setSelectedGalleryItem(item);
  };

  const navigateGallery = (direction) => {
    if (!selectedGalleryItem) return;

    const currentIndex = galleryItems.findIndex((item) => item.id === selectedGalleryItem.id);
    let newIndex;

    if (direction === "next") {
      newIndex = (currentIndex + 1) % galleryItems.length;
    } else {
      newIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    }

    setSelectedGalleryItem(galleryItems[newIndex]);
  };

const handleShare = (imageUrl, username) => {
  const shareText = `I just generated my ZULE Raider PFP as ${username}! Check it out at:`;
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(shareText);

  // Try using navigator.share for mobile devices
  if (navigator.share) {
    navigator
      .share({
        title: "ZULE Raider PFP Generator",
        text: shareText,
        url: window.location.href,
      })
      .then(() => {
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          {
            id: Date.now(),
            username: "System",
            timeAgo: "just now",
            message: "Shared successfully!",
          },
        ]);
      })
      .catch((error) => {
        console.error("Error sharing:", error);
        // Fallback to Twitter intent if navigator.share fails
        window.open(
          `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
          "_blank"
        );
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          {
            id: Date.now(),
            username: "System",
            timeAgo: "just now",
            message: "Opened Twitter to share your PFP!",
          },
        ]);
      });
  } else {
    // Fallback for desktop: Open Twitter intent
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank"
    );
    setAlerts((prevAlerts) => [
      ...prevAlerts,
      {
        id: Date.now(),
        username: "System",
        timeAgo: "just now",
        message: "Opened Twitter to share your PFP!",
      },
    ]);
  }
};

  // Download function
const downloadImage = async (imageUrl, fileName = "zule-pfp.png") => {
  try {
    const response = await fetch(imageUrl, { mode: "cors" });
    if (!response.ok) throw new Error("Failed to fetch image");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading image:", error);
    return { error: "Failed to download image. Please try again." };
  }
};



  // Handle download with error alert
  const handleDownload = async (imageUrl, username) => {
    const result = await downloadImage(imageUrl, `${username || "zule"}-pfp.png`);
    if (result?.error) {
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        {
          id: Date.now(),
          username: "System",
          timeAgo: "just now",
          message: result.error,
        },
      ]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0e17]">
      {/* Live Alerts Container */}
      <div
        ref={alertsContainerRef}
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md pointer-events-none"
      >
        {alerts.map((alert) => (
          <div key={alert.id} className="animate-in fade-in slide-in-from-right-5 duration-300 pointer-events-auto">
            <Alert className="bg-[#0f1623] border border-[#1a2436] text-white">
              <AlertCircle className="h-4 w-4 text-[#5CEFFF]" />
              <AlertDescription className="flex items-center font-mono text-sm">
                <span className="text-[#5CEFFF] font-medium mr-1">{alert.username}</span>
                <span className="text-gray-300">{alert.message || `generated a PFP ${alert.timeAgo}`}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto -mr-2 h-6 w-6 text-gray-400 hover:text-white hover:bg-[#1a2436]"
                  onClick={() => setAlerts((prevAlerts) => prevAlerts.filter((a) => a.id !== alert.id))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        ))}
      </div>

      <header className="relative z-10 text-center py-10 px-4 border-b border-[#1a2436]">
        <h1 className="text-4xl md:text-5xl font-bold text-[#5CEFFF] mb-2 tracking-wider">ZULE Raider PFP Generator</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">Customize your character and rep the $ZULE token with style!</p>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 md:px-8 lg:px-12 py-10 relative z-10 max-w-7xl mx-auto w-full">
        {/* Main Form Card */}
        <Card className="w-full bg-[#0f1623] border border-[#1a2436] text-white mb-16">
          <CardHeader className="border-b border-[#1a2436]">
            <CardTitle className="text-center text-[#5CEFFF] text-2xl">Create Your Raider</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-200 font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="e.g., RaiderJoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-[#0a0e17] border-[#1a2436] text-white focus:border-[#5CEFFF] focus:ring-0 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inscription" className="text-gray-200 font-medium">
                    Choose Face Cap Inscription
                  </Label>
                  <Select value={inscription} onValueChange={setInscription}>
                    <SelectTrigger className="bg-[#0a0e17] border-[#1a2436] text-white focus:ring-0 font-mono">
                      <SelectValue placeholder="Select inscription" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1623] border-[#1a2436] text-white font-mono">
                      <SelectItem value="buy">Buy $ZULE Now!</SelectItem>
                      <SelectItem value="army">ZULE Army</SelectItem>
                      <SelectItem value="trust">In ZULE We Trust</SelectItem>
                      <SelectItem value="raid">Raid Ready</SelectItem>
                      <SelectItem value="gang">ZULE Gang</SelectItem>
                      <SelectItem value="hold">Hold the Line</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hatColor" className="text-gray-200 font-medium">
                    Hat Color
                  </Label>
                  <Select
                    value={hatColor}
                    onValueChange={(value) => {
                      setHatColor(value);
                      setIsCustomColor(value === "custom");
                    }}
                  >
                    <SelectTrigger className="bg-[#0a0e17] border-[#1a2436] text-white focus:ring-0 font-mono">
                      <SelectValue placeholder="Select hat color" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1623] border-[#1a2436] text-white font-mono">
                      <SelectItem value="blue-white">Blue/White</SelectItem>
                      <SelectItem value="red-black">Red/Black</SelectItem>
                      <SelectItem value="green-yellow">Green/Yellow</SelectItem>
                      <SelectItem value="pink-white">Pink/White</SelectItem>
                      <SelectItem value="black-gold">Black/Gold</SelectItem>
                      <SelectItem value="custom">Custom Hex Color</SelectItem>
                    </SelectContent>
                  </Select>

                  {isCustomColor && (
                    <div className="pt-2">
                      <Label htmlFor="customColor" className="text-gray-200 text-sm font-medium">
                        Custom Color
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="customColor"
                          type="color"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="w-12 h-10 p-1 bg-transparent border-[#1a2436] font-mono"
                        />
                        <Input
                          type="text"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="flex-1 bg-[#0a0e17] border-[#1a2436] text-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-gray-200 font-medium">
                    Character Gender
                  </Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="bg-[#0a0e17] border-[#1a2436] text-white focus:ring-0 font-mono">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1623] border-[#1a2436] text-white font-mono">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-Binary</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-200 font-medium">
                    Describe the Character
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., Smiling anime guy with brown hair and a casual hoodie"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px] bg-[#0a0e17] border-[#1a2436] text-white focus:border-[#5CEFFF] focus:ring-0 font-mono"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-[#5CEFFF] hover:bg-[#5CEFFF]/90 text-[#0a0e17] font-bold py-3 rounded-md transition-all duration-200 font-mono"
                >
                  {isGenerating ? "Generating..." : "Generate PFP"}
                </Button>
              </div>

              {/* Preview Section */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-full aspect-square max-w-[400px] rounded-lg border border-[#1a2436] flex items-center justify-center overflow-hidden bg-[#0a0e17] relative">
                  {generatedImage ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={generatedImage || "/placeholder.svg"}
                        alt="Generated PFP"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-[#0a0e17]/90 flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#1a2436] text-gray-200 hover:bg-[#1a2436] hover:text-white font-mono"
                            onClick={() => handleDownload(generatedImage, username)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#1a2436] text-gray-200 hover:bg-[#1a2436] hover:text-white font-mono"
                          onClick={handleShare}
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 flex flex-col justify-center items-center text-gray-400 font-mono">
                      <div className="mb-4 opacity-50">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="64"
                          height="64"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                      <p>Your PFP will appear here</p>
                    </div>
                  )}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-[#0a0e17]/90 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#5CEFFF]"></div>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-center text-gray-300 text-sm font-mono">
                  {generatedImage && "Your ZULE Raider PFP is ready!"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Gallery Section */}
        <div className="w-full mb-16">
          <h2 className="text-2xl font-bold text-[#5CEFFF] mb-8 text-center tracking-wider">Community Gallery</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 md:gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => handleGalleryItemClick(item)}
              >
                <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-[#1a2436] bg-[#0a0e17] transition-all duration-200 group-hover:border-[#5CEFFF]">
                  <Image
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={`PFP by ${item.username}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="mt-2 text-gray-300 capitalize text-sm font-medium font-mono">{item.username}</p>
              </div>
            ))}
          </div>

      {totalItems > 0 && galleryItems.length < totalItems && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleShowMore}
                variant="outline"
                className="border-[#1a2436] text-gray-200 hover:bg-[#1a2436] hover:text-white font-mono"
              >
                See More
              </Button>
            </div>
          )}
        </div>

        {/* Gallery Modal */}
        <Dialog open={!!selectedGalleryItem} onOpenChange={(open) => !open && setSelectedGalleryItem(null)}>
          <DialogContent className="bg-[#0f1623] border border-[#1a2436] text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#5CEFFF] text-xl">{selectedGalleryItem?.username}'s PFP</DialogTitle>
              <DialogDescription className="text-gray-400 font-mono">
                Inscription: {selectedGalleryItem?.inscription}
              </DialogDescription>
            </DialogHeader>

            <div className="relative aspect-square w-full max-w-md mx-auto my-4 rounded-lg overflow-hidden border border-[#1a2436]">
              {selectedGalleryItem && (
                <Image
                  src={selectedGalleryItem.imageUrl || "/placeholder.svg"}
                  alt={`PFP by ${selectedGalleryItem.username}`}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white hover:bg-[#1a2436]"
                onClick={() => navigateGallery("prev")}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#1a2436] text-gray-200 hover:bg-[#1a2436] hover:text-white font-mono"
                  onClick={() => window.open(selectedGalleryItem?.imageUrl, "_blank")}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#1a2436] text-gray-200 hover:bg-[#1a2436] hover:text-white font-mono"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white hover:bg-[#1a2436]"
                onClick={() => navigateGallery("next")}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <footer className="relative z-10 text-center py-6 px-4 text-gray-500 text-sm border-t border-[#1a2436] font-mono">
        <p className="text-gray-500 text-sm font-jetbrains">
          © {new Date().getFullYear()} ZULE AI. All rights reserved.
        </p>
        <p className="mt-4 text-xs text-gray-700 font-jetbrains">Powered by the shadows</p>
      </footer>
    </div>
  );
}