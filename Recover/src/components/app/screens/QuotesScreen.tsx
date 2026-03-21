import { useState, useRef } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Plus, X, Sparkles, RefreshCw, Share2 } from 'lucide-react';
import { QUOTES, QUOTE_CATEGORIES, getQuotesByCategory, getQuoteOfTheDay } from '@/lib/quotes';
import type { QuoteCategory, CustomQuote } from '@/types/app';
import { PageTransition } from '@/components/animated/PageTransition';
import { AnimatedList, AnimatedListItem } from '@/components/animated/AnimatedList';
import { ShareCard } from '../ShareCard';
import { generateCardImage, shareCard } from '@/lib/share-manager';
import type { ShareData } from '@/lib/share-manager';
import { toast } from 'sonner';

export function QuotesScreen() {
  const {
    currentQuote,
    favoriteQuotes,
    customQuotes,
    setFavoriteQuotes,
    setCustomQuotes,
    refreshQuote
  } = useAppData();

  const [selectedCategory, setSelectedCategory] = useState<QuoteCategory | 'all'>('all');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newQuote, setNewQuote] = useState({
    text: '',
    author: '',
    category: 'recovery' as QuoteCategory
  });
  const [shareCardData, setShareCardData] = useState<ShareData | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Filter quotes based on selected category
  const filteredQuotes = selectedCategory === 'all'
    ? QUOTES
    : getQuotesByCategory(selectedCategory);

  // Toggle favorite
  const toggleFavorite = (quoteId: string) => {
    if (favoriteQuotes.includes(quoteId)) {
      setFavoriteQuotes(favoriteQuotes.filter(id => id !== quoteId));
      toast.success('Removed from favorites');
    } else {
      setFavoriteQuotes([...favoriteQuotes, quoteId]);
      toast.success('Added to favorites');
    }
  };

  // Add custom quote
  const handleAddCustomQuote = () => {
    if (!newQuote.text.trim()) {
      toast.error('Please enter a quote');
      return;
    }

    const customQuote: CustomQuote = {
      id: Date.now(),
      text: newQuote.text.trim(),
      author: newQuote.author.trim() || undefined,
      category: newQuote.category,
      dateAdded: new Date().toISOString()
    };

    setCustomQuotes([...customQuotes, customQuote]);
    toast.success('Custom quote added!');

    // Reset form
    setNewQuote({
      text: '',
      author: '',
      category: 'recovery'
    });
    setShowAddCustom(false);
  };

  // Delete custom quote
  const handleDeleteCustomQuote = (id: number) => {
    setCustomQuotes(customQuotes.filter(q => q.id !== id));
    toast.success('Custom quote deleted');
  };

  // Share quote
  const handleShareQuote = async (quoteText: string, author?: string) => {
    const data: ShareData = {
      type: 'quote',
      title: 'Daily Inspiration',
      description: author ? `— ${author}` : '',
      primaryValue: `"${quoteText}"`,
      emoji: '💬',
      backgroundColor: 'from-indigo-500 to-blue-600',
      includeWatermark: true
    };

    setShareCardData(data);
    setIsSharing(true);

    // Wait for ShareCard to render
    setTimeout(async () => {
      if (shareCardRef.current) {
        const blob = await generateCardImage(shareCardRef.current);
        if (blob) {
          await shareCard(blob, data.title, quoteText);
        }
      }
      setIsSharing(false);
      setShareCardData(null);
    }, 100);
  };

  // Get favorite quotes
  const favoriteQuotesList = QUOTES.filter(q => favoriteQuotes.includes(q.id));

  return (
    <PageTransition className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inspirational Quotes</h2>
        <Button
          onClick={refreshQuote}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          New Quote
        </Button>
      </div>

      {/* Quote of the Day */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/10 border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-blue-500">Quote of the Day</span>
          </div>
          <p className="text-xl font-medium italic mb-3">"{currentQuote.text}"</p>
          {currentQuote.author && (
            <p className="text-sm text-muted-foreground">— {currentQuote.author}</p>
          )}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleFavorite(currentQuote.id)}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${favoriteQuotes.includes(currentQuote.id) ? 'fill-red-500 text-red-500' : ''}`}
              />
              {favoriteQuotes.includes(currentQuote.id) ? 'Favorited' : 'Favorite'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShareQuote(currentQuote.text, currentQuote.author)}
              disabled={isSharing}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="favorites">
            Favorites ({favoriteQuotes.length})
          </TabsTrigger>
          <TabsTrigger value="custom">
            Custom ({customQuotes.length})
          </TabsTrigger>
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse" className="space-y-4 mt-6">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All ({QUOTES.length})
            </Button>
            {Object.entries(QUOTE_CATEGORIES).map(([key, meta]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(key as QuoteCategory)}
              >
                {meta.emoji} {meta.label}
              </Button>
            ))}
          </div>

          {/* Quotes List */}
          <AnimatedList className="space-y-3" staggerDelay={0.05}>
            {filteredQuotes.map(quote => {
              const isFavorite = favoriteQuotes.includes(quote.id);
              const categoryMeta = QUOTE_CATEGORIES[quote.category];

              return (
                <AnimatedListItem key={quote.id}>
                  <Card className={isFavorite ? 'border-red-500/50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-muted">
                              {categoryMeta.emoji} {categoryMeta.label}
                            </span>
                          </div>
                          <p className="font-medium mb-2">"{quote.text}"</p>
                          {quote.author && (
                            <p className="text-sm text-muted-foreground">— {quote.author}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(quote.id)}
                        >
                          <Heart
                            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                          />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedListItem>
              );
            })}
          </AnimatedList>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-4 mt-6">
          {favoriteQuotesList.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No favorite quotes yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tap the heart icon on any quote to add it to your favorites
                </p>
              </CardContent>
            </Card>
          ) : (
            <AnimatedList className="space-y-3" staggerDelay={0.05}>
              {favoriteQuotesList.map(quote => {
                const categoryMeta = QUOTE_CATEGORIES[quote.category];

                return (
                  <AnimatedListItem key={quote.id}>
                    <Card className="border-red-500/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-muted">
                                {categoryMeta.emoji} {categoryMeta.label}
                              </span>
                            </div>
                            <p className="font-medium mb-2">"{quote.text}"</p>
                            {quote.author && (
                              <p className="text-sm text-muted-foreground">— {quote.author}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(quote.id)}
                          >
                            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedListItem>
                );
              })}
            </AnimatedList>
          )}
        </TabsContent>

        {/* Custom Quotes Tab */}
        <TabsContent value="custom" className="space-y-4 mt-6">
          <Button
            onClick={() => setShowAddCustom(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Quote
          </Button>

          {customQuotes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No custom quotes yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your own inspiring quotes that resonate with you
                </p>
              </CardContent>
            </Card>
          ) : (
            <AnimatedList className="space-y-3" staggerDelay={0.05}>
              {customQuotes.map(quote => {
                const categoryMeta = QUOTE_CATEGORIES[quote.category];

                return (
                  <AnimatedListItem key={quote.id}>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-muted">
                                {categoryMeta.emoji} {categoryMeta.label}
                              </span>
                              <span className="text-xs text-muted-foreground">Custom</span>
                            </div>
                            <p className="font-medium mb-2">"{quote.text}"</p>
                            {quote.author && (
                              <p className="text-sm text-muted-foreground">— {quote.author}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCustomQuote(quote.id)}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedListItem>
                );
              })}
            </AnimatedList>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Custom Quote Modal */}
      {showAddCustom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Custom Quote</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddCustom(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="quote-text">Quote *</Label>
                <Textarea
                  id="quote-text"
                  value={newQuote.text}
                  onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })}
                  placeholder="Enter an inspiring quote..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="quote-author">Author (optional)</Label>
                <Input
                  id="quote-author"
                  value={newQuote.author}
                  onChange={(e) => setNewQuote({ ...newQuote, author: e.target.value })}
                  placeholder="Who said this?"
                />
              </div>

              <div>
                <Label htmlFor="quote-category">Category</Label>
                <Select
                  value={newQuote.category}
                  onValueChange={(value) => setNewQuote({ ...newQuote, category: value as QuoteCategory })}
                >
                  <SelectTrigger id="quote-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(QUOTE_CATEGORIES).map(([key, meta]) => (
                      <SelectItem key={key} value={key}>
                        {meta.emoji} {meta.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddCustom(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCustomQuote}
                  className="flex-1"
                >
                  Add Quote
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hidden ShareCard for generating images */}
      {shareCardData && (
        <div className="fixed -left-[9999px] -top-[9999px]">
          <ShareCard ref={shareCardRef} data={shareCardData} />
        </div>
      )}
    </PageTransition>
  );
}
