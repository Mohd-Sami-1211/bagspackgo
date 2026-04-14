'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageSquare,
  Share2,
  Plus,
  Image as ImageIcon,
  X,
  MapPin,
  TrendingUp,
  Award,
  Camera,
  Send,
  Star,
  MoreHorizontal,
  ThumbsUp
} from 'lucide-react';

// shadcn/ui primitives
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// ─── Animation Variants ────────────────────────────────────
const TAB_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
};

const MODAL_VARIANTS = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

// ─── Star Rating Component ─────────────────────────────────
const StarRating = ({ rating, size = 'md', interactive = false, onChange }) => {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7', xl: 'w-9 h-9' };
  const iconSize = sizeMap[size] || sizeMap.md;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={cn(
            "transition-transform",
            interactive && "hover:scale-110 focus:outline-none cursor-pointer",
            !interactive && "cursor-default"
          )}
        >
          <Star
            className={cn(
              iconSize,
              star <= rating
                ? "fill-[#fbbc04] text-[#fbbc04] drop-shadow-sm"
                : "fill-none text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
};

// ─── Main Community Component ───────────────────────────────
const CommunityMainContent = () => {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('stories');

  // Modals state
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Form states
  const [storyForm, setStoryForm] = useState({ name: '', content: '', location: '', imagePreview: null });
  const [reviewForm, setReviewForm] = useState({ name: '', title: '', content: '', rating: 5 });
  const fileInputRef = useRef(null);

  const [stories, setStories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Comment and Dropdown states
  const [expandedComments, setExpandedComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (id) => {
    setOpenDropdowns(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleComments = (id) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCommentSubmit = async (e, id) => {
     e.preventDefault();
     if (!user) {
         openAuthModal();
         return;
     }
     if (!commentText[id]?.trim()) return;
     
     try {
       const res = await fetch(`/api/community/stories/${id}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: commentText[id] })
       });
       const data = await res.json();
       if (data.success) {
          setCommentText(prev => ({ ...prev, [id]: '' }));
          setStories(stories.map(s => {
             if (s._id === id) {
                return {
                   ...s,
                   comments: data.count,
                   commentsArray: [...(s.commentsArray || []), data.comment]
                }
             }
             return s;
          }));
       }
     } catch (err) {
       console.error(err);
     }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storiesRes, reviewsRes] = await Promise.all([
          fetch('/api/community/stories'),
          fetch('/api/community/reviews')
        ]);
        const storiesData = await storiesRes.json();
        const reviewsData = await reviewsRes.json();

        if (storiesData.success) setStories(storiesData.data);
        if (reviewsData.success) setReviews(reviewsData.data);
      } catch (error) {
        console.error("Error fetching community data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const reviewStats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return {
        average: 0,
        total: 0,
        breakdown: [
          { stars: 5, count: 0, percentage: 0 },
          { stars: 4, count: 0, percentage: 0 },
          { stars: 3, count: 0, percentage: 0 },
          { stars: 2, count: 0, percentage: 0 },
          { stars: 1, count: 0, percentage: 0 },
        ]
      };
    }
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const average = (sum / total).toFixed(1);
    
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const rating = Math.round(Number(r.rating) || 0);
      if (rating >= 1 && rating <= 5) counts[rating]++;
    });

    const breakdown = [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: counts[stars],
      percentage: Math.round((counts[stars] / total) * 100)
    }));

    return { average, total, breakdown };
  }, [reviews]);

  const trendingDestinations = useMemo(() => {
    if (!stories || stories.length === 0) return [];
    const locationCounts = {};
    stories.forEach(s => {
      const loc = s.location?.trim();
      if (loc) {
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
      }
    });
    return Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, count }));
  }, [stories]);

  const topReviewers = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];
    const reviewersMap = {};
    reviews.forEach(r => {
      if (!r.name) return;
      if (!reviewersMap[r.name]) {
        reviewersMap[r.name] = { name: r.name, photo: r.photo, points: 0 };
      }
      // Give points: 10 per review, +1 per helpful vote
      reviewersMap[r.name].points += 10 + (r.helpful || 0);
    });
    return Object.values(reviewersMap)
      .sort((a, b) => b.points - a.points)
      .slice(0, 3);
  }, [reviews]);

  const handleLike = async (id) => {
    if (!user) {
        openAuthModal();
        return;
    }
    setStories(stories.map(story => {
      if (story._id === id) {
        const isLiked = story.liked;
        return {
          ...story,
          liked: !isLiked,
          likes: isLiked ? Math.max(0, (story.likes || 0) - 1) : (story.likes || 0) + 1
        };
      }
      return story;
    }));
    try {
      await fetch(`/api/community/stories/${id}/like`, { method: 'PATCH' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleHelpful = async (id) => {
    if (!user) {
        openAuthModal();
        return;
    }
    setReviews(reviews.map(review => {
      if (review._id === id) {
        const isHelpful = review.isHelpful;
        return {
          ...review,
          isHelpful: !isHelpful,
          helpful: isHelpful ? Math.max(0, (review.helpful || 0) - 1) : (review.helpful || 0) + 1
        };
      }
      return review;
    }));
    try {
      await fetch(`/api/community/reviews/${id}/helpful`, { method: 'PATCH' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoryForm(prev => ({ ...prev, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleShare = async (id, type = 'stories') => {
    const url = `${window.location.origin}/community?${type}=${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'bagspackgo Community', url });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      window.alert('Link copied to clipboard!');
    }
  };

  const handleDeleteStory = async (id) => {
    if (!user) {
        openAuthModal();
        return;
    }
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        const res = await fetch(`/api/community/stories/${id}`, { method: 'DELETE' });
        if (res.ok) {
           setStories(stories.filter(s => s._id !== id));
           setOpenDropdowns(prev => { const n = {...prev}; delete n[id]; return n; });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const submitStory = async (e) => {
    e.preventDefault();
    if (!user) {
        openAuthModal();
        return;
    }
    const posterName = user.name || user.username || user.email?.split('@')[0] || 'Traveler';
    if (!storyForm.content.trim()) return;

    const newStoryData = {
      name: posterName,
      handle: `@${posterName.toLowerCase().replace(/\s+/g, '').substring(0, 15)}`,
      photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(posterName)}&background=10b981&color=fff`,
      content: storyForm.content,
      media: storyForm.imagePreview,
      location: storyForm.location || ''
    };

    try {
      const res = await fetch('/api/community/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStoryData)
      });
      const data = await res.json();
      if (data.success) {
        setStories([data.data, ...stories]);
        setStoryForm({ content: '', location: '', imagePreview: null });
        setShowStoryModal(false);
      }
    } catch (error) {
      console.error("Error posting story:", error);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
        openAuthModal();
        return;
    }
    const posterName = user.name || user.username || user.email?.split('@')[0] || 'Traveler';
    if (!reviewForm.title.trim() || !reviewForm.content.trim()) return;

    const newReviewData = {
      name: posterName,
      photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(posterName)}&background=f59e0b&color=fff`,
      rating: reviewForm.rating,
      title: reviewForm.title,
      content: reviewForm.content
    };

    try {
      const res = await fetch('/api/community/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReviewData)
      });
      const data = await res.json();
      if (data.success) {
        setReviews([data.data, ...reviews]);
        setReviewForm({ title: '', content: '', rating: 5 });
        setShowReviewModal(false);
      }
    } catch (error) {
      console.error("Error posting review:", error);
    }
  };

  // Format relative time
  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gray-50/80 pb-20">

      {/* ─── Hero Header ─── */}
      <div className="relative bg-[#022c22] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0djJoLTJ2LTJoMnptMCAydjJoLTJ2LTJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 pt-10 pb-28 md:pt-14 md:pb-32 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          >
            <p className="text-emerald-300/70 text-xs font-bold uppercase tracking-[0.3em] mb-4">bagspackgo Community</p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight leading-[1.1]">
              Real Stories from<br />
              <span className="text-emerald-400">Real Travelers</span>
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base md:text-lg text-emerald-100/70 max-w-lg mx-auto leading-relaxed"
          >
            Share your moments, read honest reviews, and find inspiration for your next adventure.
          </motion.p>
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 z-10">

        {/* ─── Tab Navigation ─── */}
        <Card className="p-1.5 max-w-sm mx-auto mb-10 flex relative overflow-hidden shadow-lg shadow-gray-200/60">
          <button
            onClick={() => setActiveTab('stories')}
            className={cn(
              "relative flex-1 py-3 text-[13px] font-bold tracking-wide rounded-xl transition-colors z-10",
              activeTab === 'stories' ? 'text-white' : 'text-gray-500 hover:text-gray-800'
            )}
          >
            Stories & Photos
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={cn(
              "relative flex-1 py-3 text-[13px] font-bold tracking-wide rounded-xl transition-colors z-10",
              activeTab === 'reviews' ? 'text-white' : 'text-gray-500 hover:text-gray-800'
            )}
          >
            Platform Reviews
          </button>

          <motion.div
            className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-emerald-600 rounded-xl shadow-md z-0"
            initial={false}
            animate={{ left: activeTab === 'stories' ? '6px' : 'calc(50%)' }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          />
        </Card>

        {/* ─── Main Layout Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* ─── Feed Column ─── */}
          <div className="lg:col-span-8 mt-2">
            <AnimatePresence mode="wait">
              {activeTab === 'stories' ? (
                <motion.div key="stories" variants={TAB_VARIANTS} initial="hidden" animate="visible" exit="exit" className="space-y-6">

                  {/* Create Post Trigger */}
                  <Card
                    className="cursor-pointer group hover:shadow-md transition-all duration-200 border-gray-200/70"
                    onClick={() => {
                        if (!user) { openAuthModal(); return; }
                        setShowStoryModal(true);
                    }}
                  >
                    <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                      <div className="w-11 h-11 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 group-hover:border-emerald-400 group-hover:bg-emerald-50 transition-all">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div className="flex-1 bg-gray-100/80 group-hover:bg-gray-100 transition rounded-full py-3 px-5 text-gray-400 text-sm font-medium">
                        Share your travel story…
                      </div>
                      <div className="hidden sm:flex items-center justify-center p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition">
                        <Camera className="w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stories Feed */}
                  <div className="flex flex-col gap-6">
                    {stories.map((story, i) => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        key={story._id}
                      >
                        <Card className="rounded-2xl overflow-hidden border-gray-200/70 hover:shadow-sm transition-shadow">
                          {/* Story Header */}
                          <CardHeader className="p-5 pb-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10 ring-2 ring-gray-100">
                                  <AvatarImage src={story.photo} alt={story.name} />
                                  <AvatarFallback>{story.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold text-[15px] text-gray-900 leading-tight">{story.name}</div>
                                  <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                                    <span className="text-emerald-600/70 font-medium">{story.handle}</span>
                                    <span className="text-gray-300">·</span>
                                    <span>{timeAgo(story.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="relative">
                                <Button onClick={() => toggleDropdown(story._id)} variant="ghost" size="icon" className="rounded-full text-gray-300 hover:text-gray-500 h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                                {openDropdowns[story._id] && (
                                  <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-20 py-1">
                                    <button onClick={() => { handleShare(story._id, 'stories'); toggleDropdown(story._id); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors">
                                      Share
                                    </button>
                                    <button onClick={() => { window.alert('Post reported to moderators.'); toggleDropdown(story._id); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors">
                                      Report
                                    </button>
                                    {(user && user.userId === story.userId) && (
                                      <button onClick={() => { handleDeleteStory(story._id); toggleDropdown(story._id); }} className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 text-sm font-medium transition-colors">
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <p className="mt-4 text-[15px] text-gray-700 leading-relaxed">
                              {story.content}
                            </p>
                          </CardHeader>

                          {/* Story Media */}
                          {story.media && (
                            <div className="w-full bg-gray-100 border-y border-gray-100">
                              <img src={story.media} alt="Post media" className="w-full max-h-[520px] object-cover" />
                            </div>
                          )}

                          {/* Story Actions */}
                          <CardFooter className="p-5 pt-3 flex-col items-stretch gap-0">
                            {story.location && (
                              <Badge variant="outline" className="w-fit mb-4 gap-1.5 uppercase tracking-[0.12em] text-[10px] font-semibold text-gray-500 border-gray-200 bg-gray-50">
                                <MapPin className="w-3 h-3 text-emerald-500" /> {story.location}
                              </Badge>
                            )}

                            <Separator />

                            <div className="flex items-center justify-between pt-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleLike(story._id)}
                                  className={cn(
                                    "flex items-center gap-1.5 text-sm transition-colors px-3 py-1.5 rounded-full font-medium",
                                    story.liked ? 'text-rose-500 bg-rose-50' : 'text-gray-500 hover:text-rose-500 hover:bg-rose-50'
                                  )}
                                >
                                  <motion.div whileTap={{ scale: 0.8 }}>
                                    <Heart className={cn("w-[18px] h-[18px]", story.liked && 'fill-current')} />
                                  </motion.div>
                                  <span className="tabular-nums">{story.likes}</span>
                                </button>
                                <button
                                  onClick={() => toggleComments(story._id)}
                                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors px-3 py-1.5 rounded-full font-medium"
                                >
                                  <MessageSquare className="w-[18px] h-[18px]" />
                                  <span className="tabular-nums">{story.comments}</span>
                                </button>
                              </div>
                              <button onClick={() => handleShare(story._id, 'stories')} className="p-2 text-gray-300 hover:text-gray-500 rounded-full hover:bg-gray-50 transition-colors">
                                <Share2 className="w-[18px] h-[18px]" />
                              </button>
                            </div>

                            {/* Comments Section */}
                            <AnimatePresence>
                              {expandedComments[story._id] && (
                                 <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 pt-3 border-t border-gray-100 overflow-hidden">
                                   <div className="space-y-3 mb-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                      {(story.commentsArray || []).map((c, idx) => (
                                         <div key={idx} className="flex gap-2.5">
                                            <Avatar className="w-7 h-7 flex-shrink-0">
                                              <AvatarImage src={c.photo} />
                                              <AvatarFallback className="text-[10px]">{c.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="bg-gray-50 rounded-2xl px-3 py-2 flex-1">
                                               <div className="flex justify-between items-baseline mb-0.5">
                                                  <span className="font-semibold text-[13px] text-gray-900">{c.name}</span>
                                                  <span className="text-[10px] text-gray-400 font-medium tabular-nums">{timeAgo(c.createdAt)}</span>
                                               </div>
                                               <p className="text-[13px] text-gray-600 leading-relaxed">{c.text}</p>
                                            </div>
                                         </div>
                                      ))}
                                      {(!story.commentsArray || story.commentsArray.length === 0) && (
                                         <p className="text-center text-sm text-gray-400 py-4">No comments yet. Be the first!</p>
                                      )}
                                   </div>
                                   <form onSubmit={(e) => handleCommentSubmit(e, story._id)} className="flex items-center gap-2">
                                      <Input
                                         type="text"
                                         placeholder="Add a comment…"
                                         value={commentText[story._id] || ''}
                                         onChange={(e) => setCommentText(prev => ({ ...prev, [story._id]: e.target.value }))}
                                         className="flex-1 rounded-full h-9 text-[13px]"
                                      />
                                      <Button type="submit" size="icon" disabled={!commentText[story._id]?.trim()} className="rounded-full h-9 w-9">
                                         <Send className="w-3.5 h-3.5" />
                                      </Button>
                                   </form>
                                 </motion.div>
                              )}
                            </AnimatePresence>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="reviews" variants={TAB_VARIANTS} initial="hidden" animate="visible" exit="exit" className="space-y-6">

                  {/* Aggregate Review Stats */}
                  <Card className="rounded-2xl overflow-hidden border-gray-200/70">
                    <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8">
                      <div className="flex flex-col items-center flex-shrink-0 text-center sm:w-1/3">
                        <div className="text-6xl font-extrabold text-gray-900 tracking-tighter tabular-nums">{reviewStats.average}</div>
                        <div className="my-2.5">
                          <StarRating rating={Math.round(reviewStats.average)} size="md" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium tabular-nums">
                          Based on <span className="font-semibold text-gray-700">{reviewStats.total.toLocaleString()}</span> reviews
                        </p>
                      </div>

                      <Separator orientation="vertical" className="hidden sm:block h-28" />

                      <div className="flex-1 w-full space-y-2.5">
                        {reviewStats.breakdown.map((row) => (
                          <div key={row.stars} className="flex items-center gap-3">
                            <div className="w-8 flex items-center justify-end gap-1 text-sm font-semibold text-gray-600 tabular-nums">
                              {row.stars} <Star className="w-3.5 h-3.5 fill-[#fbbc04] text-[#fbbc04]" />
                            </div>
                            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                              <motion.div
                                className="h-full bg-[#fbbc04] rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${row.percentage}%` }}
                                transition={{ duration: 0.8, delay: 0.3 + row.stars * 0.05, ease: "easeOut" }}
                              />
                            </div>
                            <div className="w-9 text-right text-xs font-semibold text-gray-400 tabular-nums">{row.percentage}%</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Write Review Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Recent Reviews</h3>
                    <Button onClick={() => {
                        if (!user) { openAuthModal(); return; }
                        setShowReviewModal(true);
                    }} size="sm" className="rounded-full gap-1.5 text-[13px]">
                      <Plus className="w-3.5 h-3.5" /> Write Review
                    </Button>
                  </div>

                  {/* Individual Reviews */}
                  <div className="grid gap-5">
                    {reviews.map((review, i) => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        key={review._id}
                      >
                        <Card className="rounded-2xl border-gray-200/70 hover:shadow-sm transition-shadow">
                          <CardHeader className="p-5 sm:p-6 pb-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-11 h-11 ring-2 ring-gray-100">
                                  <AvatarImage src={review.photo} />
                                  <AvatarFallback>{review.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold text-[15px] text-gray-900">{review.name}</div>
                                  <div className="text-xs text-gray-400 font-medium">{timeAgo(review.createdAt)}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-100/80 w-fit">
                                <StarRating rating={review.rating} size="sm" />
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="px-5 sm:px-6 pb-4 pt-0">
                            <h4 className="font-bold text-gray-900 text-base mb-2">{review.title}</h4>
                            <p className="text-gray-600 text-[14px] leading-relaxed">
                              {review.content}
                            </p>
                          </CardContent>

                          <CardFooter className="px-5 sm:px-6 pb-5 pt-0 flex-col items-stretch">
                            <Separator className="mb-4" />
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Helpful?</span>
                              <Button
                                variant={review.isHelpful ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleHelpful(review._id)}
                                className={cn(
                                  "rounded-full gap-1.5 h-7 text-xs px-3",
                                  review.isHelpful && "bg-emerald-600"
                                )}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span className="tabular-nums">{review.helpful}</span>
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── Right Sidebar (Desktop Only) ─── */}
          <div className="hidden lg:block lg:col-span-4 mt-2">
            <div className="sticky top-24 space-y-6">

            {/* Contribute CTA Widget */}
            <Card className="rounded-2xl text-center relative overflow-hidden group border-gray-200/70">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-emerald-500 to-teal-700 transition-transform duration-700 group-hover:scale-105" />
              <CardContent className="relative z-10 p-6 pt-14">
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-md mb-4 relative rotate-3 group-hover:rotate-0 transition-transform">
                  <Heart className="text-emerald-500 w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Join the conversation</h3>
                <p className="text-gray-500 text-[13px] mt-2 mb-5 leading-relaxed">
                  Your stories and honest reviews help other travelers plan better trips.
                </p>

                <Button
                  onClick={() => {
                      if (!user) { openAuthModal(); return; }
                      activeTab === 'stories' ? setShowStoryModal(true) : setShowReviewModal(true);
                  }}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl gap-2 h-11"
                >
                  <Plus className="w-4 h-4" />
                  {activeTab === 'stories' ? 'Share Your Story' : 'Write a Review'}
                </Button>
              </CardContent>
            </Card>

            {/* Trending Destinations */}
            {activeTab === 'stories' && trendingDestinations.length > 0 && (
              <Card className="rounded-2xl border-gray-200/70">
                <CardHeader className="pb-1 p-5">
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                    <TrendingUp className="text-emerald-500 w-4 h-4" />
                    Trending Destinations
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-3">
                  <div className="space-y-3">
                    {trendingDestinations.map((dest, idx) => (
                      <div key={idx} className="flex items-center justify-between group cursor-pointer py-1">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors tabular-nums">
                            {idx + 1}
                          </span>
                          <span className="text-[14px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{dest.name}</span>
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium tabular-nums">{dest.count} post{dest.count !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
          </div>
        </div>
      </div>

      {/* ─── Create Story Modal — z-[200] to sit above navbar z-[100] ─── */}
      <AnimatePresence>
        {showStoryModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowStoryModal(false)}
            />
            <motion.div
              variants={MODAL_VARIANTS} initial="hidden" animate="visible" exit="exit"
              className="relative w-full max-w-lg"
            >
              <Card className="rounded-2xl shadow-2xl overflow-hidden border-0">
                <CardHeader className="px-5 py-4 border-b border-gray-100 flex-row items-center justify-between space-y-0">
                  <h2 className="text-lg font-bold text-gray-900">Create Post</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowStoryModal(false)} className="rounded-full h-8 w-8 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>

                <form onSubmit={submitStory}>
                  <CardContent className="p-5 space-y-4">
                    <Textarea
                      value={storyForm.content}
                      onChange={e => setStoryForm({ ...storyForm, content: e.target.value })}
                      placeholder="What's your travel story?"
                      className="min-h-[100px]"
                      autoFocus
                    />

                    {storyForm.imagePreview && (
                      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={storyForm.imagePreview} className="w-full h-full object-cover" alt="Preview" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setStoryForm({ ...storyForm, imagePreview: null })}
                          className="absolute top-2 right-2 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70 h-7 w-7"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <Input
                        type="text"
                        placeholder="Add location (optional)"
                        value={storyForm.location}
                        onChange={e => setStoryForm({ ...storyForm, location: e.target.value })}
                        className="border-0 shadow-none focus-visible:ring-0 bg-transparent h-9 px-0"
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="px-5 pb-5 pt-0 justify-between border-t border-gray-100 pt-4">
                    <div>
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-full text-emerald-600 hover:bg-emerald-50 gap-1.5 text-[13px]">
                        <Camera className="w-4 h-4" /> Photo
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!storyForm.content.trim()}
                      className="rounded-full bg-gray-900 hover:bg-gray-800 px-5"
                    >
                      Post
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Create Review Modal — z-[200] to sit above navbar z-[100] ─── */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowReviewModal(false)}
            />
            <motion.div
              variants={MODAL_VARIANTS} initial="hidden" animate="visible" exit="exit"
              className="relative w-full max-w-lg"
            >
              <Card className="rounded-2xl shadow-2xl overflow-hidden border-0">
                <CardHeader className="px-5 py-4 border-b border-gray-100 flex-row items-center justify-between space-y-0">
                  <h2 className="text-lg font-bold text-gray-900">Write a Review</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowReviewModal(false)} className="rounded-full h-8 w-8 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>

                <form onSubmit={submitReview}>
                  <CardContent className="p-5 space-y-5">
                    <div className="flex flex-col items-center py-2">
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">Your Rating</label>
                      <StarRating
                        rating={reviewForm.rating}
                        size="xl"
                        interactive
                        onChange={(star) => setReviewForm({ ...reviewForm, rating: star })}
                      />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5 pl-0.5">Title</label>
                        <Input
                          type="text"
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                          placeholder="Sum up your experience…"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5 pl-0.5">Your Review</label>
                        <Textarea
                          value={reviewForm.content}
                          onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                          placeholder="What did you like? How was the local guide?"
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="px-5 pb-5 pt-0 justify-end border-t border-gray-100 pt-4">
                    <Button
                      type="submit"
                      disabled={!reviewForm.title.trim() || !reviewForm.content.trim()}
                      className="rounded-full w-full sm:w-auto"
                    >
                      Publish Review
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CommunityMainContent;