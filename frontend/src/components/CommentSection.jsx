/**
 * Comment Section Component
 * 
 * Displays and manages comments for a recipe.
 * Features:
 * - View all comments with user info and timestamps
 * - Add new comments (requires authentication)
 * - Delete own comments
 * - Real-time relative timestamps (e.g., "2h ago", "3d ago")
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { recipesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Trash2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * @param {number} recipeId - ID of the recipe to show comments for
 */
const CommentSection = ({ recipeId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  // Fetch comments for this recipe
  const { data: comments, isLoading } = useQuery(
    ['comments', recipeId],
    () => recipesAPI.getComments(recipeId),
    {
      select: (response) => response.data,
    }
  );

  // Mutation for adding a new comment
  const addCommentMutation = useMutation(
    (text) => recipesAPI.addComment(recipeId, text),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', recipeId]);
        setCommentText('');
        toast.success('Comment added!');
      },
      onError: () => {
        toast.error('Failed to add comment');
      }
    }
  );

  // Mutation for deleting a comment
  const deleteCommentMutation = useMutation(
    (commentId) => recipesAPI.deleteComment(commentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', recipeId]);
        toast.success('Comment deleted!');
      },
      onError: () => {
        toast.error('Failed to delete comment');
      }
    }
  );

  // Handle comment form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    if (!user) {
      toast.error('Please log in to comment');
      return;
    }
    addCommentMutation.mutate(commentText);
  };

  // Handle comment deletion with confirmation
  const handleDelete = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  /**
   * Format timestamp as relative time (e.g., "2h ago", "3d ago")
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted relative time
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="h-5 w-5 text-gray-600" />
        <h2 className="text-xl font-semibold">
          Comments {comments && comments.length > 0 && `(${comments.length})`}
        </h2>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.username[0].toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!commentText.trim() || addCommentMutation.isLoading}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  <span>{addCommentMutation.isLoading ? 'Posting...' : 'Post Comment'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-gray-600">Please <Link to="/login" className="text-primary-500 hover:text-primary-600">log in</Link> to leave a comment</p>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3 pb-4 border-b border-gray-100 last:border-0">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {comment.user.username[0].toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {comment.user.username}
                    </span>
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-gray-500 text-sm">{formatDate(comment.created_at)}</span>
                  </div>
                  {user && user.id === comment.user.id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Delete comment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;

