import { create } from 'zustand';
import { Universe, PanelType, SimulatorState } from '@/types';

interface ChronosStore {
  // Universe state
  universes: Universe[];
  activeUniverse: Universe | null;
  setUniverses: (u: Universe[]) => void;
  setActiveUniverse: (u: Universe | null) => void;
  updateActiveUniverse: (partial: Partial<Universe>) => void;

  // UI state
  activePanel: PanelType;
  setActivePanel: (p: PanelType) => void;

  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;

  // Simulator state
  simulatorState: SimulatorState;
  currentStep: number;
  totalSteps: number;
  compiledTimeline: any | null;
  setSimulatorState: (s: SimulatorState) => void;
  setCurrentStep: (s: number) => void;
  setCompiledTimeline: (t: any) => void;

  // Analysis cache
  paradoxData: any | null;
  influenceData: any | null;
  dashboardData: any | null;
  setParadoxData: (d: any) => void;
  setInfluenceData: (d: any) => void;
  setDashboardData: (d: any) => void;

  // Active node highlights (from analysis)
  highlightedNodes: Set<string>;
  setHighlightedNodes: (ids: Set<string>) => void;

  // Collapse animation state
  collapsingNodes: Set<string>;
  setCollapsingNodes: (ids: Set<string>) => void;

  // Loading
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;

  // Sidebar collapsed
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
}

export const useChronosStore = create<ChronosStore>((set) => ({
  universes: [],
  activeUniverse: null,
  setUniverses: (universes) => set({ universes }),
  setActiveUniverse: (activeUniverse) => set({ activeUniverse }),
  updateActiveUniverse: (partial) =>
    set((state) => ({
      activeUniverse: state.activeUniverse ? { ...state.activeUniverse, ...partial } : null,
    })),

  activePanel: 'none',
  setActivePanel: (activePanel) => set({ activePanel }),

  selectedEventId: null,
  setSelectedEventId: (selectedEventId) => set({ selectedEventId }),

  simulatorState: 'stopped',
  currentStep: 0,
  totalSteps: 0,
  compiledTimeline: null,
  setSimulatorState: (simulatorState) => set({ simulatorState }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setCompiledTimeline: (compiledTimeline) =>
    set({ compiledTimeline, totalSteps: compiledTimeline?.total_steps || 0 }),

  paradoxData: null,
  influenceData: null,
  dashboardData: null,
  setParadoxData: (paradoxData) => set({ paradoxData }),
  setInfluenceData: (influenceData) => set({ influenceData }),
  setDashboardData: (dashboardData) => set({ dashboardData }),

  highlightedNodes: new Set(),
  setHighlightedNodes: (highlightedNodes) => set({ highlightedNodes }),

  collapsingNodes: new Set(),
  setCollapsingNodes: (collapsingNodes) => set({ collapsingNodes }),

  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  sidebarCollapsed: false,
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
}));
