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
  ThumbsUp,
  Video,
  Reply,
  BadgeCheck,
  Trash2
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
import { useRouter, useSearchParams } from 'next/navigation';

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

// ─── Constants ──────────────────────────────────────────────
const OFFICIAL_EMAIL = 'bagspackgo01@gmail.com';

// Helper to check if a story/comment is from the official account
const isOfficialPost = (item) => {
  return item?.name === 'bagspackgo' || item?.handle === '@bagspackgo';
};

// ─── Main Community Component ───────────────────────────────
const CommunityMainContent = () => {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('stories');

  // Modals state
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Form states — mediaPreviews is an array of { url, type: 'image'|'video' }
  const [storyForm, setStoryForm] = useState({ content: '', location: '', mediaPreviews: [] });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: '', title: '', content: '', rating: 5 });
  const fileInputRef = useRef(null);

  const [stories, setStories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Comment and Dropdown states
  const [expandedComments, setExpandedComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});

  // Reply tracking: { storyId: { parentId, parentName } }
  const [replyTo, setReplyTo] = useState({});

  // @Mention autocomplete state
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionResults, setMentionResults] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [activeMentionField, setActiveMentionField] = useState(null); // 'comment-{storyId}' or 'post'
  const mentionDebounceRef = useRef(null);

  // Loading and Input Refs
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);
  const [submittingCommentId, setSubmittingCommentId] = useState(null);
  const commentInputRefs = useRef({});

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
     if (!commentText[id]?.trim() || submittingCommentId === id) return;
     
     setSubmittingCommentId(id);
     try {
       const payload = { text: commentText[id] };
       // Attach parentId if replying to a comment
       if (replyTo[id]?.parentId) {
         payload.parentId = replyTo[id].parentId;
       }

       const res = await fetch(`/api/community/stories/${id}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
       });
       const data = await res.json();
       if (data.success) {
          setCommentText(prev => ({ ...prev, [id]: '' }));
          setReplyTo(prev => { const n = {...prev}; delete n[id]; return n; });
          setShowMentions(false);
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
     } finally {
       setSubmittingCommentId(null);
     }
  };

  const handleCommentLike = async (storyId, commentId) => {
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      const res = await fetch(`/api/community/stories/${storyId}/comment/${commentId}/like`, { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        setStories(prevStories => prevStories.map(s => {
          if (String(s._id) === String(storyId)) {
            const newComments = s.commentsArray.map(c => {
              if (String(c._id) === String(commentId)) {
                return { ...c, liked: data.liked, likesCount: data.likes };
              }
              return c;
            });
            return { ...s, commentsArray: newComments };
          }
          return s;
        }));
      } else {
        alert(data.error || 'Could not verify your like. Please try logging out and in.');
      }
    } catch (err) {
      console.error('Like comment error:', err);
      alert('Network error. If you just updated the app, please restart the dev server.');
    }
  };

  const handleCommentDelete = async (storyId, commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await fetch(`/api/community/stories/${storyId}/comment/${commentId}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setStories(prevStories => prevStories.map(s => {
          if (String(s._id) === String(storyId)) {
            return {
              ...s,
              comments: (s.comments || 1) - 1,
              commentsArray: s.commentsArray.filter(c => 
                String(c._id) !== String(commentId) && String(c.parentId) !== String(commentId)
              )
            };
          }
          return s;
        }));
      } else {
        alert(data.error || 'Failed to delete. You may not have permission for this.');
      }
    } catch (err) {
       console.error('Delete comment error', err);
       alert('Connection failure. Please check your internet or restart dev server.');
    }
  };

  // @Mention autocomplete search
  const searchMentions = async (query) => {
    try {
      const res = await fetch(`/api/community/mentions?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setMentionResults(data.data || []);
        setShowMentions(data.data?.length > 0);
      }
    } catch (err) {
      console.error('Mention search error:', err);
    }
  };

  const handleMentionClick = async (companyName) => {
    if (companyName.toLowerCase() === 'bagspackgo') return; // Do not navigate for official account
    try {
      const res = await fetch(`/api/community/mentions?q=${encodeURIComponent(companyName)}`);
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        const match = data.data.find(m => m.name.toLowerCase() === companyName.toLowerCase());
        if (match && !match.isOfficial) {
          router.push(`/user/provider/${match.id}`);
        }
      }
    } catch (err) {
      console.error('Mention navigation error:', err);
    }
  };

  const handleTextInputWithMentions = (text, fieldId) => {
    // Detect @mention trigger
    const cursorPos = text.length;
    const lastAtIndex = text.lastIndexOf('@');
    
    if (lastAtIndex >= 0) {
      const afterAt = text.substring(lastAtIndex + 1);
      // Only trigger if we're at the @ or typing after it (no space after @ yet)
      if (!afterAt.includes(' ') && afterAt.length <= 30) {
        setActiveMentionField(fieldId);
        setMentionQuery(afterAt);
        // Debounce the search
        if (mentionDebounceRef.current) clearTimeout(mentionDebounceRef.current);
        mentionDebounceRef.current = setTimeout(() => searchMentions(afterAt), 250);
        return;
      }
    }
    setShowMentions(false);
  };

  const insertMention = (name, fieldId) => {
    if (fieldId === 'post') {
      const text = storyForm.content;
      const lastAtIndex = text.lastIndexOf('@');
      const newText = text.substring(0, lastAtIndex) + `@[${name}] `;
      setStoryForm({ ...storyForm, content: newText });
    } else if (fieldId.startsWith('comment-')) {
      const storyId = fieldId.replace('comment-', '');
      const text = commentText[storyId] || '';
      const lastAtIndex = text.lastIndexOf('@');
      const newText = text.substring(0, lastAtIndex) + `@[${name}] `;
      setCommentText(prev => ({ ...prev, [storyId]: newText }));
    }
    setShowMentions(false);
    setMentionQuery('');
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

  // Deep linking scroll
  useEffect(() => {
    const targetStory = searchParams.get('stories');
    if (targetStory && !isLoading && stories.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`story-${targetStory}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [searchParams, isLoading, stories.length]);

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

  // Multi-media upload handler (images + videos)
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newFiles = [...mediaFiles];
    const newPreviews = [...storyForm.mediaPreviews];

    files.forEach(file => {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({ url: reader.result, type: isVideo ? 'video' : 'image' });
        newFiles.push(file);
        setStoryForm(prev => ({ ...prev, mediaPreviews: [...newPreviews] }));
        setMediaFiles([...newFiles]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index) => {
    setStoryForm(prev => ({
      ...prev,
      mediaPreviews: prev.mediaPreviews.filter((_, i) => i !== index)
    }));
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleShare = async (id, type = 'stories') => {
    const url = `${window.location.origin}/user/community?${type}=${id}`;
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
    const isOfficial = user.email === OFFICIAL_EMAIL;
    if (!storyForm.content.trim() || isSubmittingStory) return;

    setIsSubmittingStory(true);
    const newStoryData = {
      name: isOfficial ? 'bagspackgo' : posterName,
      handle: isOfficial ? '@bagspackgo' : `@${posterName.toLowerCase().replace(/\s+/g, '').substring(0, 15)}`,
      photo: isOfficial ? '/favicon.ico' : `https://ui-avatars.com/api/?name=${encodeURIComponent(posterName)}&background=10b981&color=fff`,
      content: storyForm.content,
      media: storyForm.mediaPreviews.map(m => m.url),
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
        setStoryForm({ content: '', location: '', mediaPreviews: [] });
        setMediaFiles([]);
        setShowStoryModal(false);
      }
    } catch (error) {
      console.error("Error posting story:", error);
    } finally {
      setIsSubmittingStory(false);
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
        <div className="p-1.5 max-w-sm mx-auto mb-10 flex relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm">
          <button
            onClick={() => setActiveTab('stories')}
            className={cn(
              "relative flex-1 py-2.5 text-[13px] font-bold tracking-wide rounded-lg transition-colors z-10",
              activeTab === 'stories' ? 'text-white' : 'text-gray-500 hover:text-gray-800'
            )}
          >
            Stories & Photos
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={cn(
              "relative flex-1 py-2.5 text-[13px] font-bold tracking-wide rounded-lg transition-colors z-10",
              activeTab === 'reviews' ? 'text-white' : 'text-gray-500 hover:text-gray-800'
            )}
          >
            Platform Reviews
          </button>

          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-emerald-600 rounded-lg shadow-sm z-0"
            initial={false}
            animate={{ left: activeTab === 'stories' ? '4px' : 'calc(50%)' }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          />
        </div>

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
                        <Card id={`story-${story._id}`} className="rounded-2xl overflow-hidden border-gray-200/70 hover:shadow-sm transition-shadow">
                          {/* Story Header */}
                          <CardHeader className="p-5 pb-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <Avatar className={cn("w-10 h-10 ring-2", isOfficialPost(story) ? "ring-blue-200 bg-white" : "ring-gray-100")}>
                                  <AvatarImage src={story.photo} alt={story.name} className={cn(isOfficialPost(story) && "object-contain p-0.5")} />
                                  <AvatarFallback>{story.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-[15px] text-gray-900 leading-tight">
                                      {story.name}
                                    </span>
                                    {isOfficialPost(story) && <BadgeCheck className="w-[18px] h-[18px] text-white fill-blue-500" />}
                                  </div>
                                  <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                                    {story.location && (
                                      <>
                                        <div className="flex items-center gap-1 text-gray-500 font-medium">
                                          <MapPin className="w-3 h-3 text-emerald-500/70" />
                                          <span>{story.location}</span>
                                        </div>
                                        <span className="text-gray-300">·</span>
                                      </>
                                    )}
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
                                    {(user && (user.userId === story.userId || user.email === 'bagspackgo01@gmail.com')) && (
                                      <button onClick={() => { handleDeleteStory(story._id); toggleDropdown(story._id); }} className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 text-sm font-medium transition-colors">
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <p className="mt-4 text-[15px] text-gray-700 leading-relaxed whitespace-pre-line">
                              {/* Render @mentions as styled text */}
                              {story.content.split(/(@\[[^\]]+\]|@\w+)/g).map((part, i) => {
                                if (part.startsWith('@[') && part.endsWith(']')) {
                                  const name = part.substring(2, part.length - 1);
                                  return (
                                    <span key={i} onClick={() => handleMentionClick(name)} className="text-emerald-600 font-semibold cursor-pointer hover:underline">
                                      @{name}
                                    </span>
                                  );
                                } else if (part.startsWith('@')) {
                                  const name = part.substring(1);
                                  return (
                                    <span key={i} onClick={() => handleMentionClick(name)} className="text-emerald-600 font-semibold cursor-pointer hover:underline">
                                      {part}
                                    </span>
                                  );
                                }
                                return part;
                              })}
                            </p>
                          </CardHeader>

                          {/* Story Media — supports multiple images and videos */}
                          {story.media && (Array.isArray(story.media) ? story.media : [story.media]).filter(Boolean).length > 0 && (() => {
                            const mediaArr = (Array.isArray(story.media) ? story.media : [story.media]).filter(Boolean);
                            const isVideo = (url) => /\.(mp4|webm|mov|ogg)$/i.test(url) || url.startsWith('data:video/');
                            
                            return (
                              <div className={cn(
                                "w-full border-y border-gray-100 overflow-hidden",
                                mediaArr.length === 1 ? '' : 'grid gap-0.5',
                                mediaArr.length === 2 && 'grid-cols-2',
                                mediaArr.length === 3 && 'grid-cols-2',
                                mediaArr.length >= 4 && 'grid-cols-2'
                              )}>
                                {mediaArr.map((m, idx) => (
                                  <div key={idx} className={cn(
                                    "relative bg-gray-100 overflow-hidden",
                                    mediaArr.length === 1 ? 'max-h-[520px]' : 'aspect-square',
                                    mediaArr.length === 3 && idx === 0 && 'row-span-2 aspect-auto'
                                  )}>
                                    {isVideo(m) ? (
                                      <video
                                        src={m}
                                        controls
                                        className="w-full h-full object-cover"
                                        preload="metadata"
                                      />
                                    ) : (
                                      <img src={m} alt={`Post media ${idx + 1}`} className="w-full h-full object-cover" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          })()}

                          {/* Story Actions */}
                          <CardFooter className="p-5 pt-3 flex-col items-stretch gap-0">
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
                                   <div className="space-y-3 mb-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                                      {(() => {
                                        const allComments = story.commentsArray || [];
                                        // Separate top-level comments and replies
                                        const topLevel = allComments.filter(c => !c.parentId);
                                        const repliesMap = {};
                                        allComments.forEach(c => {
                                          if (c.parentId) {
                                            const pid = c.parentId.toString();
                                            if (!repliesMap[pid]) repliesMap[pid] = [];
                                            repliesMap[pid].push(c);
                                          }
                                        });

                                        const renderComment = (c, idx, isReply = false) => {
                                          const commentId = c._id?.toString() || idx;
                                          const replies = repliesMap[commentId] || [];
                                          const official = isOfficialPost(c);

                                          return (
                                            <div key={commentId}>
                                              <div className={cn("flex gap-2.5", isReply && "ml-8 mt-2")}>
                                                <Avatar className={cn("w-7 h-7 flex-shrink-0", official && "ring-1 ring-blue-200 bg-white")}>
                                                  <AvatarImage src={c.photo} className={cn(official && "object-contain p-0.5")} />
                                                  <AvatarFallback className="text-[10px]">{c.name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="bg-gray-50 rounded-2xl px-3 py-2 flex-1">
                                                   <div className="flex justify-between items-baseline mb-0.5">
                                                      <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-[13px] text-gray-900">{c.name}</span>
                                                        {official && <BadgeCheck className="w-3.5 h-3.5 text-white fill-blue-500" />}
                                                      </div>
                                                      <span className="text-[10px] text-gray-400 font-medium tabular-nums">{timeAgo(c.createdAt)}</span>
                                                   </div>
                                                   <p className="text-[13px] text-gray-600 leading-relaxed">
                                                     {c.text.split(/(@\[[^\]]+\]|@\w+)/g).map((part, pi) => {
                                                       if (part.startsWith('@[') && part.endsWith(']')) {
                                                         const name = part.substring(2, part.length - 1);
                                                         return (
                                                           <span key={pi} onClick={() => handleMentionClick(name)} className="text-emerald-600 font-semibold cursor-pointer hover:underline">
                                                             @{name}
                                                           </span>
                                                         );
                                                       } else if (part.startsWith('@')) {
                                                         const name = part.substring(1);
                                                         return (
                                                           <span key={pi} onClick={() => handleMentionClick(name)} className="text-emerald-600 font-semibold cursor-pointer hover:underline">
                                                             {part}
                                                           </span>
                                                         );
                                                       }
                                                       return part;
                                                     })}
                                                   </p>
                                                   <div className="flex items-center gap-4 mt-1.5">
                                                     <button
                                                       onClick={() => handleCommentLike(story._id, commentId)}
                                                       className={cn("text-[11px] font-semibold flex items-center gap-1", c.liked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500')}
                                                     >
                                                       <Heart className={cn("w-3 h-3", c.liked && 'fill-current')} /> {c.likesCount || 0}
                                                     </button>
                                                     <button
                                                       onClick={() => {
                                                         setReplyTo(prev => ({ ...prev, [story._id]: { parentId: commentId, parentName: c.name } }));
                                                         setTimeout(() => commentInputRefs.current[story._id]?.focus(), 50);
                                                       }}
                                                       className="text-[11px] text-gray-400 hover:text-emerald-600 font-semibold flex items-center gap-1"
                                                     >
                                                       <Reply className="w-3 h-3" /> Reply
                                                     </button>
                                                     {(user && (user.userId === c.user || user.userId === story.userId)) && (
                                                       <button
                                                         onClick={() => handleCommentDelete(story._id, commentId)}
                                                         className="text-[11px] text-gray-400 hover:text-rose-500 font-semibold flex items-center gap-1 ml-auto"
                                                       >
                                                         <Trash2 className="w-3 h-3" />
                                                       </button>
                                                     )}
                                                   </div>
                                                </div>
                                              </div>
                                              {/* Render replies */}
                                              {replies.map((r, ri) => renderComment(r, ri, true))}
                                            </div>
                                          );
                                        };

                                        return topLevel.length > 0 ? (
                                          topLevel.map((c, idx) => renderComment(c, idx))
                                        ) : (
                                          <p className="text-center text-sm text-gray-400 py-4">No comments yet. Be the first!</p>
                                        );
                                      })()}
                                   </div>

                                   {/* Reply indicator */}
                                   {replyTo[story._id] && (
                                     <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-emerald-50 rounded-lg text-xs font-medium text-emerald-700 border border-emerald-100">
                                       <Reply className="w-3 h-3" />
                                       Replying to <span className="font-bold">{replyTo[story._id].parentName}</span>
                                       <button onClick={() => setReplyTo(prev => { const n = {...prev}; delete n[story._id]; return n; })} className="ml-auto text-emerald-500 hover:text-emerald-800">
                                         <X className="w-3 h-3" />
                                       </button>
                                     </div>
                                   )}

                                   {/* Comment form with @mentions */}
                                   <div className="relative">
                                     <form onSubmit={(e) => handleCommentSubmit(e, story._id)} className="flex items-center gap-2">
                                        <Input
                                           ref={el => commentInputRefs.current[story._id] = el}
                                           type="text"
                                           placeholder={replyTo[story._id] ? `Reply to ${replyTo[story._id].parentName}…` : "Add a comment…"}
                                           value={commentText[story._id] || ''}
                                           disabled={submittingCommentId === story._id}
                                           onChange={(e) => {
                                             const val = e.target.value;
                                             setCommentText(prev => ({ ...prev, [story._id]: val }));
                                             handleTextInputWithMentions(val, `comment-${story._id}`);
                                           }}
                                           className="flex-1 rounded-full h-9 text-[13px]"
                                        />
                                        <Button type="submit" size="icon" disabled={!commentText[story._id]?.trim() || submittingCommentId === story._id} className="rounded-full h-9 w-9">
                                           <Send className="w-3.5 h-3.5" />
                                        </Button>
                                     </form>
                                     
                                     {/* @Mention autocomplete dropdown */}
                                     {showMentions && activeMentionField === `comment-${story._id}` && mentionResults.length > 0 && (
                                       <div className="absolute left-0 right-12 bottom-full mb-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-30 max-h-48 overflow-y-auto">
                                         {mentionResults.map((m) => (
                                           <button
                                             key={m.id}
                                             type="button"
                                             onClick={() => insertMention(m.name, `comment-${story._id}`)}
                                             className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                                           >
                                             <Avatar className={cn("w-6 h-6", m.isOfficial && "ring-1 ring-blue-200")}>
                                               <AvatarImage src={m.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=10b981&color=fff`} />
                                               <AvatarFallback className="text-[9px]">{m.name?.[0]}</AvatarFallback>
                                             </Avatar>
                                             <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
                                               {m.name}
                                               {m.isOfficial && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />}
                                             </span>
                                           </button>
                                         ))}
                                       </div>
                                     )}
                                   </div>
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
                    <div className="relative">
                      <Textarea
                        value={storyForm.content}
                        onChange={e => {
                          const val = e.target.value;
                          setStoryForm({ ...storyForm, content: val });
                          handleTextInputWithMentions(val, 'post');
                        }}
                        placeholder="What's your travel story? Use @ to tag service providers…"
                        className="min-h-[100px]"
                        autoFocus
                      />

                      {/* @Mention autocomplete for post content */}
                      {showMentions && activeMentionField === 'post' && mentionResults.length > 0 && (
                        <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-30 max-h-48 overflow-y-auto">
                          {mentionResults.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => insertMention(m.name, 'post')}
                              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                            >
                              <Avatar className={cn("w-6 h-6", m.isOfficial && "ring-1 ring-blue-200")}>
                                <AvatarImage src={m.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=10b981&color=fff`} />
                                <AvatarFallback className="text-[9px]">{m.name?.[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
                                {m.name}
                                {m.isOfficial && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Multi-media previews */}
                    {storyForm.mediaPreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {storyForm.mediaPreviews.map((m, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 aspect-square">
                            {m.type === 'video' ? (
                              <video src={m.url} className="w-full h-full object-cover" muted />
                            ) : (
                              <img src={m.url} className="w-full h-full object-cover" alt={`Preview ${idx + 1}`} />
                            )}
                            {m.type === 'video' && (
                              <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-1">
                                <Video className="w-2.5 h-2.5" /> Video
                              </div>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMedia(idx)}
                              className="absolute top-1 right-1 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70 h-6 w-6"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
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

                  <CardFooter className="px-5 pb-5 justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-1">
                      <input type="file" ref={fileInputRef} onChange={handleMediaUpload} accept="image/*,video/*" multiple className="hidden" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-full text-emerald-600 hover:bg-emerald-50 gap-1.5 text-[13px]">
                        <Camera className="w-4 h-4" /> Photo
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-full text-blue-600 hover:bg-blue-50 gap-1.5 text-[13px]">
                        <Video className="w-4 h-4" /> Video
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

                  <CardFooter className="px-5 pb-5 justify-end border-t border-gray-100 pt-4">
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