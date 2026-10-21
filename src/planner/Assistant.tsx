import { Link } from 'react-router-dom';
import { formatPrice, productById } from '../data/catalog';
import { styleById } from '../data/styles';
import { Icon } from '../components/Icon';
import { Photo } from '../components/Photo';
import { checksFor, planSummary, type HistoryAction, type Check, type Plan } from './model';
import s from './Planner.module.css';

interface Props {
  plan: Plan;
  selected: string | null;
  onSelect: (uid: string | null) => void;
  dispatch: React.Dispatch<HistoryAction>;
}

/** Right dock: rules and advice for whatever is selected, or the whole room when nothing is. */
export function Assistant({ plan, selected, onSelect, dispatch }: Props) {
  const item = plan.items.find((i) => i.uid === selected);
  const style = styleById(plan.style);

  if (item) {
    const p = productById(item.productId)!;
    const checks = checksFor(plan, item);
    const fits = p.styles.includes(plan.style);
    return (
      <aside className={s.assistant} aria-label="Assistant" aria-live="polite">
        <div className={s.asHead}>
          <Photo id={p.photo} alt="" w={96} h={96} className={s.asThumb} />
          <div>
            <h2 className={s.asTitle}>{p.name}</h2>
            <p className={s.asMeta}>{p.w} × {p.d} × {p.h} cm · {formatPrice(p.price)}</p>
          </div>
        </div>
        <div className={s.asActions}>
          <button className="btn" onClick={() => dispatch({ type: 'rotate', uid: item.uid })}><Icon name="rotate" size={16} /> Rotate</button>
          <button className="btn" onClick={() => { dispatch({ type: 'remove', uid: item.uid }); onSelect(null); }}><Icon name="trash" size={16} /> Remove</button>
        </div>

        <h3 className={s.asSection}>Checks</h3>
        <CheckList checks={checks} />

        <h3 className={s.asSection}>Style</h3>
        <p className={s.asNote}>
          <span className={`pill ${fits ? 'pill-pass' : 'pill-warn'}`}>{fits ? `Fits ${style.name}` : `Not a ${style.name} piece`}</span>
        </p>
        {!fits && <p className={s.asNote}>{style.name} rooms favour {style.materials.slice(0, 2).join(' and ').toLowerCase()}. One outside piece can work as the accent.</p>}

        <h3 className={s.asSection}>Pairs well with</h3>
        <ul className={s.asPairs}>
          {p.pairs.map((pid) => {
            const pp = productById(pid)!;
            return (
              <li key={pid}>
                <span>{pp.name}<small>{pp.w} × {pp.d} cm</small></span>
                <button className="btn btn-ghost btn-icon" onClick={() => dispatch({ type: 'add', productId: pid })} aria-label={`Add ${pp.name}`}><Icon name="plus" size={16} /></button>
              </li>
            );
          })}
        </ul>
      </aside>
    );
  }

  const sum = planSummary(plan);
  return (
    <aside className={s.assistant} aria-label="Assistant" aria-live="polite">
      <h2 className={s.asTitle}>{plan.name}</h2>
      <p className={s.asMeta}>{plan.roomW} × {plan.roomD} cm · {plan.items.length} pieces · {formatPrice(sum.cost)}</p>

      <div className={s.asScore}>
        <span className={s.asScoreFig}>{sum.passed}<small> of {sum.checks}</small></span>
        <span>checks met</span>
      </div>

      {plan.items.length === 0 ? (
        <p className={s.asNote}>The room is empty. Drag a sofa in from the left to start; the checks appear as you place things.</p>
      ) : sum.problems.length === 0 ? (
        <p className={s.asNote}>Every piece clears its rules. Try evening light to see which corners need a lamp.</p>
      ) : (
        <>
          <h3 className={s.asSection}>Needs attention</h3>
          <ul className={s.asProblems}>
            {sum.problems.map((c, i) => (
              <li key={i}>
                <button onClick={() => onSelect(c.item.uid)}>
                  <span className={c.state === 'fail' ? s.bad : s.warnTxt}><Icon name="alert" size={16} /></span>
                  <span>{productById(c.item.productId)!.name.split(',')[0]}<small>{c.label}: {c.value} (want {c.target})</small></span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h3 className={s.asSection}>{style.name} in this room</h3>
      <ul className={s.asSwatches}>
        {style.palette.map((c) => <li key={c.hex}><span style={{ background: c.hex }} />{c.name}</li>)}
      </ul>
      <p className={s.asNote}>{style.lighting}</p>
      <Link to={`/knowledge?a=${plan.style}`} className={s.asLink}>Read the {style.name} guide <Icon name="chevron" size={14} /></Link>
    </aside>
  );
}

function CheckList({ checks }: { checks: Check[] }) {
  return (
    <ul className={s.checks}>
      {checks.map((c) => (
        <li key={c.id}>
          <span className={c.state === 'pass' ? s.ok : c.state === 'warn' ? s.warnTxt : s.bad}>
            <Icon name={c.state === 'pass' ? 'check' : 'alert'} size={16} />
          </span>
          <span>{c.label}<small>{c.target}</small></span>
          <strong>{c.value}</strong>
        </li>
      ))}
    </ul>
  );
}
