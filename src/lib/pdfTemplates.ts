import { Audit } from '../types';
import { formatFullDate } from './format';
import { formatSignedTime, ORG_TIMEZONE_LABEL } from '../theme/tokens';

const FONT_LINK = `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800&display=swap" rel="stylesheet">`;

const BASE_STYLE = `
  body { font-family: 'Archivo', system-ui, sans-serif; color: #201e1d; background: #f3f2f2; margin: 0; padding: 32px; }
  h1 { font-weight: 800; font-size: 26px; letter-spacing: -0.02em; margin: 0 0 4px; }
  .kicker { font-weight: 600; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #7d7979; margin-bottom: 8px; }
  .rule { height: 2px; background: #201e1d; margin: 14px 0; }
  .grid { display: flex; gap: 24px; margin: 18px 0; }
  .stat-label { font-weight: 600; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: #7d7979; }
  .stat-value { font-weight: 800; font-size: 32px; margin-top: 6px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
  th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #d7d3d3; }
  th { font-weight: 600; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: #7d7979; border-bottom: 2px solid #201e1d; }
`;

export function certificateHtml(audit: Audit): string {
  const gapValue = audit.awardedLevel - audit.expectedLevel;
  const gapText = gapValue > 0 ? `+${gapValue}` : String(gapValue);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
${FONT_LINK}
<style>${BASE_STYLE}</style>
</head>
<body>
  <div class="kicker">Competency assessment certificate</div>
  <h1>${audit.candidateName}</h1>
  <div class="kicker" style="margin-top:0">${audit.processName}</div>
  <div class="rule"></div>

  <div class="grid">
    <div>
      <div class="stat-label">K&amp;P score</div>
      <div class="stat-value">${audit.kpScore}%</div>
    </div>
    <div>
      <div class="stat-label">TS score</div>
      <div class="stat-value">${audit.tsScore}%</div>
    </div>
    <div>
      <div class="stat-label">Awarded level</div>
      <div class="stat-value">${audit.awardedLevel}</div>
    </div>
    <div>
      <div class="stat-label">Expected level</div>
      <div class="stat-value">${audit.expectedLevel}</div>
    </div>
    <div>
      <div class="stat-label">Gap</div>
      <div class="stat-value" style="color:${gapValue < 0 ? '#ec3013' : '#201e1d'}">${gapText}</div>
    </div>
  </div>

  <div class="rule"></div>
  <table>
    <tr><th>Auditor</th><td>${audit.auditorName}</td></tr>
    <tr><th>Started</th><td>${formatFullDate(audit.createdAt)}</td></tr>
    <tr><th>Status</th><td>${audit.status.replace('_', ' ')}</td></tr>
    <tr><th>Signed off</th><td>${
      audit.signedAt ? `${formatSignedTime(new Date(audit.signedAt))}, ${formatFullDate(audit.signedAt)} (${ORG_TIMEZONE_LABEL})` : 'Not yet signed'
    }</td></tr>
  </table>

  <div class="rule"></div>
  <div class="kicker">Audit trail</div>
  <table>
    <tr><th>Time</th><th>Event</th><th>Who</th></tr>
    ${audit.trail
      .map(
        (t) =>
          `<tr><td>${formatSignedTime(new Date(t.ts))}</td><td>${t.what}</td><td>${t.who}</td></tr>`
      )
      .join('')}
  </table>
</body>
</html>`;
}

export function reportHtml(audits: Audit[]): string {
  const rows = audits
    .map(
      (a) => `<tr>
        <td>${a.candidateName}</td>
        <td>${a.processName}</td>
        <td>${a.status.replace('_', ' ')}</td>
        <td>${a.kpScore}%</td>
        <td>${a.tsScore}%</td>
        <td>${a.awardedLevel}</td>
        <td>${a.expectedLevel}</td>
        <td>${a.signedAt ? `${formatFullDate(a.signedAt)} ${formatSignedTime(new Date(a.signedAt))}` : '—'}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
${FONT_LINK}
<style>${BASE_STYLE}</style>
</head>
<body>
  <div class="kicker">Competency assessment</div>
  <h1>Audit history</h1>
  <div class="kicker" style="margin-top:0">${audits.length} audits · generated ${formatFullDate(Date.now())}</div>
  <div class="rule"></div>
  <table>
    <tr><th>Candidate</th><th>Task</th><th>Status</th><th>K&amp;P</th><th>TS</th><th>Awarded</th><th>Expected</th><th>Signed (${ORG_TIMEZONE_LABEL})</th></tr>
    ${rows}
  </table>
</body>
</html>`;
}
