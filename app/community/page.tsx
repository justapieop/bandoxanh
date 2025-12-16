'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import Header from '@/components/Header';

import ImageGallery from '@/components/ImageGallery';
import ImageViewer from '@/components/ImageViewer';
import ReactionPicker from '@/components/ReactionPicker';
import FollowButton from '@/components/FollowButton';
import SignInPrompt from '@/components/SignInPrompt';
import { ChatBubbleIcon, ImageIcon, XIcon, ShareIcon } from '@/components/Icons';
import ShareModal from '@/components/ShareModal';
import { useEffect, useRef } from 'react';
import React from 'react';
import { useCommunityStore, type DBPost, type DBComment } from '@/store/communityStore';
import { useTheme } from '@/hooks/useTheme';
import { useSidebar } from '@/hooks/useSidebar';
import { useFeedTabStore } from '@/store/feedTabStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { NewsPageComponent } from '@/components/NewsPageContent';
import { Users, Newspaper, Compass, UserCheck, Sparkles, Send, MoreVertical, Edit2, Trash2 } from 'lucide-react';

export default function CommunityPage() {
  const router = useRouter();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { requireAuth, showSignInPrompt, setShowSignInPrompt, promptFeature } = useRequireAuth();

  // Local state for edit/delete modals
  const [editingPostId, setEditingPostId] = React.useState<string | null>(null);
  const [editPostContent, setEditPostContent] = React.useState('');
  const [openActionMenu, setOpenActionMenu] = React.useState<string | null>(null);
  const [openCommentMenu, setOpenCommentMenu] = React.useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = React.useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = React.useState('');
  const [imageViewer, setImageViewer] = React.useState<{ images: string[]; index: number } | null>(null);
  const [shareModalData, setShareModalData] = React.useState<{ url: string; title: string; text: string; type: 'post' | 'news' | 'event' } | null>(null);

  // Page level tab state (Forum vs News)
  const [pageTab, setPageTab] = React.useState<'forum' | 'news'>('forum');

  // Feed tab store (Zustand with caching)
  const {
    activeTab,
    setActiveTab,
    explorePosts,
    followingPosts,
    exploreLoading,
    followingLoading,
    addPost,
    deletePost,
    updatePost,
    setExplorePosts,
    setFollowingPosts,
    setExploreLoading,
    setFollowingLoading,
    isExploreCacheValid,
    isFollowingCacheValid,
  } = useFeedTabStore();

  // Get current posts and loading state based on active tab
  const posts = activeTab === 'explore' ? explorePosts : followingPosts;
  const loading = activeTab === 'explore' ? exploreLoading : followingLoading;

  // Global state
  const { isCollapsed: isSidebarCollapsed, setCollapsed: setSidebarCollapsed } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  // Fetch posts on mount and when tab changes
  useEffect(() => {
    const fetchPosts = async () => {
      if (activeTab === 'explore') {
        if (isExploreCacheValid() && explorePosts.length > 0) return;
        setExploreLoading(true);
        try {
          const response = await fetch('/api/posts');
          if (response.ok) {
            const data = await response.json();
            setExplorePosts(data);
          }
        } catch (error) {
          console.error('Error fetching explore posts:', error);
        } finally {
          setExploreLoading(false);
        }
      } else {
        if (isFollowingCacheValid() && followingPosts.length > 0) return;
        setFollowingLoading(true);
        try {
          const response = await fetch('/api/posts/following');
          if (response.ok) {
            const data = await response.json();
            setFollowingPosts(data);
          } else {
            // Fallback to all posts if following API doesn't exist
            const allResponse = await fetch('/api/posts');
            if (allResponse.ok) {
              const data = await allResponse.json();
              setFollowingPosts(data);
            }
          }
        } catch (error) {
          console.error('Error fetching following posts:', error);
        } finally {
          setFollowingLoading(false);
        }
      }
    };

    fetchPosts();
  }, [activeTab]);

  // Local state for new post
  const [newPostContent, setNewPostContent] = React.useState('');
  const [postImages, setPostImages] = React.useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);
  const [uploading, setUploading] = React.useState(false);

  // Local state for comments
  const [commentingPostId, setCommentingPostId] = React.useState<string | null>(null);
  const [commentText, setCommentText] = React.useState('');

  const navigateToNews = (path: string, options?: any) => {
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseImages = (images: any): string[] => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [images];
      } catch {
        return [images];
      }
    }
    return [];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setPostImages(prev => [...prev, ...newFiles]);

      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setPostImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      const urlToRemove = prev[index];
      URL.revokeObjectURL(urlToRemove);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && postImages.length === 0) return;
    if (!user) {
      requireAuth(() => { }, 'đăng bài');
      return;
    }

    try {
      setUploading(true);
      const imageUrls: string[] = [];

      // Upload images if any
      if (postImages.length > 0) {
        const uploadPromises = postImages.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);

          try {
            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });

            if (uploadRes.ok) {
              const data = await uploadRes.json();
              return data.url;
            } else {
              console.error('Failed to upload image');
              return null;
            }
          } catch (err) {
            console.error('Error uploading image:', err);
            return null;
          }
        });

        const results = await Promise.all(uploadPromises);
        results.forEach(url => {
          if (url) imageUrls.push(url);
        });
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPostContent,
          images: imageUrls,
          authorId: user.id,
          name: user.fullName || user.firstName || 'Anonymous',
          email: user.emailAddresses?.[0]?.emailAddress,
          avatar: user.imageUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      const newPost = await response.json();
      addPost(newPost);

      setNewPostContent('');
      setPostImages([]);
      setPreviewUrls([]);
      toast.success('Đăng bài thành công!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Có lỗi xảy ra khi đăng bài');
    } finally {
      setUploading(false);
    }
  };

  const handleEditPost = (postId: string, content: string) => {
    setEditingPostId(postId);
    setEditPostContent(content);
    setOpenActionMenu(null);
  };

  const handleSaveEditPost = async (postId: string) => {
    try {
      if (!editPostContent.trim()) return;

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editPostContent })
      });

      if (!response.ok) throw new Error('Failed to update post');

      const updatedPost = await response.json();
      updatePost(postId, { content: updatedPost.content });
      setEditingPostId(null);
      toast.success('Cập nhật bài viết thành công');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Có lỗi xảy ra khi cập nhật');
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return;
    if (!user) {
      requireAuth(() => { }, 'bình luận');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentText,
          authorId: user.id,
          name: user.fullName || user.firstName || 'Anonymous',
          email: user.emailAddresses?.[0]?.emailAddress,
          avatar: user.imageUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add comment');
      }

      setCommentText('');
      setCommentingPostId(null);
      toast.success('Đã gửi bình luận');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Lỗi khi gửi bình luận');
    }
  };

  const handleEditComment = (commentId: string, content: string, postId: string) => {
    setEditingCommentId(commentId);
    setEditCommentContent(content);
    setOpenCommentMenu(null);
  };

  const handleSaveEditComment = async (postId: string, commentId: string) => {
    try {
      if (!editCommentContent.trim()) return;

      const response = await fetch(`/api/posts/${postId}/comment/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editCommentContent })
      });

      if (!response.ok) throw new Error('Failed to update comment');

      setEditingCommentId(null);
      toast.success('Cập nhật bình luận thành công');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Lỗi khi cập nhật bình luận');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
      try {
        const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete post');
        deletePost(postId);
        setOpenActionMenu(null);
        toast.success('Đã xóa bài viết');
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Có lỗi xảy ra khi xóa bài viết');
      }
    }
  };

  return (
    <div className="min-h-screen font-sans text-brand-gray-dark dark:text-gray-200">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        isCollapsed={isSidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="min-h-screen pt-20 md:pt-0 transition-all duration-300 md:pl-20">

        {/* Hero Header */}
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 pb-6">
            {/* Main Tab Navigation */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPageTab('forum')}
                className={`group flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${pageTab === 'forum'
                  ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-lg shadow-green-100/50 dark:shadow-none'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50'
                  }`}
              >
                <Users className={`w-5 h-5 transition-transform ${pageTab === 'forum' ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span>Cộng Đồng</span>
              </button>
              <button
                onClick={() => setPageTab('news')}
                className={`group flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${pageTab === 'news'
                  ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-lg shadow-green-100/50 dark:shadow-none'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50'
                  }`}
              >
                <Newspaper className={`w-5 h-5 transition-transform ${pageTab === 'news' ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span>Tin Tức & Sự Kiện</span>
              </button>
            </div>
          </div>
        </div>

        {pageTab === 'news' ? (
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
            <div className="animate-fade-in">
              <NewsPageComponent navigateTo={navigateToNews} />
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <main className="space-y-6">
              {/* Feed Tabs */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-1.5 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveTab('explore')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium rounded-xl transition-all duration-300 ${activeTab === 'explore'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    <Compass className="w-4 h-4" />
                    Khám phá
                  </button>
                  <button
                    onClick={() => setActiveTab('following')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium rounded-xl transition-all duration-300 ${activeTab === 'following'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    Theo dõi
                  </button>
                </div>
              </div>

              {/* Create Post Section */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {!user ? (
                  <div
                    onClick={() => requireAuth(() => { }, 'đăng bài')}
                    className="p-5 flex items-center gap-4 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="h-12 bg-gray-50 dark:bg-gray-700/50 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-600 flex items-center px-5 text-gray-400 group-hover:border-green-300 dark:group-hover:border-green-600 transition-colors">
                        Đăng nhập để chia sẻ với cộng đồng...
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5">
                    <div className="flex gap-4">
                      <img
                        src={user.imageUrl}
                        alt="User"
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-green-100 dark:ring-green-900"
                      />
                      <div className="flex-1">
                        <textarea
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder={`Chào ${user.firstName || 'bạn'}, bạn có gì muốn chia sẻ?`}
                          className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-0 text-base"
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Image Previews */}
                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-4 ml-16">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative group aspect-square rounded-xl overflow-hidden">
                            <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                            <button
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 text-green-600 dark:text-green-400 font-medium rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                      >
                        <ImageIcon className="w-5 h-5" />
                        <span>Ảnh/Video</span>
                      </button>

                      <button
                        onClick={handleCreatePost}
                        disabled={uploading || (newPostContent.trim() === '' && previewUrls.length === 0)}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2.5 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200/50 dark:shadow-green-900/30"
                      >
                        {uploading ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Đang đăng...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Đăng
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Posts Feed */}
              <div className="space-y-4">
                {loading ? (
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Đang tải bài viết...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ChatBubbleIcon className="w-10 h-10 text-green-500" />
                    </div>
                    {activeTab === 'following' ? (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Chưa có bài viết</h3>
                        <p className="text-gray-500 dark:text-gray-400">Theo dõi thêm người dùng để xem bài viết của họ!</p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cộng đồng đang chờ bạn!</h3>
                        <p className="text-gray-500 dark:text-gray-400">Hãy là người đầu tiên chia sẻ!</p>
                      </>
                    )}
                  </div>
                ) : (
                  posts.map((post, index) => (
                    <div
                      key={post.id}
                      className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Post Header */}
                      <div className="p-5">
                        <div className="flex items-start gap-3 mb-4">
                          <button
                            onClick={() => requireAuth(() => router.push(`/profile/${post.author?.id}`), 'xem thông tin người dùng')}
                            className="flex-shrink-0 hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={post.author?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.author?.name || 'User')}
                              alt={post.author?.name}
                              className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                            />
                          </button>
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => requireAuth(() => router.push(`/profile/${post.author?.id}`), 'xem thông tin người dùng')}
                              className="font-semibold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors block truncate"
                            >
                              {post.author?.name}
                            </button>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(post.createdAt)}</p>
                          </div>

                          {/* Follow button */}
                          {user && post.author?.email !== user?.emailAddresses?.[0]?.emailAddress && post.author?.id && (
                            <FollowButton userId={Number(post.author.id)} className="text-xs" />
                          )}

                          {/* Edit/Delete Menu */}
                          {user && post.author?.email === user?.emailAddresses?.[0]?.emailAddress && (
                            <div className="relative">
                              <button
                                onClick={() => setOpenActionMenu(openActionMenu === post.id ? null : post.id)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>
                              {openActionMenu === post.id && (
                                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 border border-gray-100 dark:border-gray-700 overflow-hidden">
                                  <button
                                    onClick={() => handleEditPost(post.id, post.content)}
                                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    Chỉnh sửa
                                  </button>
                                  <button
                                    onClick={() => handleDeletePost(post.id)}
                                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa bài viết
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Post Content */}
                        {editingPostId === post.id ? (
                          <div className="space-y-3 mb-4">
                            <textarea
                              value={editPostContent}
                              onChange={(e) => setEditPostContent(e.target.value)}
                              className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 resize-none transition-all"
                              rows={4}
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingPostId(null)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                              >
                                Huỷ
                              </button>
                              <button
                                onClick={() => handleSaveEditPost(post.id)}
                                className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                              >
                                Lưu
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-900 dark:text-gray-100 mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                        )}

                        {/* Post Images */}
                        <ImageGallery
                          images={parseImages(post.images)}
                          onImageClick={(index) => setImageViewer({ images: parseImages(post.images), index })}
                        />
                      </div>

                      {/* Post Footer */}
                      <div className="px-5 py-4 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <ReactionPicker postId={parseInt(post.id)} requireAuth={requireAuth} />
                            <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                              <ChatBubbleIcon className="w-5 h-5" />
                              <span className="text-sm font-medium">{post.comments?.length || 0}</span>
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              const postUrl = `${window.location.origin}/share/post/${post.id}`;
                              setShareModalData({
                                url: postUrl,
                                title: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
                                text: post.content,
                                type: 'post'
                              });
                            }}
                            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                          >
                            <ShareIcon className="w-5 h-5" />
                            <span className="text-sm font-medium hidden sm:inline">Chia sẻ</span>
                          </button>
                        </div>
                      </div>

                      {/* Comments Section */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="px-5 py-4 space-y-4 border-t border-gray-100 dark:border-gray-700">
                          {post.comments.slice(0, 3).map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <button
                                onClick={() => requireAuth(() => router.push(`/profile/${comment.author?.id}`), 'xem thông tin người dùng')}
                                className="flex-shrink-0"
                              >
                                <img
                                  src={comment.author?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.author?.name || 'User')}
                                  alt={comment.author?.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              </button>
                              <div className="flex-1">
                                {editingCommentId === comment.id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={editCommentContent}
                                      onChange={(e) => setEditCommentContent(e.target.value)}
                                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm resize-none"
                                      rows={2}
                                    />
                                    <div className="flex gap-2 justify-end">
                                      <button
                                        onClick={() => setEditingCommentId(null)}
                                        className="text-xs px-3 py-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                      >
                                        Huỷ
                                      </button>
                                      <button
                                        onClick={() => handleSaveEditComment(post.id, comment.id)}
                                        className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg"
                                      >
                                        Lưu
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-gray-100 dark:bg-gray-700/50 rounded-2xl px-4 py-3 relative group">
                                    <button
                                      onClick={() => requireAuth(() => router.push(`/profile/${comment.author?.id}`), 'xem thông tin người dùng')}
                                      className="text-sm font-semibold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                    >
                                      {comment.author?.name}
                                    </button>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(comment.createdAt)}</p>

                                    {user && comment.author?.email === user?.emailAddresses?.[0]?.emailAddress && (
                                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => setOpenCommentMenu(openCommentMenu === comment.id ? null : comment.id)}
                                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                                        >
                                          <MoreVertical className="w-4 h-4" />
                                        </button>
                                        {openCommentMenu === comment.id && (
                                          <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border border-gray-100 dark:border-gray-700 overflow-hidden">
                                            <button
                                              onClick={() => handleEditComment(comment.id, comment.content, post.id)}
                                              className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
                                            >
                                              Sửa
                                            </button>
                                            <button
                                              onClick={async () => {
                                                if (confirm('Bạn có chắc muốn xóa bình luận này?')) {
                                                  try {
                                                    await fetch(`/api/posts/${post.id}/comment/${comment.id}`, { method: 'DELETE' });
                                                    setOpenCommentMenu(null);
                                                    toast.success('Đã xóa bình luận');
                                                  } catch (error) {
                                                    toast.error('Lỗi khi xóa bình luận');
                                                  }
                                                }
                                              }}
                                              className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs text-red-600"
                                            >
                                              Xóa
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Input */}
                      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 relative">
                        {!user && (
                          <div
                            onClick={() => requireAuth(() => { }, 'bình luận')}
                            className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-[2px] z-10 flex items-center justify-center cursor-pointer"
                          >
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Đăng nhập để bình luận</p>
                          </div>
                        )}
                        <div className="flex gap-3">
                          <img
                            src={user?.imageUrl || 'https://ui-avatars.com/api/?name=User'}
                            alt="Your avatar"
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={commentingPostId === post.id ? commentText : ''}
                              onChange={(e) => {
                                setCommentingPostId(post.id);
                                setCommentText(e.target.value);
                              }}
                              onFocus={() => setCommentingPostId(post.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && commentText.trim()) {
                                  handleAddComment(post.id);
                                }
                              }}
                              placeholder="Viết bình luận..."
                              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all"
                              disabled={!user}
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              disabled={commentingPostId !== post.id || !commentText.trim()}
                              className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </main>
          </div>
        )}
      </div>

      {imageViewer && (
        <ImageViewer
          images={imageViewer.images}
          initialIndex={imageViewer.index}
          onClose={() => setImageViewer(null)}
        />
      )}

      {shareModalData && (
        <ShareModal
          url={shareModalData.url}
          title={shareModalData.title}
          text={shareModalData.text}
          type={shareModalData.type}
          onClose={() => setShareModalData(null)}
        />
      )}

      <SignInPrompt
        isOpen={showSignInPrompt}
        onClose={() => setShowSignInPrompt(false)}
        feature={promptFeature}
      />
    </div>
  );
}
