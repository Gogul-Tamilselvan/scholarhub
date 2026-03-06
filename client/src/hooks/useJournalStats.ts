import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

interface JournalStats {
  journalId: string;
  journalTitle: string;
  visitors: number;
  downloads: number;
}

export function useJournalStats(journalId: string) {
  return useQuery({
    queryKey: ['/api/journal-stats', journalId],
    queryFn: async () => {
      const res = await fetch(`/api/journal-stats/${journalId}`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      return data.stats as JournalStats;
    },
  });
}

export function useAllJournalStats() {
  return useQuery({
    queryKey: ['/api/journal-stats'],
    queryFn: async () => {
      const res = await fetch('/api/journal-stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      return data.stats as JournalStats[];
    },
  });
}

export function useTrackVisitor(journalId: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/track-visitor/${journalId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to track visitor');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal-stats', journalId] });
      queryClient.invalidateQueries({ queryKey: ['/api/journal-stats'] });
    },
  });
}

export function useTrackDownload(journalId: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/track-download/${journalId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to track download');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal-stats', journalId] });
      queryClient.invalidateQueries({ queryKey: ['/api/journal-stats'] });
    },
  });
}
