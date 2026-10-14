import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { createId } from '@/lib/ids';
import { loadProfile, loadReports, saveProfile, saveReports } from '@/lib/storage';
import { LOCAL_AUTHOR_ID, type EmojiReaction, type LocalProfile, type Report } from '@/lib/types';

type ReportsContextValue = {
  ready: boolean;
  reports: Report[];
  profile: LocalProfile;
  myReports: Report[];
  getReport: (id: string) => Report | undefined;
  reportsForProvince: (province: string) => Report[];
  setDisplayName: (name: string) => Promise<void>;
  addReport: (report: Omit<Report, 'id' | 'authorId' | 'authorName' | 'createdAt'>) => Promise<string>;
  requestDelete: (id: string, reason: string) => Promise<void>;
  setReportEmojis: (id: string, emojis: EmojiReaction[]) => Promise<void>;
};

const ReportsContext = createContext<ReportsContextValue | null>(null);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [profile, setProfile] = useState<LocalProfile>({ displayName: 'Resident' });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadReports(), loadProfile()]).then(([loadedReports, loadedProfile]) => {
      if (cancelled) return;
      setReports(loadedReports);
      setProfile(loadedProfile);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const persistReports = useCallback(async (next: Report[]) => {
    setReports(next);
    await saveReports(next);
  }, []);

  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [reports],
  );

  const publicReports = useMemo(
    () => sortedReports.filter((r) => r.status !== 'pending_approval'),
    [sortedReports],
  );

  const myReports = useMemo(
    () => sortedReports.filter((r) => r.authorId === LOCAL_AUTHOR_ID),
    [sortedReports],
  );

  const getReport = useCallback(
    (id: string) => sortedReports.find((r) => r.id === id),
    [sortedReports],
  );

  const reportsForProvince = useCallback(
    (province: string) => publicReports.filter((r) => r.province === province),
    [publicReports],
  );

  const setDisplayName = useCallback(async (name: string) => {
    const next = { displayName: name.trim() || 'Resident' };
    setProfile(next);
    await saveProfile(next);
    setReports((current) => {
      const updated = current.map((r) =>
        r.authorId === LOCAL_AUTHOR_ID ? { ...r, authorName: next.displayName } : r,
      );
      saveReports(updated);
      return updated;
    });
  }, []);

  const addReport = useCallback(
    async (input: Omit<Report, 'id' | 'authorId' | 'authorName' | 'createdAt'>) => {
      const now = new Date().toISOString();
      const report: Report = {
        ...input,
        id: createId(),
        authorId: LOCAL_AUTHOR_ID,
        authorName: profile.displayName,
        createdAt: now,
      };
      await persistReports([report, ...reports]);
      return report.id;
    },
    [persistReports, profile.displayName, reports],
  );

  const setReportEmojis = useCallback(
    async (id: string, emojis: EmojiReaction[]) => {
      await persistReports(reports.map((r) => (r.id === id ? { ...r, emojis } : r)));
    },
    [persistReports, reports],
  );

  const requestDelete = useCallback(
    async (id: string, reason: string) => {
      await persistReports(
        reports.map((r) =>
          r.id === id && r.authorId === LOCAL_AUTHOR_ID
            ? {
                ...r,
                status: 'deletion_requested',
                deletionReason: reason.trim(),
              }
            : r,
        ),
      );
    },
    [persistReports, reports],
  );

  const value = useMemo(
    () => ({
      ready,
      reports: publicReports,
      profile,
      myReports,
      getReport,
      reportsForProvince,
      setDisplayName,
      addReport,
      requestDelete,
      setReportEmojis,
    }),
    [
      ready,
      publicReports,
      profile,
      myReports,
      getReport,
      reportsForProvince,
      setDisplayName,
      addReport,
      requestDelete,
      setReportEmojis,
    ],
  );

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) {
    throw new Error('useReports must be used within ReportsProvider');
  }
  return ctx;
}
