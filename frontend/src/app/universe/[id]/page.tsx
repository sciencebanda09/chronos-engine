'use client';
import { useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { useChronosStore } from '@/store';
import { TopBar } from '@/components/layout/TopBar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { UniverseCanvas } from '@/components/canvas/UniverseCanvas';
import { BottomBar } from '@/components/layout/BottomBar';
import toast from 'react-hot-toast';

export default function UniversePage() {
  const params = useParams();
  const router = useRouter();
  const universeId = params.id as string;
  const { setActiveUniverse, setIsLoading, activePanel } = useChronosStore();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const u = await api.universes.get(universeId);
      setActiveUniverse(u);
    } catch (e: any) {
      toast.error('Universe not found');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, [universeId]);

  useEffect(() => {
    load();
    return () => setActiveUniverse(null);
  }, [load]);

  return (
    <div className="flex flex-col h-screen bg-chronos-bg overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <main className="flex-1 relative overflow-hidden">
          <UniverseCanvas />
        </main>
        {activePanel !== 'none' && <RightPanel />}
      </div>
      <BottomBar />
    </div>
  );
}
