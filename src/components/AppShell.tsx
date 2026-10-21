import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Icon, type IconName } from './Icon';
import { Wordmark } from './Mark';
import s from './AppShell.module.css';

const nav: { to: string; label: string; icon: IconName }[] = [
  { to: '/planner', label: 'Planner', icon: 'plan' },
  { to: '/catalog', label: 'Catalog', icon: 'grid' },
  { to: '/knowledge', label: 'Knowledge base', icon: 'book' },
];

/** Framed-sheet shell: a tinted L-frame (sidebar + 48px top bar) around a white sheet. */
export function AppShell({ children, title }: { children: React.ReactNode; title: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/catalog?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className={s.frame}>
      <aside className={`${s.sidebar} ${menuOpen ? s.sidebarOpen : ''}`} aria-label="Main">
        <div className={s.brandRow}>
          <NavLink to="/" className={s.brand} aria-label="Roomwright home">
            <Wordmark />
          </NavLink>
          <button className={`btn btn-ghost btn-icon ${s.closeMenu}`} onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <Icon name="close" />
          </button>
        </div>
        <form className={s.menuSearch} role="search" onSubmit={submit}>
          <Icon name="search" size={16} />
          <label htmlFor="menu-search" className="visually-hidden">Search the catalog</label>
          <input id="menu-search" type="search" placeholder="Search sofas, lamps, oak…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </form>
        <div className={s.scope}>
          <span className={s.scopeLabel}>Home</span>
          <span className={s.scopeName}>My flat</span>
        </div>
        <nav>
          <ul className={s.navList}>
            {nav.map((n, i) => (
              <motion.li
                key={n.to}
                initial={false}
                animate={menuOpen ? { opacity: [0, 1], x: [-12, 0] } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: menuOpen ? 0.08 + i * 0.05 : 0 }}
              >
                <NavLink to={n.to} className={({ isActive }) => `${s.navItem} ${isActive ? s.navActive : ''}`}>
                  {({ isActive }) => (
                    <>
                      {isActive && <motion.span layoutId="shell-nav-pill" className={s.navPill} transition={{ type: 'spring', stiffness: 420, damping: 38 }} />}
                      <span className={s.navInner}><Icon name={n.icon} size={16} />{n.label}</span>
                    </>
                  )}
                </NavLink>
              </motion.li>
            ))}
          </ul>
        </nav>
        <div className={s.sidebarFoot}>
          <NavLink to="/knowledge?a=clearances" className={s.navItem}>
            <Icon name="help" size={16} />
            How the checks work
          </NavLink>
        </div>
      </aside>
      {menuOpen && <div className={s.scrim} onClick={() => setMenuOpen(false)} aria-hidden="true" />}

      <header className={s.topbar}>
        <button className={`btn btn-ghost btn-icon ${s.menuBtn}`} onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
          <Icon name="menu" />
        </button>
        <span className={s.mobileTitle}>{title}</span>
        <form className={s.search} role="search" onSubmit={submit}>
          <Icon name="search" size={16} />
          <label htmlFor="global-search" className="visually-hidden">Search the catalog</label>
          <input
            id="global-search"
            type="search"
            placeholder="Search sofas, lamps, oak…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className={s.kbd}>/</kbd>
        </form>
        <NavLink to="/planner" className={`btn btn-primary ${s.topAction}`}>Open planner</NavLink>
      </header>

      <main className={s.sheet} id="main">
        <motion.div
          key={location.pathname}
          className={s.sheetInner}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
