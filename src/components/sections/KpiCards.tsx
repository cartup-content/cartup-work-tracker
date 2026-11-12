import { memo, useMemo } from 'react';
import { dashboardConfig, C } from '../../config/dashboard.config';
import { useApp } from '../../hooks/AppContext';
import { summarize } from '../../utils/aggregate';
import { fmtCompact, fmtNum, fmtPct, ratioPct, NA } from '../../utils/format';
import { KpiCard } from '../ui';
import { headlineSub, headlineTitle } from './KpiSections';

/** The eight headline tiles. Clicking a tile drills into the matching Work Sheet records. */
export const KpiCards = memo(function KpiCards() {
  const { dataset, roleFiltered, roleRecords, kpi, setDrill, navigate } = useApp();
  // Total Work / Completed / Pending / Total SKU: jobs in the current filters, by request date
  // (Timestamp) — with an Employee chosen, their assigned jobs.
  const s = useMemo(() => summarize(dataset, roleFiltered(C.uploadedBy)), [dataset, roleFiltered]);
  // Uploaded SKU / QC Approved / QC Rejected: finished work only, dated by when it was actually
  // uploaded / QC'd (roleRecords — same rows as "Uploads by person" / "QC by person" and the
  // Daily / Monthly Performance report), not by the request date above. Otherwise, with a date
  // filter and an employee selected, this tile could show fewer uploads than the person actually
  // finished that day (e.g. jobs requested earlier but uploaded on the filtered day).
  const up = useMemo(() => summarize(dataset, roleRecords(C.uploadedBy)), [dataset, roleRecords]);
  const q = useMemo(() => summarize(dataset, roleRecords(C.qcBy)), [dataset, roleRecords]);
  // Share of the SKU that was *requested* on these same (finished, correctly dated) rows — not
  // s.totalSku, which can come from a different set of rows once an Employee + Date filter are
  // both active (e.g. a job requested earlier in the week but uploaded on the filtered day).
  const uploadOfTotal = up.uploadedSku !== null && up.totalSku !== null ? ratioPct(up.uploadedSku, up.totalSku) : null;
  const g = dashboardConfig.statusGroups;
  const drillStatus = (label: string, values: string[]) =>
    dataset.has(C.status) ? () => setDrill({ label: `${label} (${C.status}: ${values.join(', ')})`, column: C.status, op: 'in', values }, 'work') : undefined;
  const drillGt0 = (column: string) => (dataset.has(column) ? () => setDrill({ label: `${column} > 0`, column, op: 'gt0' }, 'work') : undefined);

  return (
    <div className="grid grid-kpi">
      <KpiCard
        label="Total Work"
        value={fmtCompact(s.totalWork)}
        sub={<>jobs in current filters</>}
        color="var(--series-1)"
        onClick={() => setDrill(null, 'work')}
        title={`${fmtNum(s.totalWork)} jobs`}
      />
      <KpiCard
        label="Completed"
        value={fmtCompact(s.completed)}
        sub={s.completed === null ? `"${C.status}" column missing` : <><b>{fmtPct(ratioPct(s.completed, s.totalWork))}</b> of jobs · {g.completed.join(', ')}</>}
        color="var(--good)"
        onClick={drillStatus('Completed', g.completed)}
      />
      <KpiCard
        label="Pending"
        value={fmtCompact(s.pending)}
        sub={s.pending === null ? `"${C.status}" column missing` : <>{g.pending.join(' + ')}</>}
        color="var(--series-4)"
        onClick={drillStatus('Pending', g.pending)}
      />
      <KpiCard label="Total SKU" value={fmtCompact(s.totalSku)} sub={s.totalSku === null ? `"${C.skuCount}" missing` : C.skuCount} color="var(--series-7)" onClick={() => navigate('work')} title={fmtNum(s.totalSku)} />
      <KpiCard
        label="Uploaded SKU"
        value={fmtCompact(up.uploadedSku)}
        sub={up.uploadedSku === null ? `"${C.uploadedSku}" missing` : <><b>{fmtPct(uploadOfTotal)}</b> of total SKU · {fmtCompact(up.rejectedSku)} rejected</>}
        color="var(--series-3)"
        onClick={drillGt0(C.uploadedSku)}
        title={fmtNum(up.uploadedSku)}
      />
      <KpiCard
        label="QC Approved"
        value={fmtCompact(q.approvedQc)}
        sub={q.approvedQc === null ? `"${C.approvedQc}" missing` : <>Approval rate <b>{fmtPct(q.qcApprovalRate)}</b></>}
        color="var(--series-7)"
        onClick={drillGt0(C.approvedQc)}
        title={fmtNum(q.approvedQc)}
      />
      <KpiCard
        label="QC Rejected"
        value={fmtCompact(q.rejectedQc)}
        sub={q.rejectedQc === null ? `"${C.rejectedQc}" missing` : <>{fmtPct(q.qcApprovalRate === null ? null : 100 - q.qcApprovalRate)} of QC’d SKU</>}
        color="var(--bad)"
        onClick={drillGt0(C.rejectedQc)}
        title={fmtNum(q.rejectedQc)}
      />
      <KpiCard
        label="KPI Achievement %"
        value={kpi?.headlinePct != null ? fmtPct(kpi.headlinePct) : NA}
        sub={headlineSub(kpi)}
        color="var(--series-2)"
        onClick={() => navigate('kpi')}
        title={headlineTitle(kpi) || 'Open KPI & Target'}
      />
    </div>
  );
});
