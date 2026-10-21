import { StrictMode, useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import './styles/global.css';
import { Home } from './pages/Home';
import { Knowledge } from './pages/Knowledge';
import { Catalog } from './pages/Catalog';
import { Planner } from './pages/Planner';

/**
 * Route changes cross-fade with a short rise. The planner arrives without the rise:
 * people go there to work, so it should feel immediate.
 */
function AnimatedRoutes() {
  const location = useLocation();
  const toPlanner = location.pathname === '/planner';
  // Catalog and Knowledge base share the app shell: switching between them keeps the shell
  // still and only the sheet content fades (see AppShell), so the sidebar highlight can slide.
  const key = ['/catalog', '/knowledge'].includes(location.pathname) ? 'app' : location.pathname;

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={key}
        initial={{ opacity: 0, y: toPlanner ? 0 : 14 }}
        animate={{ opacity: 1, y: 0, transition: { duration: toPlanner ? 0.2 : 0.55, ease: [0.16, 1, 0.3, 1] } }}
        exit={{ opacity: 0, transition: { duration: 0.18 } }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
);
