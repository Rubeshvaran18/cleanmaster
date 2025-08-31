
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Send, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';

export function FeedbackForm() {
  const { bookings } = useBookings();
  const { user } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const completedBookings = bookings.filter(booking => booking.status === 'Completed');

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || rating === 0) {
      toast.error('Please select a booking and provide a rating');
      return;
    }

    setSubmitting(true);
    try {
      const booking = completedBookings.find(b => b.id === selectedBooking);
      if (!booking) return;

      // Get user metadata for customer name
      const customerName = user?.user_metadata?.first_name && user?.user_metadata?.last_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
        : booking.customer_name || 'Anonymous Customer';

      const { error } = await supabase
        .from('feedback')
        .insert({
          customer_name: customerName,
          customer_email: booking.customer_email || user?.email || '',
          service_name: booking.service_name,
          rating,
          comment: comment.trim() || null,
          booking_id: booking.id,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Thank you for your feedback! 🌟');
      setSelectedBooking('');
      setRating(0);
      setComment('');

      // Show appreciation message based on rating
      if (rating >= 4) {
        setTimeout(() => {
          toast.success('We\'re thrilled you loved our service! 💖');
        }, 1000);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <MessageCircle className="h-5 w-5" />
          Share Your Experience
        </CardTitle>
        <p className="text-sm text-blue-600">Your feedback helps us improve our services</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="booking" className="text-sm font-medium">Select Completed Service</Label>
            <Select value={selectedBooking} onValueChange={setSelectedBooking}>
              <SelectTrigger className="mt-1 bg-white/80">
                <SelectValue placeholder="Choose a completed service to review" />
              </SelectTrigger>
              <SelectContent>
                {completedBookings.map((booking) => (
                  <SelectItem key={booking.id} value={booking.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{booking.service_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">How would you rate our service?</Label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className="focus:outline-none transform hover:scale-110 transition-transform duration-200"
                >
                  <Star
                    className={`h-8 w-8 transition-colors duration-200 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-sm font-medium text-muted-foreground">
                  {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Needs Improvement'}
                </span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="comment" className="text-sm font-medium">Tell us more about your experience (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like most? How can we improve? Your feedback matters to us..."
              rows={4}
              className="mt-1 bg-white/80 resize-none"
            />
          </div>

          <Button 
            type="submit" 
            disabled={submitting || !selectedBooking || rating === 0}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </form>

        {completedBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-blue-700 mb-2">No completed services yet</h3>
            <p className="text-blue-600">Complete a service booking to leave your first review!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
