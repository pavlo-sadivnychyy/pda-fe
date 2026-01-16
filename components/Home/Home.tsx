// "use client";
//
// import * as React from "react";
// import {
//   Box,
//   IconButton,
//   Tooltip,
//   Typography,
//   useMediaQuery,
// } from "@mui/material";
// import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
// import { useRouter } from "next/navigation";
//
// import {
//   DndContext,
//   DragEndEvent,
//   DragOverlay,
//   DragStartEvent,
//   KeyboardSensor,
//   PointerSensor,
//   closestCenter,
//   useSensor,
//   useSensors,
//   MeasuringStrategy,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   arrayMove,
//   rectSortingStrategy,
//   sortableKeyboardCoordinates,
//   useSortable,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
//
// import { useCurrentUser } from "@/hooksNew/useAppBootstrap";
// import { useHomeProfile } from "@/components/Home/hooks/useHomeProfile";
// import { useTodayTasks } from "@/components/Home/hooks/useTodayTasks";
// import { useRecentActivity } from "@/components/Home/hooks/useRecentActivity";
//
// import { HomeHeader } from "@/components/Home/components/HomeHeader";
// import { BusinessProfileCard } from "@/components/Home/components/BusinessProfileCard";
// import { DocumentsCard } from "@/components/Home/components/DocumentsCard";
// import {
//   ActsShortcutCard,
//   AnalyticsShortcutCard,
//   ClientsShortcutCard,
//   InvoicesShortcutCard,
//   QuotesShortcutCard,
// } from "@/components/Home/components/FinanceShortcutsCards";
// import { TodayTasksCard } from "./components/TodayTasksCard";
// import { AiChatCard } from "@/components/Home/components/AiChatCard";
// import { InvoiceDeadlinesCard } from "@/components/Home/components/InvoiceDeadlinesCard";
// import { RecentActivityCard } from "@/components/Home/components/RecentActivityCard";
// import { PlanCard, PlanId } from "@/components/Home/components/PlanCard";
//
// const DEFAULT_ORDER = [
//   "business",
//   "documents",
//   "activity",
//   "ai",
//   "today",
//   "deadlines",
//   "plan",
//   "clientsShortcut",
//   "invoicesShortcut",
//   "quotesShortcut",
//   "actsShortcut",
//   "analyticsShortcut",
// ] as const;
//
// type CardKey = (typeof DEFAULT_ORDER)[number];
//
// const STORAGE_KEY = "home:cardsOrder:v1";
//
// function sanitizeOrder(raw: unknown): CardKey[] {
//   const allowed = new Set(DEFAULT_ORDER as readonly string[]);
//   const arr = Array.isArray(raw) ? raw : [];
//   const cleaned = arr.filter(
//     (x) => typeof x === "string" && allowed.has(x),
//   ) as CardKey[];
//
//   for (const k of DEFAULT_ORDER) if (!cleaned.includes(k)) cleaned.push(k);
//   return cleaned;
// }
//
// function loadOrderClient(): CardKey[] {
//   try {
//     const raw = window.localStorage.getItem(STORAGE_KEY);
//     if (!raw) return [...DEFAULT_ORDER];
//     return sanitizeOrder(JSON.parse(raw));
//   } catch {
//     return [...DEFAULT_ORDER];
//   }
// }
//
// function saveOrderClient(order: CardKey[]) {
//   try {
//     window.localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
//   } catch {
//     // ignore
//   }
// }
//
// function DragHandleButton({
//   setActivatorNodeRef,
//   attributes,
//   listeners,
// }: {
//   setActivatorNodeRef: (node: HTMLElement | null) => void;
//   attributes: any;
//   listeners: any;
// }) {
//   return (
//     <Tooltip title="Перемістити">
//       <IconButton
//         size="small"
//         ref={setActivatorNodeRef}
//         {...attributes}
//         {...listeners}
//         sx={{
//           width: 32,
//           height: 32,
//           color: "#6b7280",
//           "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
//         }}
//       >
//         <DragIndicatorIcon fontSize="small" />
//       </IconButton>
//     </Tooltip>
//   );
// }
//
// function SortableItem({
//   id,
//   children,
//   onMeasured,
//   isDragMode,
//   title,
// }: {
//   id: CardKey;
//   children: (dragHandle: React.ReactNode) => React.ReactNode;
//   onMeasured: (id: CardKey, rect: { w: number; h: number }) => void;
//   isDragMode: boolean;
//   title: string;
// }) {
//   const {
//     setNodeRef,
//     setActivatorNodeRef,
//     attributes,
//     listeners,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id });
//
//   const measureRef = React.useRef<HTMLDivElement | null>(null);
//
//   React.useLayoutEffect(() => {
//     const el = measureRef.current;
//     if (!el) return;
//
//     const measure = () => {
//       const r = el.getBoundingClientRect();
//       if (r.width > 0 && r.height > 0)
//         onMeasured(id, { w: r.width, h: r.height });
//     };
//
//     measure();
//
//     const ro = new ResizeObserver(() => measure());
//     ro.observe(el);
//     return () => ro.disconnect();
//   }, [id, onMeasured]);
//
//   const style: React.CSSProperties = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.15 : 1,
//     width: "100%",
//   };
//
//   const dragHandle = (
//     <DragHandleButton
//       setActivatorNodeRef={setActivatorNodeRef}
//       attributes={attributes}
//       listeners={listeners}
//     />
//   );
//
//   return (
//     <Box
//       ref={(node) => {
//         measureRef.current = node as any;
//         setNodeRef(node);
//       }}
//       style={style}
//       sx={{
//         minWidth: 0,
//         width: "100%",
//
//         // ✅ критично для Masonry (CSS columns): item має бути inline-block
//         display: "inline-block",
//         verticalAlign: "top",
//
//         breakInside: "avoid",
//         pageBreakInside: "avoid",
//         WebkitColumnBreakInside: "avoid",
//
//         "& > *": { width: "100%" },
//
//         // ✅ щоб оверлей/блюр нормально кліпались по радіусу
//         position: "relative",
//       }}
//     >
//       {/* реальна картка */}
//       <Box
//         sx={{
//           width: "100%",
//           borderRadius: 3,
//           overflow: "hidden",
//           position: "relative",
//         }}
//       >
//         {children(dragHandle)}
//
//         {/* ✅ Під час drag: блюр всього контенту + заголовок по центру */}
//         {isDragMode && (
//           <Box
//             sx={{
//               position: "absolute",
//               inset: 0,
//               zIndex: 50,
//               display: "grid",
//               placeItems: "center",
//               pointerEvents: "none",
//               bgcolor: "rgba(255,255,255,0.35)",
//               backdropFilter: "blur(10px)",
//               WebkitBackdropFilter: "blur(10px)",
//             }}
//           >
//             <Typography
//               sx={{
//                 fontWeight: 900,
//                 letterSpacing: "-0.02em",
//                 color: "#111827",
//                 textAlign: "center",
//                 px: 2,
//                 fontSize: { xs: 16, sm: 18 },
//               }}
//             >
//               {title}
//             </Typography>
//           </Box>
//         )}
//       </Box>
//     </Box>
//   );
// }
//
// function getCardTitle(key: CardKey): string {
//   switch (key) {
//     case "business":
//       return "Профіль бізнесу";
//     case "documents":
//       return "Документи";
//     case "activity":
//       return "Остання активність";
//     case "ai":
//       return "AI асистент";
//     case "today":
//       return "Завдання на сьогодні";
//     case "deadlines":
//       return "Дедлайни інвойсів";
//     case "plan":
//       return "Тариф";
//     case "clientsShortcut":
//       return "Клієнти";
//     case "invoicesShortcut":
//       return "Інвойси";
//     case "quotesShortcut":
//       return "Комерційні пропозиції";
//     case "actsShortcut":
//       return "Акти";
//     case "analyticsShortcut":
//       return "Аналітика";
//     default:
//       return "Картка";
//   }
// }
//
// export default function HomePage() {
//   const router = useRouter();
//
//   const isOneCol = useMediaQuery("(max-width: 899.95px)");
//   const masonryCols = isOneCol ? 1 : 2;
//
//   const { data: userData } = useCurrentUser();
//   const currentUserId = (userData as any)?.id ?? null;
//
//   const profile = useHomeProfile(currentUserId);
//   const today = useTodayTasks(currentUserId);
//
//   const organizationId = profile.organization?.id ?? null;
//   const activity = useRecentActivity(organizationId, 3);
//
//   const currentPlanFromApi: PlanId =
//     ((userData as any)?.subscription?.planId as PlanId) ?? "FREE";
//
//   const openEntity = (type: "INVOICE" | "ACT" | "QUOTE", id: string) => {
//     if (type === "INVOICE") router.push(`/invoices/${id}`);
//     if (type === "ACT") router.push(`/acts/${id}`);
//     if (type === "QUOTE") router.push(`/quotes/${id}`);
//   };
//
//   // ✅ SSR-safe
//   const [mounted, setMounted] = React.useState(false);
//   const [order, setOrder] = React.useState<CardKey[]>([...DEFAULT_ORDER]);
//
//   React.useEffect(() => {
//     setMounted(true);
//     setOrder(loadOrderClient());
//   }, []);
//
//   React.useEffect(() => {
//     if (!mounted) return;
//     saveOrderClient(order);
//   }, [order, mounted]);
//
//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     }),
//   );
//
//   const [activeId, setActiveId] = React.useState<CardKey | null>(null);
//   const sizesRef = React.useRef<Record<string, { w: number; h: number }>>({});
//
//   const onMeasured = React.useCallback(
//     (id: CardKey, rect: { w: number; h: number }) => {
//       sizesRef.current[id] = rect;
//     },
//     [],
//   );
//
//   const onDragStart = (e: DragStartEvent) => {
//     setActiveId(e.active.id as CardKey);
//   };
//
//   const onDragEnd = (e: DragEndEvent) => {
//     const { active, over } = e;
//     setActiveId(null);
//
//     if (!over || active.id === over.id) return;
//
//     const oldIndex = order.indexOf(active.id as CardKey);
//     const newIndex = order.indexOf(over.id as CardKey);
//     if (oldIndex === -1 || newIndex === -1) return;
//
//     setOrder((arr) => arrayMove(arr, oldIndex, newIndex));
//   };
//
//   const renderCard = (key: CardKey, dragHandle?: React.ReactNode) => {
//     switch (key) {
//       case "business":
//         return (
//           <BusinessProfileCard
//             dragHandle={dragHandle}
//             isLoading={profile.isOrgLoading}
//             profileCompletion={profile.profileCompletion}
//             hasNiche={profile.hasNiche}
//             hasServices={profile.hasServices}
//             hasAudience={profile.hasAudience}
//             hasBrandStyle={profile.hasBrandStyle}
//             buttonLabel={profile.buttonLabel}
//             onOpenProfile={() => router.push("/organization")}
//           />
//         );
//
//       case "documents":
//         return <DocumentsCard dragHandle={dragHandle} />;
//
//       case "activity":
//         return (
//           <RecentActivityCard
//             dragHandle={dragHandle}
//             items={activity.items}
//             loading={activity.isLoading || activity.isFetching}
//             onOpenHistory={() => router.push("/activity")}
//             onOpenEntity={openEntity}
//           />
//         );
//
//       case "ai":
//         return <AiChatCard dragHandle={dragHandle} />;
//
//       case "today":
//         return (
//           <TodayTasksCard
//             tasks={today.tasks}
//             count={today.count}
//             isLoading={today.isLoading}
//             isFetching={today.isFetching}
//             onOpenTodo={() => router.push("/todo")}
//             dragHandle={dragHandle as any}
//           />
//         );
//
//       case "deadlines":
//         return (
//           <InvoiceDeadlinesCard
//             organizationId={organizationId}
//             minDays={1}
//             maxDays={2}
//             dragHandle={dragHandle as any}
//           />
//         );
//
//       case "plan":
//         return (
//           <PlanCard
//             currentPlan={currentPlanFromApi}
//             dragHandle={dragHandle}
//             onClick={() => router.push("/pricing")}
//           />
//         );
//
//       case "clientsShortcut":
//         return (
//           <ClientsShortcutCard
//             onClick={() => router.push("/clients")}
//             dragHandle={dragHandle}
//           />
//         );
//
//       case "invoicesShortcut":
//         return (
//           <InvoicesShortcutCard
//             onClick={() => router.push("/invoices")}
//             dragHandle={dragHandle}
//           />
//         );
//
//       case "quotesShortcut":
//         return (
//           <QuotesShortcutCard
//             onClick={() => router.push("/quotes")}
//             dragHandle={dragHandle}
//           />
//         );
//
//       case "actsShortcut":
//         return (
//           <ActsShortcutCard
//             onClick={() => router.push("/acts")}
//             dragHandle={dragHandle}
//           />
//         );
//
//       case "analyticsShortcut":
//         return (
//           <AnalyticsShortcutCard
//             onClick={() => router.push("/analytics")}
//             dragHandle={dragHandle}
//           />
//         );
//
//       default:
//         return null;
//     }
//   };
//
//   const activeSize = activeId ? sizesRef.current[activeId] : undefined;
//
//   const overlay = activeId ? (
//     <Box
//       sx={{
//         width: activeSize?.w ? `${activeSize.w}px` : "auto",
//         height: activeSize?.h ? `${activeSize.h}px` : "auto",
//         overflow: "hidden",
//         borderRadius: 3,
//         boxShadow: 10,
//         position: "relative",
//       }}
//     >
//       {/* сама картка */}
//       {renderCard(activeId, null)}
//
//       {/* ✅ блюр + назва в overlay теж */}
//       <Box
//         sx={{
//           position: "absolute",
//           inset: 0,
//           zIndex: 50,
//           display: "grid",
//           placeItems: "center",
//           pointerEvents: "none",
//           bgcolor: "rgba(255,255,255,0.35)",
//           backdropFilter: "blur(10px)",
//           WebkitBackdropFilter: "blur(10px)",
//         }}
//       >
//         <Typography
//           sx={{
//             fontWeight: 900,
//             letterSpacing: "-0.02em",
//             color: "#111827",
//             textAlign: "center",
//             px: 2,
//             fontSize: { xs: 16, sm: 18 },
//           }}
//         >
//           {getCardTitle(activeId)}
//         </Typography>
//       </Box>
//     </Box>
//   ) : null;
//
//   const MasonryLayout = (content: React.ReactNode) => (
//     <Box
//       sx={{
//         columnCount: {
//           xs: 1,
//           md: 2, // або 900px, 48rem тощо
//         },
//         columnGap: 3,
//         width: "100%",
//
//         "& > *": {
//           breakInside: "avoid",
//           marginBottom: 3, // аналог spacing={3}
//           display: "inline-block",
//           width: "100%",
//         },
//       }}
//     >
//       {content}
//     </Box>
//   );
//
//   const isDragMode = !!activeId;
//
//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         bgcolor: "#f3f4f6",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "flex-start",
//         py: 3,
//         px: { xs: 2, md: 3 },
//       }}
//     >
//       <Box sx={{ width: "100%", maxWidth: 1320 }}>
//         <HomeHeader firstName={(userData as any)?.firstName} />
//
//         {/* ✅ SSR-safe: до mounted без DnD */}
//         {!mounted ? (
//           MasonryLayout(
//             order.map((id) => (
//               <Box key={id} sx={{ width: "100%" }}>
//                 {renderCard(id, null)}
//               </Box>
//             )),
//           )
//         ) : (
//           <DndContext
//             sensors={sensors}
//             collisionDetection={closestCenter}
//             onDragStart={onDragStart}
//             onDragEnd={onDragEnd}
//             measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
//           >
//             <SortableContext items={order} strategy={rectSortingStrategy}>
//               {MasonryLayout(
//                 order.map((id) => (
//                   <SortableItem
//                     key={id}
//                     id={id}
//                     onMeasured={onMeasured}
//                     isDragMode={isDragMode}
//                     title={getCardTitle(id)}
//                   >
//                     {(dragHandle) => renderCard(id, dragHandle)}
//                   </SortableItem>
//                 )),
//               )}
//             </SortableContext>
//
//             <DragOverlay dropAnimation={null}>{overlay}</DragOverlay>
//           </DndContext>
//         )}
//       </Box>
//     </Box>
//   );
// }

"use client";

import * as React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useRouter } from "next/navigation";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useCurrentUser } from "@/hooksNew/useAppBootstrap";
import { useHomeProfile } from "@/components/Home/hooks/useHomeProfile";
import { useTodayTasks } from "@/components/Home/hooks/useTodayTasks";
import { useRecentActivity } from "@/components/Home/hooks/useRecentActivity";

import { HomeHeader } from "@/components/Home/components/HomeHeader";
import { BusinessProfileCard } from "@/components/Home/components/BusinessProfileCard";
import { DocumentsCard } from "@/components/Home/components/DocumentsCard";
import {
  ActsShortcutCard,
  AnalyticsShortcutCard,
  ClientsShortcutCard,
  InvoicesShortcutCard,
  QuotesShortcutCard,
} from "@/components/Home/components/FinanceShortcutsCards";
import { TodayTasksCard } from "./components/TodayTasksCard";
import { AiChatCard } from "@/components/Home/components/AiChatCard";
import { InvoiceDeadlinesCard } from "@/components/Home/components/InvoiceDeadlinesCard";
import { RecentActivityCard } from "@/components/Home/components/RecentActivityCard";
import { PlanCard, PlanId } from "@/components/Home/components/PlanCard";

const DEFAULT_ORDER = [
  "business",
  "documents",
  "activity",
  "ai",
  "today",
  "deadlines",
  "plan",
  "clientsShortcut",
  "invoicesShortcut",
  "quotesShortcut",
  "actsShortcut",
  "analyticsShortcut",
] as const;

type CardKey = (typeof DEFAULT_ORDER)[number];

const STORAGE_KEY = "home:cardsOrder:v1";

function sanitizeOrder(raw: unknown): CardKey[] {
  const allowed = new Set(DEFAULT_ORDER as readonly string[]);
  const arr = Array.isArray(raw) ? raw : [];
  const cleaned = arr.filter(
    (x) => typeof x === "string" && allowed.has(x),
  ) as CardKey[];

  for (const k of DEFAULT_ORDER) if (!cleaned.includes(k)) cleaned.push(k);
  return cleaned;
}

function loadOrderClient(): CardKey[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_ORDER];
    return sanitizeOrder(JSON.parse(raw));
  } catch {
    return [...DEFAULT_ORDER];
  }
}

function saveOrderClient(order: CardKey[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    // ignore
  }
}

function DragHandleButton({
  setActivatorNodeRef,
  attributes,
  listeners,
}: {
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  attributes: any;
  listeners: any;
}) {
  return (
    <Tooltip title="Перемістити">
      <IconButton
        size="small"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        sx={{
          width: 32,
          height: 32,
          color: "#6b7280",

          // ✅ iOS/Telegram WebView: щоб жест не перехоплювався як скрол/зум
          touchAction: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
          WebkitTouchCallout: "none",

          "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
        }}
      >
        <DragIndicatorIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

function getCardTitle(key: CardKey): string {
  switch (key) {
    case "business":
      return "Профіль бізнесу";
    case "documents":
      return "Документи";
    case "activity":
      return "Остання активність";
    case "ai":
      return "AI асистент";
    case "today":
      return "Завдання на сьогодні";
    case "deadlines":
      return "Дедлайни інвойсів";
    case "plan":
      return "Тариф";
    case "clientsShortcut":
      return "Клієнти";
    case "invoicesShortcut":
      return "Інвойси";
    case "quotesShortcut":
      return "Комерційні пропозиції";
    case "actsShortcut":
      return "Акти";
    case "analyticsShortcut":
      return "Аналітика";
    default:
      return "Картка";
  }
}

function SortableItem({
  id,
  children,
  onMeasured,
  isDragMode,
  title,
}: {
  id: CardKey;
  children: (dragHandle: React.ReactNode) => React.ReactNode;
  onMeasured: (id: CardKey, rect: { w: number; h: number }) => void;
  isDragMode: boolean;
  title: string;
}) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const measureRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0)
        onMeasured(id, { w: r.width, h: r.height });
    };

    measure();

    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [id, onMeasured]);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.15 : 1,
    width: "100%",
  };

  const dragHandle = (
    <DragHandleButton
      setActivatorNodeRef={setActivatorNodeRef}
      attributes={attributes}
      listeners={listeners}
    />
  );

  return (
    <Box ref={setNodeRef} style={style} sx={{ minWidth: 0, width: "100%" }}>
      <Box
        ref={measureRef}
        sx={{
          width: "100%",
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {children(dragHandle)}

        {isDragMode && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 50,
              display: "grid",
              placeItems: "center",
              pointerEvents: "none",
              bgcolor: "rgba(255,255,255,0.35)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <Typography
              sx={{
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "#111827",
                textAlign: "center",
                px: 2,
                fontSize: { xs: 16, sm: 18 },
              }}
            >
              {title}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function HomePage() {
  const router = useRouter();

  const { data: userData } = useCurrentUser();
  const currentUserId = (userData as any)?.id ?? null;

  const profile = useHomeProfile(currentUserId);
  const today = useTodayTasks(currentUserId);

  const organizationId = profile.organization?.id ?? null;
  const activity = useRecentActivity(organizationId, 3);

  const currentPlanFromApi: PlanId =
    ((userData as any)?.subscription?.planId as PlanId) ?? "FREE";

  const openEntity = (type: "INVOICE" | "ACT" | "QUOTE", id: string) => {
    if (type === "INVOICE") router.push(`/invoices/${id}`);
    if (type === "ACT") router.push(`/acts/${id}`);
    if (type === "QUOTE") router.push(`/quotes/${id}`);
  };

  const [mounted, setMounted] = React.useState(false);
  const [order, setOrder] = React.useState<CardKey[]>([...DEFAULT_ORDER]);

  React.useEffect(() => {
    setMounted(true);
    setOrder(loadOrderClient());
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    saveOrderClient(order);
  }, [order, mounted]);

  const [activeId, setActiveId] = React.useState<CardKey | null>(null);

  // ✅ Telegram/iOS інколи не викликає onDragEnd, а дає cancel/blur — скидаємо activeId
  React.useEffect(() => {
    const reset = () => setActiveId(null);

    window.addEventListener("blur", reset);

    const onVis = () => {
      if (document.hidden) reset();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 8 }, // ✅ long-press для моб
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sizesRef = React.useRef<Record<string, { w: number; h: number }>>({});

  const onMeasured = React.useCallback(
    (id: CardKey, rect: { w: number; h: number }) => {
      sizesRef.current[id] = rect;
    },
    [],
  );

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as CardKey);
  };

  const onDragCancel = () => {
    // ✅ must-have: прибирає "зависання"
    setActiveId(null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = order.indexOf(active.id as CardKey);
    const newIndex = order.indexOf(over.id as CardKey);
    if (oldIndex === -1 || newIndex === -1) return;

    setOrder((arr) => arrayMove(arr, oldIndex, newIndex));
  };

  const renderCard = (key: CardKey, dragHandle?: React.ReactNode) => {
    switch (key) {
      case "business":
        return (
          <BusinessProfileCard
            dragHandle={dragHandle}
            isLoading={profile.isOrgLoading}
            profileCompletion={profile.profileCompletion}
            hasNiche={profile.hasNiche}
            hasServices={profile.hasServices}
            hasAudience={profile.hasAudience}
            hasBrandStyle={profile.hasBrandStyle}
            buttonLabel={profile.buttonLabel}
            onOpenProfile={() => router.push("/organization")}
          />
        );

      case "documents":
        return <DocumentsCard dragHandle={dragHandle} />;

      case "activity":
        return (
          <RecentActivityCard
            dragHandle={dragHandle}
            items={activity.items}
            loading={activity.isLoading || activity.isFetching}
            onOpenHistory={() => router.push("/activity")}
            onOpenEntity={openEntity}
          />
        );

      case "ai":
        return <AiChatCard dragHandle={dragHandle} />;

      case "today":
        return (
          <TodayTasksCard
            tasks={today.tasks}
            count={today.count}
            isLoading={today.isLoading}
            isFetching={today.isFetching}
            onOpenTodo={() => router.push("/todo")}
            dragHandle={dragHandle as any}
          />
        );

      case "deadlines":
        return (
          <InvoiceDeadlinesCard
            organizationId={organizationId}
            minDays={1}
            maxDays={2}
            dragHandle={dragHandle as any}
          />
        );

      case "plan":
        return (
          <PlanCard
            currentPlan={currentPlanFromApi}
            dragHandle={dragHandle}
            onClick={() => router.push("/pricing")}
          />
        );

      case "clientsShortcut":
        return (
          <ClientsShortcutCard
            onClick={() => router.push("/clients")}
            dragHandle={dragHandle}
          />
        );

      case "invoicesShortcut":
        return (
          <InvoicesShortcutCard
            onClick={() => router.push("/invoices")}
            dragHandle={dragHandle}
          />
        );

      case "quotesShortcut":
        return (
          <QuotesShortcutCard
            onClick={() => router.push("/quotes")}
            dragHandle={dragHandle}
          />
        );

      case "actsShortcut":
        return (
          <ActsShortcutCard
            onClick={() => router.push("/acts")}
            dragHandle={dragHandle}
          />
        );

      case "analyticsShortcut":
        return (
          <AnalyticsShortcutCard
            onClick={() => router.push("/analytics")}
            dragHandle={dragHandle}
          />
        );

      default:
        return null;
    }
  };

  const activeSize = activeId ? sizesRef.current[activeId] : undefined;

  const overlay = activeId ? (
    <Box
      sx={{
        width: activeSize?.w ? `${activeSize.w}px` : "auto",
        height: activeSize?.h ? `${activeSize.h}px` : "auto",
        overflow: "hidden",
        borderRadius: 3,
        boxShadow: 10,
        position: "relative",
      }}
    >
      {renderCard(activeId, null)}

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 50,
          display: "grid",
          placeItems: "center",
          pointerEvents: "none",
          bgcolor: "rgba(255,255,255,0.35)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <Typography
          sx={{
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: "#111827",
            textAlign: "center",
            px: 2,
            fontSize: { xs: 16, sm: 18 },
          }}
        >
          {getCardTitle(activeId)}
        </Typography>
      </Box>
    </Box>
  ) : null;

  const isDragMode = !!activeId;

  const GridLayout = (content: React.ReactNode) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 3,
        width: "100%",
      }}
    >
      {content}
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f3f4f6",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        py: 3,
        px: { xs: 2, md: 3 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1320 }}>
        <HomeHeader firstName={(userData as any)?.firstName} />

        {!mounted ? (
          GridLayout(
            order.map((id) => (
              <Box key={id} sx={{ width: "100%" }}>
                {renderCard(id, null)}
              </Box>
            )),
          )
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
          >
            <SortableContext items={order} strategy={rectSortingStrategy}>
              {GridLayout(
                order.map((id) => (
                  <SortableItem
                    key={id}
                    id={id}
                    onMeasured={onMeasured}
                    isDragMode={isDragMode}
                    title={getCardTitle(id)}
                  >
                    {(dragHandle) => renderCard(id, dragHandle)}
                  </SortableItem>
                )),
              )}
            </SortableContext>

            <DragOverlay dropAnimation={null}>{overlay}</DragOverlay>
          </DndContext>
        )}
      </Box>
    </Box>
  );
}
