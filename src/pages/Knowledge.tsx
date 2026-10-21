import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Hotspots } from '../components/Hotspots';
import { Photo } from '../components/Photo';
import { Icon } from '../components/Icon';
import { articleById, articleGroups, articles, type Block } from '../data/knowledge';
import { designStyles, styleById } from '../data/styles';
import { productById } from '../data/catalog';
import { RevealImage } from '../motion/Reveal';
import { ScrollProgress } from '../motion/ScrollProgress';
import { getLenis, useSmoothScroll } from '../motion/smoothScroll';
import s from './Knowledge.module.css';

export function Knowledge() {
  const [params, setParams] = useSearchParams();
  const article = articleById(params.get('a') ?? '') ?? articles[0];
  // On desktop the sheet is the scroller; on phones the window is.
  const [scroller, setScroller] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const main = document.getElementById('main');
    setScroller(main && getComputedStyle(main).overflowY === 'auto' ? main : null);
  }, []);
  useSmoothScroll(() => document.getElementById('main'));
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set([article.group]));

  useEffect(() => {
    setOpenGroups((g) => new Set(g).add(article.group));
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else document.getElementById('main')?.scrollTo({ top: 0 });
  }, [article.id, article.group]);

  const toggle = (g: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });

  return (
    <AppShell title="Knowledge base">
      <div className={s.layout}>
        <nav className={s.toc} aria-label="Topics">
          {articleGroups.map((g) => {
            const open = openGroups.has(g);
            const id = `grp-${g.replace(/\W+/g, '-')}`;
            return (
              <div key={g} className={s.group}>
                <button className={s.groupBtn} aria-expanded={open} aria-controls={id} onClick={() => toggle(g)}>
                  {g}
                  <span className={open ? s.chevOpen : s.chev}><Icon name="down" size={16} /></span>
                </button>
                <ul id={id} hidden={!open} className={s.groupList}>
                  {articles.filter((a) => a.group === g).map((a) => (
                    <li key={a.id}>
                      <button
                        className={`${s.topic} ${a.id === article.id ? s.topicOn : ''}`}
                        aria-current={a.id === article.id ? 'page' : undefined}
                        onClick={() => setParams({ a: a.id })}
                      >
                        {a.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {scroller ? <ScrollProgress container={{ current: scroller }} /> : <ScrollProgress />}
        <motion.article
          className={s.article}
          key={article.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className={s.crumb}>
            <span>Knowledge base</span>
            <Icon name="chevron" size={14} />
            <span>{article.group}</span>
          </p>
          <h1 className={`display ${s.title}`}>{article.title}</h1>
          <p className={s.summary}>{article.summary}</p>
          {article.blocks.map((b, i) => <BlockView key={i} block={b} />)}
          <div className={s.next}>
            <Link to="/planner" className="btn btn-primary">Try it in the planner</Link>
            <Link to="/catalog" className="btn">Browse pieces</Link>
          </div>
        </motion.article>
      </div>
    </AppShell>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'text':
      return (
        <section className={s.section}>
          {block.heading && <h2 className={s.h2}>{block.heading}</h2>}
          {block.body.map((p, i) => <p key={i} className={s.prose}>{p}</p>)}
        </section>
      );
    case 'hotspots':
      return (
        <section className={s.section}>
          <h2 className={s.h2}>{block.heading}</h2>
          <Hotspots photo={block.photo} alt={block.alt} pins={block.pins} />
        </section>
      );
    case 'rules':
      return (
        <section className={s.section}>
          <h2 className={s.h2}>{block.heading}</h2>
          <table className={s.rules}>
            <thead><tr><th scope="col">Between</th><th scope="col" className={s.right}>Allow</th><th scope="col">Why</th></tr></thead>
            <tbody>
              {block.rows.map(([a, b, c]) => (
                <tr key={a}><td>{a}</td><td className={s.right}><strong>{b}</strong></td><td className={s.muted}>{c}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      );
    case 'matrix':
      return <StyleMatrix />;
    case 'style':
      return <StyleBlock id={block.styleId} />;
  }
}

function Swatches({ palette }: { palette: { name: string; hex: string }[] }) {
  return (
    <ul className={s.swatches}>
      {palette.map((c) => (
        <li key={c.hex}><span className={s.chip} style={{ background: c.hex }} />{c.name}</li>
      ))}
    </ul>
  );
}

function StyleMatrix() {
  return (
    <section className={s.section}>
      <div className={s.matrixScroll}>
        <table className={s.matrix}>
          <thead>
            <tr>
              <td />
              {designStyles.map((st) => (
                <th key={st.id} scope="col"><Link to={`/knowledge?a=${st.id}`}>{st.name}</Link></th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row">Palette</th>{designStyles.map((st) => <td key={st.id}><Swatches palette={st.palette} /></td>)}</tr>
            <tr><th scope="row">Lighting</th>{designStyles.map((st) => <td key={st.id}>{st.lighting}</td>)}</tr>
            <tr><th scope="row">Materials</th>{designStyles.map((st) => <td key={st.id}>{st.materials.join(', ')}</td>)}</tr>
            <tr><th scope="row">Avoid</th>{designStyles.map((st) => <td key={st.id}>{st.avoid}</td>)}</tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StyleBlock({ id }: { id: Parameters<typeof styleById>[0] }) {
  const st = styleById(id);
  return (
    <>
      <section className={s.section}>
        <h2 className={s.h2}>Palette, light and materials</h2>
        <div className={s.styleFacts}>
          <div><h3 className={s.h3}>Palette</h3><Swatches palette={st.palette} /></div>
          <div><h3 className={s.h3}>Lighting</h3><p>{st.lighting}</p></div>
          <div><h3 className={s.h3}>Materials</h3><p>{st.materials.join(', ')}</p></div>
          <div><h3 className={s.h3}>Avoid</h3><p>{st.avoid}</p></div>
        </div>
      </section>
      <section className={s.section}>
        <h2 className={s.h2}>Rooms in this style</h2>
        <ul className={s.inspo}>
          {st.inspiration.map((it) => (
            <li key={it.photo} className={s.inspoCard} tabIndex={0}>
              <RevealImage className={s.inspoReveal}><Photo id={it.photo} alt={it.caption} w={640} h={800} className={s.inspoImg} /></RevealImage>
              <div className={s.inspoReveal}>
                <p className={s.inspoTitle}>{it.caption}</p>
                <ul className={s.inspoPrinciples}>{it.principles.map((p) => <li key={p}>{p}</li>)}</ul>
                <p className={s.inspoProducts}>
                  {it.products.map((pid) => {
                    const p = productById(pid)!;
                    return <Link key={pid} to={`/catalog?p=${pid}`}>{p.name}</Link>;
                  })}
                </p>
              </div>
              <p className={s.inspoCaption}>{it.caption}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
