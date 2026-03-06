import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { motion } from "framer-motion";

export default function VisitorCounter() {
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Track this visitor (total counter - increments on every page view)
    const trackTotalVisitor = async () => {
      try {
        const response = await fetch('/api/track-total-visitor', {
          method: 'POST',
        });
        const data = await response.json();
        if (data.success) {
          setVisitorCount(data.count);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error tracking total visitor:', error);
        // Fallback: just get the count without tracking
        try {
          const response = await fetch('/api/total-visitor-count');
          const data = await response.json();
          if (data.success) {
            setVisitorCount(data.count);
            setIsLoading(false);
          }
        } catch (fallbackError) {
          console.error('Error getting total visitor count:', fallbackError);
          setIsLoading(false);
        }
      }
    };

    trackTotalVisitor();
  }, []);

  // Format number with commas for better readability
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-900/20 to-blue-100/20 rounded-lg border border-blue-900/30"
      data-testid="visitor-counter"
    >
      <div className="flex items-center gap-2">
        <div className="p-2 bg-yellow-400/90 rounded-full">
          <Users className="h-5 w-5 text-blue-900" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-blue-900/70 font-medium uppercase tracking-wide">
            Total Visitors
          </span>
          <motion.span 
            key={visitorCount}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-blue-900"
            data-testid="text-visitor-count"
          >
            {isLoading ? '...' : formatNumber(visitorCount)}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
