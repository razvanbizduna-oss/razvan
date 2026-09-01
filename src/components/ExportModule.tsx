// ── ExportModule.tsx ──────────────────────────────────────────
// Adaugă acest fișier în proiectul tău și importă ExportButton oriunde ai nevoie.
// Folosește SheetJS (xlsx) — instalează cu: npm install xlsx
//
// INTEGRARE RAPIDĂ:
//   1. npm install xlsx
//   2. Copiază acest fișier în src/
//   3. În MemberDashboard.tsx, importă ExportButton și adaugă-l în fiecare tab
//   4. Vezi secțiunea "Cum integrezi în codul tău existent" de la sfârșitul fișierului

import * as XLSX from "xlsx";
import React, { useState } from "react";

// ── Tipuri ─────────────────────────────────────────────────────
interface ExportColumn {
  key: string;
  label: string;
  format?: (val: unknown) => string | number;
}

interface ExportSheet {
  name: string;         // Numele tab-ului în Excel
  data: Record<string, unknown>[];
  columns: ExportColumn[];
}

interface ExportConfig {
  fileName: string;
  sheets: ExportSheet[];
}

// ── Funcție principală de export ───────────────────────────────
function exportToExcel(config: ExportConfig) {
  const wb = XLSX.utils.book_new();

  config.sheets.forEach((sheet) => {
    // Construiește rândurile
    const rows = sheet.data.map((item) => {
      const row: Record<string, string | number> = {};
      sheet.columns.forEach((col) => {
        const val = item[col.key];
        row[col.label] = col.format
          ? col.format(val)
          : val == null || val === ""
          ? "—"
          : String(val);
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows, {
      header: sheet.columns.map((c) => c.label),
    });

    // Lățimi coloane automate (minim 12, maxim 40)
    const colWidths = sheet.columns.map((col) => {
      const maxLen = Math.max(
        col.label.length,
        ...sheet.data.map((item) => {
          const val = col.format ? col.format(item[col.key]) : item[col.key];
          return String(val ?? "").length;
        })
      );
      return { wch: Math.min(40, Math.max(12, maxLen + 2)) };
    });
    ws["!cols"] = colWidths;

    // Stil header (bold, fundal albastru închis)
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellAddr]) continue;
      ws[cellAddr].s = {
        font: { bold: true, color: { rgb: "FFFFFF" }, name: "Arial", sz: 10 },
        fill: { fgColor: { rgb: "1E3A5F" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: false },
        border: {
          bottom: { style: "thin", color: { rgb: "3B82F6" } },
        },
      };
    }

    // Stil rânduri de date (zebra striping)
    for (let R = 1; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddr]) continue;
        ws[cellAddr].s = {
          font: { name: "Arial", sz: 10, color: { rgb: "1E293B" } },
          fill: {
            fgColor: { rgb: R % 2 === 0 ? "F8FAFC" : "FFFFFF" },
          },
          alignment: { vertical: "center" },
          border: {
            bottom: { style: "hair", color: { rgb: "E2E8F0" } },
          },
        };
      }
    }

    // Freeze prima linie (header)
    ws["!freeze"] = { xSplit: 0, ySplit: 1 };

    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });

  // Adaugă foaia "Info export" cu metadata
  const infoData = [
    { Câmp: "Generat la", Valoare: new Date().toLocaleString("ro-RO") },
    { Câmp: "Club", Valoare: "Interact Cismigiu" },
    { Câmp: "Fișier", Valoare: config.fileName },
    {
      Câmp: "Total înregistrări",
      Valoare: config.sheets
        .map((s) => `${s.name}: ${s.data.length}`)
        .join(", "),
    },
  ];
  const wsInfo = XLSX.utils.json_to_sheet(infoData);
  wsInfo["!cols"] = [{ wch: 25 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsInfo, "Info export");

  // Scrie fișierul
  XLSX.writeFile(wb, `${config.fileName}.xlsx`, { bookSST: false, type: "binary" });
}

// ── Configurații predefinite per tab ──────────────────────────

// Coloane pentru dots (transformă array DotState în text lizibil)
const dotsToText = (dots: unknown): string => {
  if (!Array.isArray(dots)) return "—";
  const map: Record<number, string> = { 0: "○", 1: "✓", 2: "~", 3: "✗" };
  return (dots as number[]).map((d) => map[d] ?? "○").join(" ");
};

const dotsSummary = (dots: unknown): string => {
  if (!Array.isArray(dots)) return "—";
  const arr = dots as number[];
  const prezent = arr.filter((d) => d === 1).length;
  const justif = arr.filter((d) => d === 2).length;
  const absent = arr.filter((d) => d === 3).length;
  const total = arr.filter((d) => d !== 0).length;
  if (total === 0) return "Fără date";
  return `P:${prezent} J:${justif} A:${absent} / ${total}`;
};

export const buildMembersExport = (members: unknown[]): ExportConfig => ({
  fileName: `Interact_Cismigiu_Membri_${new Date().toISOString().slice(0, 10)}`,
  sheets: [
    {
      name: "Membri",
      data: members as Record<string, unknown>[],
      columns: [
        { key: "name", label: "Nume complet" },
        { key: "role", label: "Funcție" },
        { key: "presence", label: "Prezență curentă" },
        { key: "activity", label: "Activitate curentă" },
        { key: "presenceDots", label: "Istoric prezență (15)", format: dotsToText },
        { key: "presenceDots", label: "Sumar prezență", format: dotsSummary },
        { key: "activityDots", label: "Istoric activitate (15)", format: dotsToText },
        { key: "phone", label: "Telefon" },
        { key: "email", label: "Email" },
        { key: "observations", label: "Observații" },
      ],
    },
  ],
});

export const buildAspirantsExport = (aspirants: unknown[]): ExportConfig => ({
  fileName: `Interact_Cismigiu_Aspiranti_${new Date().toISOString().slice(0, 10)}`,
  sheets: [
    {
      name: "Aspiranți",
      data: aspirants as Record<string, unknown>[],
      columns: [
        { key: "name", label: "Nume complet" },
        { key: "presence", label: "Prezență curentă" },
        { key: "activity", label: "Activitate curentă" },
        { key: "presenceDots", label: "Istoric prezență (15)", format: dotsToText },
        { key: "presenceDots", label: "Sumar prezență", format: dotsSummary },
        { key: "activityDots", label: "Istoric activitate (15)", format: dotsToText },
        { key: "phone", label: "Telefon" },
        { key: "email", label: "Email" },
        { key: "observations", label: "Observații" },
      ],
    },
  ],
});

export const buildSponsorsExport = (
  sponsors: unknown[],
  projects: unknown[],
  payments: unknown[]
): ExportConfig => {
  const projectMap = Object.fromEntries(
    (projects as Array<{ id: string; name: string }>).map((p) => [p.id, p.name])
  );

  const sponsorMap = Object.fromEntries(
    (sponsors as Array<{ id: string; company: string }>).map((s) => [s.id, s.company])
  );

  const paymentsEnriched = (payments as Array<Record<string, unknown>>).map((p) => ({
    ...p,
    companyName: sponsorMap[p.sponsorId as string] ?? "—",
    projectName: projectMap[p.projectId as string] ?? "Proiect șters",
  }));

  const projectsWithTotals = (projects as Array<Record<string, unknown>>).map((pr) => {
    const total = (payments as Array<{ projectId: string; amount: number }>)
      .filter((p) => p.projectId === (pr as { id: string }).id)
      .reduce((s, p) => s + p.amount, 0);
    const count = (payments as Array<{ projectId: string }>).filter(
      (p) => p.projectId === (pr as { id: string }).id
    ).length;
    return { ...pr, totalIncasat: total, nrIncasari: count };
  });

  return {
    fileName: `Interact_Cismigiu_Sponsorizari_${new Date().toISOString().slice(0, 10)}`,
    sheets: [
      {
        name: "Sponsori",
        data: sponsors as Record<string, unknown>[],
        columns: [
          { key: "company", label: "Firmă" },
          { key: "contactPerson", label: "Persoană contact" },
          { key: "responsible", label: "Responsabil club" },
          { key: "amount", label: "Valoare estimată" },
          { key: "amountType", label: "Tip" },
          { key: "status", label: "Status" },
          { key: "dateAdded", label: "Data adăugării" },
          { key: "observations", label: "Observații" },
        ],
      },
      {
        name: "Încasări",
        data: paymentsEnriched,
        columns: [
          { key: "companyName", label: "Firmă" },
          { key: "projectName", label: "Proiect" },
          { key: "amount", label: "Sumă (RON)", format: (v) => Number(v) || 0 },
          { key: "date", label: "Data" },
          { key: "note", label: "Notă" },
        ],
      },
      {
        name: "Proiecte",
        data: projectsWithTotals,
        columns: [
          { key: "name", label: "Proiect" },
          { key: "target", label: "Target (RON)", format: (v) => Number(v) || 0 },
          { key: "totalIncasat", label: "Total încasat (RON)", format: (v) => Number(v) || 0 },
          { key: "nrIncasari", label: "Nr. încasări" },
          { key: "dateCreated", label: "Data creării" },
        ],
      },
    ],
  };
};

export const buildFullExport = (
  members: unknown[],
  aspirants: unknown[],
  sponsors: unknown[],
  projects: unknown[],
  payments: unknown[]
): ExportConfig => {
  const membersCfg = buildMembersExport(members);
  const aspirantsCfg = buildAspirantsExport(aspirants);
  const sponsorsCfg = buildSponsorsExport(sponsors, projects, payments);

  return {
    fileName: `Interact_Cismigiu_COMPLET_${new Date().toISOString().slice(0, 10)}`,
    sheets: [
      ...membersCfg.sheets,
      ...aspirantsCfg.sheets,
      ...sponsorsCfg.sheets,
    ],
  };
};

// ── Buton de export ───────────────────────────────────────────
interface ExportButtonProps {
  config: ExportConfig;
  label?: string;
  variant?: "primary" | "secondary";
}

export function ExportButton({
  config,
  label = "Export Excel",
  variant = "secondary",
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    // Mică pauză ca UI să se actualizeze
    await new Promise((r) => setTimeout(r, 80));
    try {
      exportToExcel(config);
    } catch (err) {
      alert("Eroare la export. Verifică consola.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 14px",
    borderRadius: 10,
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: loading ? "wait" : "pointer",
    border: "none",
    touchAction: "manipulation",
    transition: "all 0.15s",
    opacity: loading ? 0.7 : 1,
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  };

  const styles: Record<string, React.CSSProperties> = {
    primary: {
      ...base,
      background: "#059669",
      color: "#fff",
      boxShadow: "0 2px 8px rgba(5,150,105,0.25)",
    },
    secondary: {
      ...base,
      background: "#fff",
      color: "#15803d",
      border: "1px solid #86efac",
    },
  };

  return (
    <button style={styles[variant]} onClick={handleExport} disabled={loading}>
      {loading ? (
        <>
          <span style={{ fontSize: 14 }}>⏳</span> Se generează...
        </>
      ) : (
        <>
          <span style={{ fontSize: 14 }}>📊</span> {label}
        </>
      )}
    </button>
  );
}

// ── Buton export complet (toate tabelele) ─────────────────────
interface FullExportButtonProps {
  members: unknown[];
  aspirants: unknown[];
  sponsors: unknown[];
  projects: unknown[];
  payments: unknown[];
}

export function FullExportButton({
  members,
  aspirants,
  sponsors,
  projects,
  payments,
}: FullExportButtonProps) {
  return (
    <ExportButton
      config={buildFullExport(members, aspirants, sponsors, projects, payments)}
      label="Export complet"
      variant="primary"
    />
  );
}

// =============================================================
// CUM INTEGREZI ÎN MemberDashboard.tsx (codul tău existent)
// =============================================================
//
// 1. INSTALARE
//    npm install xlsx
//
// 2. IMPORT (la începutul MemberDashboard.tsx)
//    import { ExportButton, FullExportButton,
//             buildMembersExport, buildAspirantsExport,
//             buildSponsorsExport } from "./ExportModule";
//
// 3. ÎN TAB-UL MEMBRI — adaugă butonul lângă "Adaugă Membru":
//
//    <button style={btn1} onClick={() => setEdit(blank)}>+ {addLabel}</button>
//    <ExportButton config={buildMembersExport(members)} label="Export Membri" />
//
// 4. ÎN TAB-UL ASPIRANȚI — același pattern:
//
//    <ExportButton config={buildAspirantsExport(aspirants)} label="Export Aspiranți" />
//
// 5. ÎN TAB-UL SPONSORIZĂRI — adaugă lângă "+ Sponsor":
//
//    <ExportButton
//      config={buildSponsorsExport(sponsors, projects, payments)}
//      label="Export Sponsorizări"
//    />
//
// 6. ÎN HEADER (export complet din toate tabelele):
//    Adaugă în <main> înainte de tab-uri:
//
//    <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:8 }}>
//      <FullExportButton
//        members={members}
//        aspirants={aspirants}
//        sponsors={sponsors}
//        projects={projects}
//        payments={payments}
//      />
//    </div>
//
// =============================================================