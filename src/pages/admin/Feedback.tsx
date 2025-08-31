
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, TrendingUp, MessageSquare, Users, Calendar, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const Feedback = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch feedback data from the database
  const { data: feedbackData = [], isLoading } = useQuery({
    queryKey: ['admin-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate statistics
  const totalReviews = feedbackData.length;
  const averageRating = totalReviews > 0 
    ? (feedbackData.reduce((sum, f) => sum + f.rating, 0) / totalReviews).toFixed(1)
    : '0.0';
  const fiveStarReviews = feedbackData.filter(f => f.rating === 5).length;
  const fourPlusStarReviews = feedbackData.filter(f => f.rating >= 4).length;
  const withComments = feedbackData.filter(f => f.comment && f.comment.trim()).length;

  const filteredFeedback = feedbackData.filter(feedback =>
    feedback.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (feedback.service_name && feedback.service_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (feedback.comment && feedback.comment.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customer Feedback</h1>
            <p className="text-sm text-muted-foreground">Monitor customer satisfaction</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{totalReviews}</p>
            <p className="text-xs text-muted-foreground">Total Reviews</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-lg font-bold">{averageRating}</p>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-lg font-bold text-green-600">{fiveStarReviews}</p>
                  <p className="text-xs text-muted-foreground">5-Star</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-lg font-bold text-blue-600">{fourPlusStarReviews}</p>
                  <p className="text-xs text-muted-foreground">4+ Star</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-lg font-bold text-purple-600">{withComments}</p>
                  <p className="text-xs text-muted-foreground">Comments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search feedback..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filteredFeedback.length > 0 ? (
          filteredFeedback.map((feedback) => (
            <Card key={feedback.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{feedback.customer_name}</h3>
                    <p className="text-sm text-muted-foreground">{feedback.customer_email}</p>
                    {feedback.service_name && (
                      <Badge variant="outline" className="mt-1">
                        {feedback.service_name}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center space-x-1">
                      {renderStars(feedback.rating)}
                    </div>
                    <p className={`text-sm font-semibold ${getRatingColor(feedback.rating)}`}>
                      {feedback.rating}/5
                    </p>
                  </div>
                </div>
                
                {feedback.comment && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm leading-relaxed">{feedback.comment}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No feedback found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
