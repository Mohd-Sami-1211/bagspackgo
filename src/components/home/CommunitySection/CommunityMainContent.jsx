'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHeart, 
  FiMessageSquare, 
  FiShare2, 
  FiPlus, 
  FiImage, 
  FiVideo, 
  FiX,
  FiBookmark,
  FiAward
} from 'react-icons/fi';
import { RiStarFill, RiStarLine } from 'react-icons/ri';

const CommunityMainContent = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('stories');

  // Sample stories data
  const [stories, setStories] = useState([
    {
      id: 1,
      name: 'Alex Johnson',
      handle: '@alex.trek',
      photo: '/placeholder-user.jpg',
      date: '2h ago',
      content: 'Just completed the Himalayan trail - the sunrise views over the peaks were absolutely breathtaking. The challenging climb was worth every step when we reached the summit at dawn.',
      likes: 24,
      comments: 8,
      media: '/mountain-view.jpg',
      mediaType: 'image',
      liked: false,
      location: 'Himalayas, Nepal'
    },
    {
      id: 2,
      name: 'Sam Wilson',
      handle: '@samonthemountain',
      photo: '/placeholder-user.jpg',
      date: '1d ago',
      content: 'Green Valley trail update: The new waterfall viewpoint is spectacular after the recent rains. The trail has some muddy sections but the crew is doing great maintenance work.',
      likes: 15,
      comments: 5,
      media: '/waterfall.jpg',
      mediaType: 'image',
      liked: false,
      location: 'Green Valley National Park'
    }
  ]);

  // Sample reviews data
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: 'Morgan Hill',
      handle: '@morganclimbs',
      photo: '/placeholder-user.jpg',
      date: 'Just now',
      rating: 5,
      content: 'The guides were incredibly knowledgeable about the local flora and fauna. Their attention to safety while maintaining a fun atmosphere was perfect. The equipment was top-notch and the meals were surprisingly delicious for mountain fare!',
      saved: false,
      trek: 'Annapurna Circuit'
    },
    {
      id: 2,
      name: 'Casey Smith',
      handle: '@caseyexplores',
      photo: '/placeholder-user.jpg',
      date: '1d ago',
      rating: 4,
      content: 'Excellent overall experience. The views were even better than promised. Only reason for 4 stars is that the sleeping bags could use an upgrade - nights got colder than expected.',
      saved: true,
      trek: 'Patagonia Explorer'
    }
  ]);

  // Form states
  const [newStoryContent, setNewStoryContent] = useState('');
  const [newReviewContent, setNewReviewContent] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Handle like action
  const handleLike = (id) => {
    setStories(stories.map(story => 
      story.id === id ? { 
        ...story, 
        likes: story.liked ? story.likes - 1 : story.likes + 1,
        liked: !story.liked 
      } : story
    ));
  };

  // Handle save review
  const handleSaveReview = (id) => {
    setReviews(reviews.map(review =>
      review.id === id ? { 
        ...review, 
        saved: !review.saved 
      } : review
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 -mt-20">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 text-center relative"
      >
        
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700 mb-4 relative z-10">
          Community Adventures
        </h1>
        
        <div className="max-w-2xl mx-auto">
          <p className="text-lg text-gray-700 mb-6 relative z-10">
            Share your journey, inspire fellow explorers, and discover hidden gems from our global community
          </p>
          
        </div>
      </motion.div>

      {/* Tab Navigation - Enhanced */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center mb-12"
      >
        <div className="inline-flex bg-white p-1 rounded-full shadow-md border border-gray-200">
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-8 py-3 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-2 ${activeTab === 'stories' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <span className="relative">
              Stories
              {activeTab === 'stories' && (
                <motion.span 
                  layoutId="tabIndicator"
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-white opacity-80"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-8 py-3 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-2 ${activeTab === 'reviews' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <span className="relative">
              Reviews
              {activeTab === 'reviews' && (
                <motion.span 
                  layoutId="tabIndicator"
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-white opacity-80"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'stories' ? (
          <motion.div
            key="stories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 gap-8"
          >
            {/* Floating action button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowStoryForm(true)}
              className="fixed bottom-8 right-8 bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-full shadow-xl z-10 flex items-center gap-2"
            >
              <FiPlus size={24} />
              <span className="hidden sm:inline">Share Story</span>
            </motion.button>

            {/* Stories List */}
            {stories.map((story) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Story Header */}
                <div className="p-6 pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-100 to-blue-100 p-0.5">
                      <div className="w-full h-full rounded-full bg-white overflow-hidden">
                        <img src={story.photo} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{story.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{story.handle}</span>
                        <span>•</span>
                        <span>{story.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Location Chip */}
                  {story.location && (
                    <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-50 to-blue-50 rounded-full text-sm text-gray-700 border border-green-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {story.location}
                    </div>
                  )}
                </div>
                
                {/* Story Content */}
                <div className="p-6 pt-4">
                  <p className="text-gray-700 mb-4">{story.content}</p>
                  
                  {story.media && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-gray-100">
                      {story.mediaType === 'image' ? (
                        <img 
                          src={story.media} 
                          alt="" 
                          className="w-full h-64 object-cover"
                        />
                      ) : (
                        <video 
                          src={story.media} 
                          controls 
                          className="w-full h-64 object-cover"
                        />
                      )}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleLike(story.id)}
                        className={`flex items-center gap-1 ${story.liked ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
                      >
                        <FiHeart className={story.liked ? 'fill-current' : ''} /> 
                        <span>{story.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-400 hover:text-blue-500">
                        <FiMessageSquare /> 
                        <span>{story.comments}</span>
                      </button>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <FiShare2 />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* New Story Modal */}
            <AnimatePresence>
              {showStoryForm && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                  onClick={() => setShowStoryForm(false)}
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Share Your Adventure</h3>
                      <button 
                        onClick={() => setShowStoryForm(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiX size={20} />
                      </button>
                    </div>
                    <textarea
                      value={newStoryContent}
                      onChange={(e) => setNewStoryContent(e.target.value)}
                      className="w-full h-32 p-3 bg-gray-50 text-gray-700 rounded-lg mb-4 focus:ring-2 focus:ring-green-500 focus:border-transparent border border-gray-200"
                      placeholder="Tell us about your experience..."
                    />
                    <div className="flex gap-3 mb-4">
                      <button className="flex items-center gap-2 text-gray-600 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
                        <FiImage /> Add Photo
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
                        <FiVideo /> Add Video
                      </button>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setShowStoryForm(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          // Add story submission logic here
                          setShowStoryForm(false);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg hover:opacity-90"
                      >
                        Share Story
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="reviews"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Floating action button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowReviewForm(true)}
              className="fixed bottom-8 right-8 bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-full shadow-xl z-10 flex items-center gap-2"
            >
              <FiPlus size={24} />
              <span className="hidden sm:inline">Write Review</span>
            </motion.button>

            {/* Reviews List */}
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-100 to-blue-100 p-0.5">
                      <div className="w-full h-full rounded-full bg-white overflow-hidden">
                        <img src={review.photo} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{review.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{review.handle}</span>
                            <span>•</span>
                            <span>{review.date}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleSaveReview(review.id)}
                          className={`p-2 rounded-full ${review.saved ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <FiBookmark className={review.saved ? 'fill-current' : ''} />
                        </button>
                      </div>
                      
                      {/* Trek Info */}
                      {review.trek && (
                        <div className="mt-2 text-sm text-gray-600">
                          Trek: <span className="font-medium">{review.trek}</span>
                        </div>
                      )}
                      
                      {/* Rating */}
                      <div className="flex gap-1 my-3">
                        {[...Array(5)].map((_, i) => (
                          i < review.rating ? (
                            <RiStarFill key={i} className="text-amber-400 text-xl" />
                          ) : (
                            <RiStarLine key={i} className="text-gray-300 text-xl" />
                          )
                        ))}
                      </div>
                      
                      {/* Review Content */}
                      <p className="text-gray-700 mt-2">{review.content}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* New Review Modal */}
            <AnimatePresence>
              {showReviewForm && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                  onClick={() => setShowReviewForm(false)}
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                      <button 
                        onClick={() => setShowReviewForm(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiX size={20} />
                      </button>
                    </div>
                    
                    {/* Rating Input */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReviewRating(star)}
                            className={`text-3xl ${star <= newReviewRating ? 'text-amber-400' : 'text-gray-300'} transition-colors`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Review Text */}
                    <textarea
                      value={newReviewContent}
                      onChange={(e) => setNewReviewContent(e.target.value)}
                      className="w-full h-32 p-3 bg-gray-50 text-gray-700 rounded-lg mb-4 focus:ring-2 focus:ring-green-500 focus:border-transparent border border-gray-200"
                      placeholder="Share your honest thoughts about this trek..."
                    />
                    
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setShowReviewForm(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          // Add review submission logic here
                          setShowReviewForm(false);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg hover:opacity-90"
                      >
                        Submit Review
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityMainContent;