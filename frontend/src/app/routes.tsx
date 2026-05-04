import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { MLAList } from "./pages/MLAList";
import { MLADetail } from "./pages/MLADetail";
import { Rankings } from "./pages/Rankings";
import { Promises } from "./pages/Promises";
import { Budget } from "./pages/Budget";
import { Projects } from "./pages/Projects";
import { News } from "./pages/News";
import { Reports } from "./pages/Reports";
import { Compare } from "./pages/Compare";
import { SpeakUp } from "./pages/SpeakUp";
import { AIChat } from "./pages/AIChat";
import { TaxInArea } from "./pages/TaxInArea";
import { DataSources } from "./pages/DataSources";
import { Attendance } from "./pages/Attendance";
import { Assets } from "./pages/Assets";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
      <div className="text-5xl mb-4">404</div>
      <p className="text-lg font-medium">Page not found</p>
      <a href="/" className="mt-3 text-amber-600 hover:underline text-sm">← Back to Dashboard</a>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "mlas", Component: MLAList },
      { path: "mlas/:id", Component: MLADetail },
      { path: "rankings", Component: Rankings },
      { path: "promises", Component: Promises },
      { path: "budget", Component: Budget },
      { path: "projects", Component: Projects },
      { path: "news", Component: News },
      { path: "reports", Component: Reports },
      { path: "compare", Component: Compare },
      { path: "speak-up", Component: SpeakUp },
      { path: "ai-chat", Component: AIChat },
      { path: "tax-area", Component: TaxInArea },
      { path: "data-sources", Component: DataSources },
      { path: "attendance", Component: Attendance },
      { path: "assets", Component: Assets },
      { path: "*", Component: NotFound },
    ],
  },
]);