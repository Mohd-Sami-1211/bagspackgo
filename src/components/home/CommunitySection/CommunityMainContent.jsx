'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHeart,
  FiMessageSquare,
  FiShare2,
  FiPlus,
  FiImage,
  FiX,
  FiMapPin,
  FiTrendingUp,
  FiAward,
  FiCamera
} from 'react-icons/fi';
import { RiStarFill, RiStarLine } from 'react-icons/ri';
import { Send } from 'lucide-react';

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

const CommunityMainContent = () => {
  const [activeTab, setActiveTab] = useState('stories'); // 'stories' | 'reviews'

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

  // Comment states
  const [expandedComments, setExpandedComments] = useState({});
  const [commentText, setCommentText] = useState({});

  const toggleComments = (id) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCommentSubmit = async (e, id) => {
     e.preventDefault();
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

  const reviewStats = {
    average: 4.8,
    total: 1248 + reviews.length - 3, // Dynamically updates fake total
    breakdown: [
      { stars: 5, count: 1056, percentage: 85 },
      { stars: 4, count: 124, percentage: 10 },
      { stars: 3, count: 50, percentage: 4 },
      { stars: 2, count: 12, percentage: 1 },
      { stars: 1, count: 6, percentage: 0 },
    ]
  };

  const handleLike = async (id) => {
    // Optimistic cache update toggle
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
    // Optimistic cache update toggle
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

  const submitStory = async (e) => {
    e.preventDefault();
    if (!storyForm.content.trim() || !storyForm.name.trim()) return;

    const newStoryData = {
      name: storyForm.name,
      handle: `@${storyForm.name.toLowerCase().replace(/\s+/g, '').substring(0, 15)}`,
      photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(storyForm.name)}&background=10b981&color=fff`,
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
        setStoryForm({ name: '', content: '', location: '', imagePreview: null });
        setShowStoryModal(false);
      }
    } catch (error) {
      console.error("Error posting story:", error);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.title.trim() || !reviewForm.content.trim() || !reviewForm.name.trim()) return;

    const newReviewData = {
      name: reviewForm.name,
      photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewForm.name)}&background=f59e0b&color=fff`,
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
        setReviewForm({ name: '', title: '', content: '', rating: 5 });
        setShowReviewModal(false);
      }
    } catch (error) {
      console.error("Error posting review:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="relative bg-[#022c22] overflow-hidden">
        {/* Subtle patterned background or gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 opacity-90 blur-xl"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-28 md:pt-24 md:pb-36 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight"
          >
            The Traveler's <span className="text-emerald-400">Community</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-emerald-100/80 max-w-2xl mx-auto font-medium"
          >
            Share breathtaking moments, read honest reviews, and get inspired for your next big adventure.
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-20 z-10">

        {/* Tab Navigation Navigation Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-2 max-w-md mx-auto mb-10 border border-gray-100 flex relative">
          <button
            onClick={() => setActiveTab('stories')}
            className={`relative flex-1 py-3.5 text-sm font-bold tracking-wide rounded-xl transition-colors z-10 ${activeTab === 'stories' ? 'text-white' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Stories & Pictures
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`relative flex-1 py-3.5 text-sm font-bold tracking-wide rounded-xl transition-colors z-10 ${activeTab === 'reviews' ? 'text-white' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Platform Reviews
          </button>

          <motion.div
            className="absolute top-2 bottom-2 w-[calc(50%-8px)] bg-emerald-600 rounded-xl shadow-md z-0"
            initial={false}
            animate={{ left: activeTab === 'stories' ? '8px' : 'calc(50% + 0px)' }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          />
        </div>

        {/* MAIN LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* FEED COLUMN */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'stories' ? (
                <motion.div key="stories" variants={TAB_VARIANTS} initial="hidden" animate="visible" exit="exit" className="space-y-8">

                  {/* Create Post Header trigger */}
                  <div
                    onClick={() => setShowStoryModal(true)}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow group"
                  >
                    <div className="w-12 h-12 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition">
                      <FiPlus size={24} />
                    </div>
                    <div className="flex-1 bg-gray-50 group-hover:bg-gray-100 transition rounded-full py-3.5 px-6 text-gray-500 border border-gray-200/60 font-medium">
                      Share a photo or story from your trip...
                    </div>
                    <div className="hidden sm:flex items-center justify-center p-3 bg-emerald-50 text-emerald-600 rounded-full group-hover:bg-emerald-100 transition">
                      <FiImage size={24} />
                    </div>
                  </div>

                  {/* Stories Feed */}
                  <div className="flex flex-col gap-8">
                    {stories.map((story, i) => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        key={story._id}
                        className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden"
                      >
                        <div className="p-6 pb-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                              <img src={story.photo} alt={story.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                              <div>
                                <div className="font-bold text-[16px] text-gray-900">{story.name}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                                  <span className="font-medium text-emerald-600/80">{story.handle}</span>
                                  <span className="text-gray-300">•</span>
                                  <span>{story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'Just now'}</span>
                                </div>
                              </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-2 rounded-full transition">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>
                            </button>
                          </div>

                          <p className="mt-5 text-[16px] text-gray-800 leading-relaxed font-medium">
                            {story.content}
                          </p>
                        </div>

                        {story.media && (
                          <div className="mt-1 w-full bg-gray-100">
                            <img src={story.media} alt="Post media" className="w-full max-h-[600px] object-cover" />
                          </div>
                        )}

                        <div className="p-6 pt-4">
                          {story.location && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 w-fit px-3 py-1.5 rounded-lg mb-5 border border-gray-100 uppercase tracking-widest">
                              <FiMapPin size={12} className="text-emerald-500" /> {story.location}
                            </div>
                          )}

                          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                            <div className="flex items-center gap-8">
                              <button
                                onClick={() => handleLike(story._id)}
                                className={`flex items-center gap-2 font-bold text-sm transition-colors ${story.liked ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'}`}
                              >
                                <motion.div whileTap={{ scale: 0.8 }} className={`p-2 rounded-full ${story.liked ? 'bg-rose-50' : 'hover:bg-rose-50'}`}>
                                  <FiHeart className={story.liked ? 'fill-current' : ''} size={20} />
                                </motion.div>
                                {story.likes}
                              </button>
                              <button onClick={() => toggleComments(story._id)} className="flex items-center gap-2 font-bold text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                                <div className="p-2 rounded-full hover:bg-emerald-50"><FiMessageSquare size={20} /></div>
                                {story.comments}
                              </button>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-colors">
                              <FiShare2 size={20} />
                            </button>
                          </div>

                          {/* COMMENTS SECTION */}
                          <AnimatePresence>
                            {expandedComments[story._id] && (
                               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 pt-4 border-t border-gray-100 overflow-hidden">
                                 <div className="space-y-4 mb-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                    {(story.commentsArray || []).map((c, idx) => (
                                       <div key={idx} className="flex gap-3">
                                          <img src={c.photo} className="w-8 h-8 rounded-full shadow-sm" alt="" />
                                          <div className="bg-gray-50 rounded-2xl p-3 flex-1">
                                             <div className="flex justify-between items-baseline mb-1">
                                                <span className="font-bold text-sm text-gray-900">{c.name}</span>
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                                             </div>
                                             <p className="text-sm font-medium text-gray-700">{c.text}</p>
                                          </div>
                                       </div>
                                    ))}
                                    {(!story.commentsArray || story.commentsArray.length === 0) && (
                                       <p className="text-center text-sm font-medium text-gray-400 py-3">No comments yet. Be the first!</p>
                                    )}
                                 </div>
                                 <form onSubmit={(e) => handleCommentSubmit(e, story._id)} className="flex items-center gap-2">
                                    <input 
                                       type="text" 
                                       placeholder="Add a comment..."
                                       value={commentText[story._id] || ''}
                                       onChange={(e) => setCommentText(prev => ({ ...prev, [story._id]: e.target.value }))}
                                       className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
                                    />
                                    <button type="submit" disabled={!commentText[story._id]?.trim()} className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-full transition active:scale-95">
                                       <Send className="w-4 h-4" />
                                    </button>
                                 </form>
                               </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="reviews" variants={TAB_VARIANTS} initial="hidden" animate="visible" exit="exit" className="space-y-8">

                  {/* Aggregate Review Stats Card */}
                  <div className="bg-white rounded-[2rem] shadow-lg shadow-emerald-900/5 border border-gray-100 p-8 flex flex-col sm:flex-row items-center gap-10">
                    <div className="flex flex-col items-center flex-shrink-0 text-center sm:w-1/3">
                      <div className="text-7xl font-black text-gray-900 tracking-tighter drop-shadow-sm">{reviewStats.average}</div>
                      <div className="flex items-center text-amber-400 text-3xl my-3 gap-1 drop-shadow-sm">
                        <RiStarFill /><RiStarFill /><RiStarFill /><RiStarFill /><RiStarFill className="text-amber-200" />
                      </div>
                      <div className="text-gray-500 text-sm font-bold bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
                        {reviewStats.total.toLocaleString()} total reviews
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-3">
                      {reviewStats.breakdown.map((row) => (
                        <div key={row.stars} className="flex items-center gap-4">
                          <div className="w-12 flex items-center justify-end gap-1.5 text-sm font-bold text-gray-700">
                            {row.stars} <RiStarFill className="text-amber-400 text-sm mb-0.5" />
                          </div>
                          <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden shadow-inner">
                            <motion.div
                              className="h-full bg-gradient-to-r from-amber-300 to-amber-400 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${row.percentage}%` }}
                              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                            />
                          </div>
                          <div className="w-10 text-right text-xs font-bold text-gray-500">{row.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Write a Review Button */}
                  <div className="flex items-center justify-between mt-8 mb-6">
                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Recent Reviews</h3>
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-full shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
                    >
                      <FiPlus size={18} /> Write Review
                    </button>
                  </div>

                  {/* Individual Reviews */}
                  <div className="grid gap-6">
                    {reviews.map((review, i) => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        key={review._id}
                        className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-5 gap-4">
                          <div className="flex items-center gap-4">
                            <img src={review.photo} className="w-14 h-14 rounded-full object-cover border-2 border-gray-100" alt="" />
                            <div>
                              <div className="font-bold text-[17px] text-gray-900">{review.name}</div>
                              <div className="text-sm font-medium text-gray-500 mt-0.5">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Just now'}</div>
                            </div>
                          </div>
                          <div className="flex bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 w-fit text-amber-500 text-lg gap-1">
                            {[...Array(5)].map((_, idx) => (
                              idx < review.rating ? <RiStarFill key={idx} /> : <RiStarLine key={idx} className="text-amber-200" />
                            ))}
                          </div>
                        </div>

                        <h4 className="font-bold text-gray-900 text-xl mb-3">{review.title}</h4>
                        <p className="text-gray-700 text-[15px] leading-relaxed mb-6 font-medium">
                          {review.content}
                        </p>

                        <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Was this helpful?</span>
                          <button
                            onClick={() => handleHelpful(review._id)}
                            className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full transition-colors border ${review.isHelpful ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-gray-500 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 border-gray-100 hover:border-emerald-200'}`}
                          >
                            <svg className="w-4 h-4" fill={review.isHelpful ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                            Yes ({review.helpful})
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT SIDEBAR (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-4 space-y-8">
            {/* Contribute CTA Widget */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-br from-emerald-500 to-teal-700 opacity-90 transition-transform duration-700 group-hover:scale-105"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center border-4 border-white shadow-md mb-5 mt-10 relative">
                  <FiHeart className="text-emerald-500" size={32} />
                  <div className="absolute top-0 right-0 w-5 h-5 bg-teal-500 border-2 border-white rounded-full"></div>
                </div>
                <h3 className="font-extrabold text-2xl text-gray-900 tracking-tight">Be part of our journey</h3>
                <p className="text-gray-500 text-[15px] font-medium mt-3 mb-6 leading-relaxed px-2">
                  Your travel stories inspire others and your honest reviews help travelers make better choices!
                </p>

                <button
                  onClick={() => activeTab === 'stories' ? setShowStoryModal(true) : setShowReviewModal(true)}
                  className="w-full mt-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2"
                >
                  <FiPlus size={18} />
                  {activeTab === 'stories' ? 'Share Your Story' : 'Write a Review'}
                </button>
              </div>
            </div>

            {/* Trending Tags / Destinations */}
            {activeTab === 'stories' && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-5 text-gray-900 font-extrabold text-lg">
                  <FiTrendingUp className="text-emerald-500" size={22} />
                  Top Destinations
                </div>
                <div className="space-y-4">
                  {['Kashmir Valley', 'Spiti Expedition', 'Andaman Islands', 'Munnar Tea Estates'].map((tag, idx) => (
                    <div key={idx} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center font-bold text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          #{idx + 1}
                        </div>
                        <span className="font-bold text-gray-700 group-hover:text-gray-900">{tag}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-400">{(50 - idx * 12)}k posts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Reviewers */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-5 text-gray-900 font-extrabold text-lg">
                  <FiAward className="text-amber-500" size={22} />
                  Top Reviewers
                </div>
                <div className="space-y-5">
                  {[
                    { name: 'Kavita Iyer', points: 450, img: 'https://i.pravatar.cc/150?u=kavita' },
                    { name: 'Michael Doe', points: 320, img: 'https://i.pravatar.cc/150?u=mike' },
                    { name: 'Sanjeev N.', points: 290, img: 'https://i.pravatar.cc/150?u=sanj' }
                  ].map((user, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img src={user.img} className="w-10 h-10 rounded-full" alt="" />
                      <div className="flex-1">
                        <div className="font-bold text-[15px] text-gray-900">{user.name}</div>
                        <div className="text-xs font-bold text-amber-500">{user.points} points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* --- MODALS FOR CREATING POSTS/REVIEWS --- */}

      {/* Create Story Modal */}
      <AnimatePresence>
        {showStoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setShowStoryModal(false)}
            />
            <motion.div
              variants={MODAL_VARIANTS} initial="hidden" animate="visible" exit="exit"
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-xl font-extrabold text-gray-900">Create Post</h2>
                <button onClick={() => setShowStoryModal(false)} className="p-2 bg-white rounded-full hover:bg-gray-100 transition shadow-sm border border-gray-100 text-gray-500">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={submitStory} className="p-6">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={storyForm.name}
                    onChange={e => setStoryForm({ ...storyForm, name: e.target.value })}
                    className="w-full text-lg font-bold text-gray-900 placeholder-gray-400 border-b border-gray-100 pb-2 mb-2 outline-none bg-transparent focus:border-emerald-500 transition-colors"
                    maxLength={30}
                  />
                </div>

                <textarea
                  value={storyForm.content}
                  onChange={e => setStoryForm({ ...storyForm, content: e.target.value })}
                  placeholder="What's your travel story today?"
                  className="w-full text-lg text-gray-800 placeholder-gray-400 border-none outline-none resize-none h-32 bg-transparent mt-2"
                  autoFocus
                />

                {storyForm.imagePreview && (
                  <div className="relative mb-4 w-full h-48 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img src={storyForm.imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    <button
                      type="button"
                      onClick={() => setStoryForm({ ...storyForm, imagePreview: null })}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                  <div className="pl-3 text-gray-400"><FiMapPin size={18} /></div>
                  <input
                    type="text"
                    placeholder="Add location (optional)"
                    value={storyForm.location}
                    onChange={e => setStoryForm({ ...storyForm, location: e.target.value })}
                    className="flex-1 bg-transparent border-none outline-none py-2 text-sm font-semibold text-gray-700 placeholder-gray-400"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-full transition">
                      <FiCamera size={18} /> Add Photo
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!storyForm.content.trim() || !storyForm.name.trim()}
                    className="bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-6 rounded-full transition"
                  >
                    Post
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setShowReviewModal(false)}
            />
            <motion.div
              variants={MODAL_VARIANTS} initial="hidden" animate="visible" exit="exit"
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-xl font-extrabold text-gray-900">Write a Review</h2>
                <button onClick={() => setShowReviewModal(false)} className="p-2 bg-white rounded-full hover:bg-gray-100 transition shadow-sm border border-gray-100 text-gray-500">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={submitReview} className="p-6">

                <div className="mb-6 flex flex-col items-center">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Overall Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        {star <= reviewForm.rating ?
                          <RiStarFill className="text-4xl text-amber-400 drop-shadow-sm" /> :
                          <RiStarLine className="text-4xl text-gray-300" />
                        }
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 pl-1">Your Name</label>
                    <input
                      type="text"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-bold outline-none focus:border-emerald-500 focus:bg-white transition"
                      placeholder="e.g. Rahul Verma"
                      maxLength={30}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 pl-1">Review Title</label>
                    <input
                      type="text"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-bold outline-none focus:border-emerald-500 focus:bg-white transition"
                      placeholder="Sum up your experience..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 pl-1">Detailed Review</label>
                    <textarea
                      value={reviewForm.content}
                      onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition h-32 resize-none"
                      placeholder="What did you like or dislike? How was the local guide?"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 mt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={!reviewForm.title.trim() || !reviewForm.content.trim() || !reviewForm.name.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-full shadow-md shadow-emerald-500/20 transition-all w-full sm:w-auto"
                  >
                    Publish Review
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CommunityMainContent;