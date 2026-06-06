import { useStore } from "../context/StoreContext";

export default function Toast() {
  const { state } = useStore();
  if (!state.toast) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white px-5 py-3 rounded-sm shadow-2xl border border-neutral-700 text-sm font-medium animate-fadeInUp flex items-center gap-2">
      <svg className="w-4 h-4 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      {state.toast}
    </div>
  );
}
