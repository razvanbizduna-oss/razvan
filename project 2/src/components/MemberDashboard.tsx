import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, set, update, remove } from "firebase/database";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from '../context/AuthContext';

const db = getDatabase(getApps().length ? getApps()[0] : initializeApp({
  apiKey:"AIzaSyDGTf0McxvjriKWDtbVfnTUgcy1CCobBbA",
  authDomain:"interact-cismigiu.firebaseapp.com",
  databaseURL:"https://interact-cismigiu-default-rtdb.firebaseio.com",
  projectId:"interact-cismigiu",
  storageBucket:"interact-cismigiu.firebasestorage.app",
  messagingSenderId:"26942882237",
  appId:"1:26942882237:web:a26ad58d1289e81c4f12d4",
}));

// ─── Types ────────────────────────────────────────────────────
type Presence   = "Prezent"|"Absent"|"Justificat";
type Activity   = "Ridicată"|"Medie"|"Slabă";
type Tab        = "members"|"aspirants"|"checkin"|"calendar"|"reservations";
type PersonType = "members"|"aspirants";
type DotState   = 0|1|2|3;
type SortField  = "name"|"role"|"presence"|"activity";

interface Person { id:string; name:string; phone:string; email:string; role:string; presence:Presence; activity:Activity; observations:string; presenceDots?:DotState[]; activityDots?:DotState[]; }
interface QRSession { code:string; createdAt:number; expiresAt:number; sessionName:string; lat?:number; lng?:number; }
interface SessionRecord { id:string; code:string; sessionName:string; date:string; createdAt:number; attendees:string[]; totalMembers:number; }
interface Reservation { id:string; projectId:number; projectTitle:string; name:string; email:string; phone:string; minDonation:number; timestamp:string; }

// ─── Calendar Types ───────────────────────────────────────────
export type EventType = "sedinta" | "eveniment" | "deadline" | "altul";
export interface CalEvent {
  id: string;
  title: string;
  date: string;       // "YYYY-MM-DD"
  time?: string;      // "HH:MM"
  endTime?: string;   // "HH:MM"
  type: EventType;
  description?: string;
  location?: string;
}

// ─── Constants ────────────────────────────────────────────────
const QR_DUR  = 60*60*1000;
const DOT_N   = 20;
const ROLES   = ["Președinte","Vicepreședinte","Secretar","Trezorier","Director Proiecte","Director Comunicare","Director Sponsorizări","Director Resurse Umane","Membru Activ","Membru Activ PR","Membru Activ IR","Membru Activ LF"];
const PRES_V: Presence[] = ["Prezent","Absent","Justificat"];
const ACT_V:  Activity[] = ["Ridicată","Medie","Slabă"];
const READONLY_TOKEN_PATH = "readonly_token";

const uid     = ()=>Date.now().toString(36)+Math.random().toString(36).slice(2);
const toDay   = ()=>new Date().toISOString().slice(0,10);
const genCode = ()=>Math.random().toString(36).slice(2,8).toUpperCase()+Math.random().toString(36).slice(2,6).toUpperCase();
const emptyDots = ():DotState[]=>Array(DOT_N).fill(0) as DotState[];
const nextDot   = (s:DotState):DotState=>((s+1)%4) as DotState;
const normDots  = (d:any):DotState[]=>{
  const arr:DotState[]=Array(DOT_N).fill(0);
  if(!d)return arr;
  const src=Array.isArray(d)?d:Object.values(d);
  for(let i=0;i<DOT_N;i++)arr[i]=(Number(src[i])||0) as DotState;
  return arr;
};

// ─── Calendar Helpers ──────────────────────────────────────────
const MONTHS_RO = ["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"];
const DAYS_RO   = ["Lu","Ma","Mi","Jo","Vi","Sâ","Du"];

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  let startDow = first.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  for (let i = 0; i < startDow; i++) days.push(null as any);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateRo(s: string): string {
  const d = parseDate(s);
  return `${d.getDate()} ${MONTHS_RO[d.getMonth()]} ${d.getFullYear()}`;
}

function getWeekRange(offset = 0): [string, string] {
  const now = new Date();
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const mon = new Date(now); mon.setDate(now.getDate() - day + offset * 7);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return [dateStr(mon), dateStr(sun)];
}

function toICalDate(date: string, time?: string): string {
  const d = date.replace(/-/g, "");
  if (!time) return d;
  const t = time.replace(":", "") + "00";
  return `${d}T${t}`;
}

function exportIcal(events: CalEvent[], sessions: SessionRecord[]) {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Interact Cișmigiu//Calendar//RO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Interact Cișmigiu",
    "X-WR-TIMEZONE:Europe/Bucharest",
  ];
  const addEvent = (title: string, date: string, time?: string, endTime?: string, desc?: string, loc?: string) => {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid()}@interactcismigiu`);
    lines.push(`DTSTAMP:${toICalDate(toDay())}T000000Z`);
    if (time) {
      lines.push(`DTSTART;TZID=Europe/Bucharest:${toICalDate(date, time)}`);
      lines.push(`DTEND;TZID=Europe/Bucharest:${toICalDate(date, endTime || time)}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${date.replace(/-/g, "")}`);
      lines.push(`DTEND;VALUE=DATE:${date.replace(/-/g, "")}`);
    }
    lines.push(`SUMMARY:${title}`);
    if (desc) lines.push(`DESCRIPTION:${desc.replace(/\n/g, "\\n")}`);
    if (loc)  lines.push(`LOCATION:${loc}`);
    lines.push("END:VEVENT");
  };
  events.forEach(e => addEvent(e.title, e.date, e.time, e.endTime, e.description, e.location));
  sessions.forEach(s => addEvent(`Ședință: ${s.sessionName}`, s.date));
  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "interact-cismigiu.ics"; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── Calendar Event Meta ───────────────────────────────────────
const EVENT_META: Record<EventType, { label: string; color: string; bg: string; border: string; dot: string }> = {
  sedinta:    { label: "Ședință",    color: "#1D4ED8", bg: "#EFF6FF", border: "#DBEAFE", dot: "#1D4ED8" },
  eveniment:  { label: "Eveniment", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", dot: "#16A34A" },
  deadline:   { label: "Deadline",  color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", dot: "#DC2626" },
  altul:      { label: "Altul",     color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", dot: "#D97706" },
};

// ─── Design tokens ────────────────────────────────────────────
const T = {
  fontDisplay: "'Instrument Serif', Georgia, serif",
  fontBody:    "'DM Sans', system-ui, sans-serif",
  bg:          "#FAFAF9",
  surface:     "#FFFFFF",
  border:      "#E8E5E0",
  borderSub:   "#F0EDE8",
  text:        "#1A1917",
  textSub:     "#78716C",
  textMuted:   "#A8A29E",
  accent:      "#1D4ED8",
  accentBg:    "#EFF6FF",
  accentSub:   "#DBEAFE",
  green:    "#16A34A", greenBg:  "#F0FDF4", greenBorder:  "#BBF7D0",
  red:      "#DC2626", redBg:    "#FEF2F2", redBorder:    "#FECACA",
  amber:    "#D97706", amberBg:  "#FFFBEB", amberBorder:  "#FDE68A",
  purple:   "#7C3AED", purpleBg: "#F5F3FF", purpleBorder: "#DDD6FE",
  radius:   "10px",
  radiusLg: "14px",
  radiusXl: "20px",
  shadow:   "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.08)",
  shadowLg: "0 20px 60px rgba(0,0,0,0.12)",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',system-ui,sans-serif;background:${T.bg};color:${T.text};-webkit-font-smoothing:antialiased;}
  input,select,textarea,button{font-family:inherit;}
  input[type=search]::-webkit-search-cancel-button{-webkit-appearance:none;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
  @keyframes toastIn{from{opacity:0;transform:translateY(6px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
  .trow:hover td{background:${T.bg}!important;}
  .nav-btn:hover{background:${T.borderSub}!important;}
  .filter-row::-webkit-scrollbar{display:none;}
`;

// ─── Toast ────────────────────────────────────────────────────
interface Toast { id:string; msg:string; type:"ok"|"err"|"info"; }
let _addToast:(t:Toast)=>void = ()=>{};
const showToast = (msg:string, type:"ok"|"err"|"info"="ok") => _addToast({id:uid(),msg,type});

function ToastContainer() {
  const [toasts,setToasts]=useState<Toast[]>([]);
  useEffect(()=>{ _addToast=(t)=>{ setToasts(p=>[...p,t]); setTimeout(()=>setToasts(p=>p.filter(x=>x.id!==t.id)),3000); }; },[]);
  if(!toasts.length) return null;
  const col={ok:T.green,err:T.red,info:T.accent};
  const ic={ok:"✓",err:"✕",info:"·"};
  return (
    <div style={{position:"fixed",bottom:20,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:6}}>
      {toasts.map(t=>(
        <div key={t.id} style={{background:T.surface,border:`1px solid ${T.border}`,borderLeft:`3px solid ${col[t.type]}`,color:T.text,padding:"9px 14px",borderRadius:T.radius,fontSize:"0.81rem",fontWeight:500,boxShadow:T.shadowMd,animation:"toastIn 0.18s ease both",display:"flex",alignItems:"center",gap:8,minWidth:210}}>
          <span style={{color:col[t.type],fontWeight:700}}>{ic[t.type]}</span>{t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── XLSX ─────────────────────────────────────────────────────
let xlsxLoaded=false, xlsxLoading:Promise<void>|null=null;
function loadXLSX():Promise<void> {
  if(xlsxLoaded)return Promise.resolve();
  if(xlsxLoading)return xlsxLoading;
  xlsxLoading=new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";s.onload=()=>{xlsxLoaded=true;res();};s.onerror=rej;document.head.appendChild(s);});
  return xlsxLoading;
}
const dotsToText=(d:DotState[]|undefined)=>{if(!d||!d.length)return"—";const m:Record<number,string>={0:"○",1:"🟩",2:"🟨",3:"🟥"};return d.map(x=>m[x]??"○").join(" ");};
const dotsSummary=(d:DotState[]|undefined)=>{if(!d||!d.length)return"—";const p=d.filter(x=>x===1).length,j=d.filter(x=>x===2).length,a=d.filter(x=>x===3).length,t=d.filter(x=>x!==0).length;if(!t)return"—";return`P:${p} J:${j} A:${a}/${t}`;};

function buildSheet(XLSX:any,data:any[],cols:{key:string;label:string;format?:(v:any)=>any}[]) {
  const rows=data.map(item=>{const r:any={};cols.forEach(c=>{const v=item[c.key];r[c.label]=c.format?c.format(v):(v==null||v===""?"—":v);});return r;});
  const ws=XLSX.utils.json_to_sheet(rows,{header:cols.map(c=>c.label)});
  ws["!cols"]=cols.map(c=>({wch:Math.min(40,Math.max(12,Math.max(c.label.length,...data.map(item=>{const v=c.format?c.format(item[c.key]):item[c.key];return String(v??"").length;}))+2))}));
  return ws;
}
function addInfoSheet(XLSX:any,wb:any,stats:{label:string;value:any}[]) {
  const rows=[{Câmp:"Club",Valoare:"Interact Cismigiu"},{Câmp:"Generat la",Valoare:new Date().toLocaleString("ro-RO")},...stats.map(s=>({Câmp:s.label,Valoare:s.value}))];
  const ws=XLSX.utils.json_to_sheet(rows,{header:["Câmp","Valoare"]});ws["!cols"]=[{wch:28},{wch:36}];
  XLSX.utils.book_append_sheet(wb,ws,"Info");
}
async function exportMembers(people:Person[],title:string) {
  await loadXLSX();const XLSX=(window as any).XLSX;const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,buildSheet(XLSX,people,[{key:"name",label:"Nume"},{key:"role",label:"Funcție"},{key:"presence",label:"Prezență"},{key:"activity",label:"Activitate"},{key:"presenceDots",label:"Istoric prezență",format:dotsToText},{key:"presenceDots",label:"Sumar",format:dotsSummary},{key:"phone",label:"Telefon"},{key:"email",label:"Email"},{key:"observations",label:"Observații"}]),title);
  addInfoSheet(XLSX,wb,[{label:"Total",value:people.length}]);XLSX.writeFile(wb,`Interact_${title}_${toDay()}.xlsx`);
}
async function exportAll(members:Person[],aspirants:Person[]) {
  await loadXLSX();const XLSX=(window as any).XLSX;const wb=XLSX.utils.book_new();
  const cols=[{key:"name",label:"Nume"},{key:"role",label:"Funcție"},{key:"presence",label:"Prezență"},{key:"activity",label:"Activitate"},{key:"presenceDots",label:"Istoric",format:dotsToText},{key:"presenceDots",label:"Sumar",format:dotsSummary},{key:"phone",label:"Telefon"},{key:"email",label:"Email"}];
  XLSX.utils.book_append_sheet(wb,buildSheet(XLSX,members,cols),"Membri");XLSX.utils.book_append_sheet(wb,buildSheet(XLSX,aspirants,cols),"Aspiranți");
  addInfoSheet(XLSX,wb,[{label:"Total membri",value:members.length},{label:"Total aspiranți",value:aspirants.length}]);
  XLSX.writeFile(wb,`Interact_Complet_${toDay()}.xlsx`);
}
async function exportReservations(reservations:Reservation[]) {
  await loadXLSX();const XLSX=(window as any).XLSX;const wb=XLSX.utils.book_new();
  const cols=[{key:"name",label:"Nume"},{key:"email",label:"Email"},{key:"phone",label:"Telefon"},{key:"projectTitle",label:"Eveniment"},{key:"minDonation",label:"Donație minimă (RON)"},{key:"timestamp",label:"Data",format:(v:string)=>new Date(v).toLocaleString("ro-RO")}];
  XLSX.utils.book_append_sheet(wb,buildSheet(XLSX,reservations,cols),"Rezervări");
  addInfoSheet(XLSX,wb,[{label:"Total rezervări",value:reservations.length}]);
  XLSX.writeFile(wb,`Interact_Rezervari_${toDay()}.xlsx`);
}

// ─── Import ────────────────────────────────────────────────────
const EXCEL_MAP:Record<string,keyof Person>={"Nume complet":"name","Funcție":"role","Prezență curentă":"presence","Activitate curentă":"activity","Prezență":"presence","Activitate":"activity","Telefon":"phone","Email":"email","Observații":"observations"};
function parsePersonSheet(XLSX:any,wb:any,trySheets:string[]):{people:Person[];warnings:string[]} {
  const sn=trySheets.find(s=>wb.SheetNames.includes(s))??wb.SheetNames[0];
  const rows:Record<string,any>[]=XLSX.utils.sheet_to_json(wb.Sheets[sn],{defval:""});
  const people:Person[]=[],warnings:string[]=[];
  rows.forEach((row,i)=>{
    const p:Partial<Person>={};let hasName=false;
    Object.keys(row).forEach(col=>{const k=EXCEL_MAP[col.trim()];if(k){(p as any)[k]=String(row[col]).trim();if(k==="name"&&p.name)hasName=true;}});
    if(!hasName){warnings.push(`Rândul ${i+1} ignorat`);return;}
    people.push({id:uid(),name:p.name??"",role:p.role??"Membru Activ",presence:(PRES_V.includes(p.presence as Presence)?p.presence:"Prezent")as Presence,activity:(ACT_V.includes(p.activity as Activity)?p.activity:"Medie")as Activity,phone:p.phone??"",email:p.email??"",observations:p.observations??"",presenceDots:emptyDots(),activityDots:emptyDots()});
  });
  return {people,warnings};
}
async function downloadTemplate() {
  await loadXLSX();const XLSX=(window as any).XLSX;const wb=XLSX.utils.book_new();
  const h=["Nume complet","Funcție","Prezență curentă","Activitate curentă","Telefon","Email","Observații"];
  const ex=[["Ion Popescu","Secretar","Prezent","Ridicată","0722000001","ion@example.com",""],["Maria Ionescu","Vicepreședinte","Prezent","Medie","0733000002","maria@example.com",""]];
  const ws=XLSX.utils.aoa_to_sheet([h,...ex]);ws["!cols"]=h.map(x=>({wch:Math.max(x.length+4,18)}));
  XLSX.utils.book_append_sheet(wb,ws,"Membri");XLSX.writeFile(wb,"Interact_Template.xlsx");
}

// ─── Style helpers ────────────────────────────────────────────
const presStyle=(v:Presence):React.CSSProperties=>({padding:"2px 8px",borderRadius:20,fontSize:"0.67rem",fontWeight:600,letterSpacing:"0.01em",...(v==="Prezent"?{background:T.greenBg,color:T.green,border:`1px solid ${T.greenBorder}`}:v==="Absent"?{background:T.redBg,color:T.red,border:`1px solid ${T.redBorder}`}:{background:T.amberBg,color:T.amber,border:`1px solid ${T.amberBorder}`})});
const actStyle=(v:Activity):React.CSSProperties=>({padding:"2px 8px",borderRadius:20,fontSize:"0.67rem",fontWeight:600,...(v==="Ridicată"?{background:T.greenBg,color:T.green,border:`1px solid ${T.greenBorder}`}:v==="Slabă"?{background:T.redBg,color:T.red,border:`1px solid ${T.redBorder}`}:{background:T.amberBg,color:T.amber,border:`1px solid ${T.amberBorder}`})});
const ROLE_C:Record<string,{bg:string;c:string}>={"Președinte":{bg:"#FDF2F8",c:"#9D174D"},"Vicepreședinte":{bg:"#F5F3FF",c:"#5B21B6"},"Secretar":{bg:"#EFF6FF",c:"#1E40AF"},"Trezorier":{bg:"#F0FDF4",c:"#065F46"},"Director Proiecte":{bg:"#FFF7ED",c:"#C2410C"},"Director Comunicare":{bg:"#F0F9FF",c:"#0369A1"},"Director Sponsorizări":{bg:"#FEFCE8",c:"#92400E"},"Director Resurse Umane":{bg:"#F0FDF4",c:"#166534"}};
const roleStyle=(r:string):React.CSSProperties=>{const c=ROLE_C[r];return{padding:"2px 8px",borderRadius:20,fontSize:"0.63rem",fontWeight:600,letterSpacing:"0.01em",background:c?.bg??"#F5F5F4",color:c?.c??"#57534E",border:`1px solid ${c?.bg??"#E7E5E4"}`};};
const dotColor=(s:DotState)=>s===1?{bg:T.green,b:"#15803D"}:s===2?{bg:T.amber,b:"#B45309"}:s===3?{bg:T.red,b:"#B91C1C"}:{bg:"transparent",b:T.border};

// ─── Atoms ────────────────────────────────────────────────────
const Avatar=({name,size=36}:{name:string;size?:number})=>{
  const letter=(name||"?").charAt(0).toUpperCase();
  return <div style={{width:size,height:size,borderRadius:"50%",background:T.redBg,display:"flex",alignItems:"center",justifyContent:"center",color:T.red,fontWeight:700,fontSize:size*0.38,flexShrink:0,border:`1px solid ${T.redBorder}`}}>{letter}</div>;
};

const Lbl=({children}:{children:React.ReactNode})=>(
  <label style={{display:"block",fontSize:"0.67rem",fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>{children}</label>
);

const Inp=({style,...p}:React.InputHTMLAttributes<HTMLInputElement>&{style?:React.CSSProperties})=>(
  <input style={{width:"100%",border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"9px 12px",fontSize:"0.88rem",background:T.surface,color:T.text,outline:"none",boxSizing:"border-box",transition:"border-color 0.15s",...style}}
    onFocus={e=>(e.target as HTMLInputElement).style.borderColor=T.accent}
    onBlur={e=>(e.target as HTMLInputElement).style.borderColor=T.border}
    {...p}
  />
);
const Sel=({style,...p}:React.SelectHTMLAttributes<HTMLSelectElement>&{style?:React.CSSProperties})=>(
  <select style={{width:"100%",border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"9px 12px",fontSize:"0.88rem",background:T.surface,color:T.text,outline:"none",WebkitAppearance:"none",boxSizing:"border-box",...style}} {...p}/>
);
const Btn=({children,variant="primary",style,...p}:{children:React.ReactNode;variant?:"primary"|"secondary"|"danger"|"ghost";style?:React.CSSProperties}&React.ButtonHTMLAttributes<HTMLButtonElement>)=>{
  const base:React.CSSProperties={padding:"8px 14px",borderRadius:T.radius,fontSize:"0.82rem",fontWeight:600,cursor:"pointer",border:"none",display:"inline-flex",alignItems:"center",gap:6,transition:"opacity 0.15s",touchAction:"manipulation",flexShrink:0};
  const v={primary:{...base,background:T.accent,color:"#fff"},secondary:{...base,background:T.surface,color:T.text,border:`1px solid ${T.border}`},danger:{...base,background:T.redBg,color:T.red,border:`1px solid ${T.redBorder}`},ghost:{...base,background:"transparent",color:T.textSub,border:`1px solid ${T.border}`}};
  return <button style={{...v[variant],...style}} {...p}>{children}</button>;
};

// ─── Dots row ─────────────────────────────────────────────────
function DotsRow({dots,label,onChange,sessionHistory,readOnly,compact}:{dots:DotState[];label:string;onChange?:(d:DotState[])=>void;sessionHistory?:SessionRecord[];readOnly?:boolean;compact?:boolean}) {
  const safe=dots&&dots.length===DOT_N?dots:emptyDots();
  const [tooltip,setTooltip]=useState<{idx:number;x:number;y:number}|null>(null);
  const getSession=(idx:number)=>sessionHistory?.slice(0,DOT_N)[idx];
  const sz=compact?11:12,gap=compact?3:3;
  const row1=safe.slice(0,10);
  const row2=safe.slice(10,20);
  const renderDot=(s:DotState,i:number)=>{
    const c=dotColor(s);const sess=getSession(i);
    return(
      <div key={i} style={{position:"relative"}}>
        <button
          onClick={e=>{if(readOnly)return;e.stopPropagation();if(onChange){const n=[...safe]as DotState[];n[i]=nextDot(s);onChange(n);}}}
          onMouseEnter={e=>{if(s===0&&!sess)return;const r=(e.target as HTMLElement).getBoundingClientRect();setTooltip({idx:i,x:r.left,y:r.top});}}
          onMouseLeave={()=>setTooltip(null)}
          style={{
            width:sz,height:sz,borderRadius:"50%",
            background:c.bg,border:`1.5px solid ${c.b}`,
            cursor:readOnly?"default":"pointer",
            padding:0,flexShrink:0,display:"block",
            touchAction:"manipulation",
            WebkitTapHighlightColor:"transparent",
          }}
        />
        {tooltip?.idx===i&&(s!==0||sess)&&(
          <div style={{position:"fixed",left:Math.max(4,tooltip.x-20),top:tooltip.y-58,zIndex:2000,background:T.text,color:"#fff",borderRadius:8,padding:"6px 10px",fontSize:"0.68rem",whiteSpace:"nowrap",pointerEvents:"none",boxShadow:T.shadowMd}}>
            {sess?<><div style={{fontWeight:700}}>{sess.sessionName}</div><div style={{opacity:0.6,fontSize:"0.63rem"}}>{sess.date}</div></>:<div>Ședința {i+1}</div>}
            <div style={{marginTop:2,fontSize:"0.67rem",color:s===1?"#86EFAC":s===2?"#FDE68A":s===3?"#FCA5A5":"#A8A29E"}}>{s===1?"✓ Prezent":s===2?"∼ Justificat":s===3?"✗ Absent":"Neînregistrat"}</div>
          </div>
        )}
      </div>
    );
  };
  return(
    <div style={{display:"flex",alignItems:"flex-start",gap:compact?4:8}}>
      <span style={{fontSize:"0.58rem",fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",minWidth:compact?10:14,textAlign:"right",paddingTop:compact?1:2}}>{label}</span>
      <div style={{display:"flex",flexDirection:"column",gap:compact?3:3}}>
        <div style={{display:"flex",gap}}>{row1.map((s,i)=>renderDot(s,i))}</div>
        <div style={{display:"flex",gap}}>{row2.map((s,i)=>renderDot(s,i+10))}</div>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────
function Modal({title,subtitle,onClose,footer,children}:{title:string;subtitle?:string;onClose:()=>void;footer:React.ReactNode;children:React.ReactNode}) {
  useEffect(()=>{document.body.style.overflow="hidden";return()=>{document.body.style.overflow="";};},[]);
  return(
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(26,25,23,0.4)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:T.surface,width:"100%",maxWidth:520,borderRadius:`${T.radiusXl} ${T.radiusXl} 0 0`,maxHeight:"94vh",display:"flex",flexDirection:"column",boxShadow:T.shadowLg,animation:"fadeUp 0.22s ease both"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 0"}}><div style={{width:36,height:4,borderRadius:2,background:T.border}}/></div>
        <div style={{padding:"12px 20px 14px",borderBottom:`1px solid ${T.borderSub}`,flexShrink:0}}>
          <div style={{fontFamily:T.fontDisplay,fontSize:"1.12rem",color:T.text,fontWeight:400}}>{title}</div>
          {subtitle&&<div style={{fontSize:"0.76rem",color:T.textMuted,marginTop:3}}>{subtitle}</div>}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:14,WebkitOverflowScrolling:"touch"}}>{children}</div>
        <div style={{padding:"12px 20px 20px",borderTop:`1px solid ${T.borderSub}`,display:"flex",gap:8,flexShrink:0}}>{footer}</div>
      </div>
    </div>
  );
}

// ─── Person Modal ─────────────────────────────────────────────
function PersonModal({person,showRole,onSave,onDelete,onClose}:{person:Partial<Person>&{_new?:boolean};showRole:boolean;onSave:(p:Person)=>void;onDelete?:()=>void;onClose:()=>void;}) {
  const [f,setF]=useState({name:person.name||"",phone:person.phone||"",email:person.email||"",role:person.role||"Membru Activ",presence:(person.presence||"Prezent")as Presence,activity:(person.activity||"Medie")as Activity,observations:person.observations||""});
  const up=(k:keyof typeof f)=>(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>)=>setF(p=>({...p,[k]:e.target.value}));
  const save=()=>{if(!f.name.trim()){showToast("Completează numele","err");return;}onSave({id:person.id||uid(),...f,presenceDots:normDots(person.presenceDots),activityDots:normDots(person.activityDots)}as Person);};
  return(
    <Modal title={person._new?"Persoană nouă":person.name||""} subtitle={person._new?undefined:"Editare"} onClose={onClose}
      footer={<><Btn variant="primary" style={{flex:1}} onClick={save}>Salvează</Btn>{onDelete&&<Btn variant="danger" onClick={onDelete}>Șterge</Btn>}<Btn variant="secondary" onClick={onClose}>Anulează</Btn></>}>
      <div><Lbl>Nume complet</Lbl><Inp value={f.name} onChange={up("name")} placeholder="Prenume Nume" autoComplete="off"/></div>
      {showRole&&<div><Lbl>Funcție</Lbl><Sel value={f.role} onChange={up("role")}>{ROLES.map(r=><option key={r}>{r}</option>)}</Sel></div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><Lbl>Prezență</Lbl><Sel style={presStyle(f.presence as Presence)} value={f.presence} onChange={up("presence")}>{PRES_V.map(v=><option key={v}>{v}</option>)}</Sel></div>
        <div><Lbl>Activitate</Lbl><Sel style={actStyle(f.activity as Activity)} value={f.activity} onChange={up("activity")}>{ACT_V.map(v=><option key={v}>{v}</option>)}</Sel></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><Lbl>Telefon</Lbl><Inp type="tel" value={f.phone} onChange={up("phone")} placeholder="07xx xxx xxx"/></div>
        <div><Lbl>Email</Lbl><Inp type="email" value={f.email} onChange={up("email")} placeholder="email@ex.com"/></div>
      </div>
      <div><Lbl>Observații</Lbl><textarea value={f.observations} onChange={up("observations")} placeholder="Note…" rows={3} style={{width:"100%",border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"9px 12px",fontSize:"0.88rem",background:T.surface,color:T.text,resize:"none",outline:"none",boxSizing:"border-box"}}/></div>
    </Modal>
  );
}

// ─── Import ────────────────────────────────────────────────────
function ImportBtn({onImport}:{onImport:(p:Person[],t:PersonType)=>Promise<void>}) {
  const [st,setSt]=useState<"idle"|"loading"|"preview"|"done">("idle");
  const [parsed,setParsed]=useState<Person[]>([]);
  const [warns,setWarns]=useState<string[]>([]);
  const [saving,setSaving]=useState(false);
  const ref_=React.useRef<HTMLInputElement>(null);
  const handle=async(f:File)=>{
    if(!f.name.match(/\.xlsx?$/i)){showToast("Doar .xlsx","err");return;}setSt("loading");
    try{await loadXLSX();const XLSX=(window as any).XLSX;const buf=await f.arrayBuffer();const wb=XLSX.read(buf,{type:"array"});const {people,warnings}=parsePersonSheet(XLSX,wb,["Membri","Aspiranți",wb.SheetNames[0]]);if(!people.length){showToast("Nicio persoană","err");setSt("idle");return;}setParsed(people);setWarns(warnings);setSt("preview");}
    catch(e:any){showToast("Eroare: "+(e?.message||e),"err");setSt("idle");}
    if(ref_.current)ref_.current.value="";
  };
  const confirm=async(type:PersonType)=>{setSaving(true);try{await onImport(parsed,type);setSt("done");showToast(`${parsed.length} importate`);}catch{showToast("Eroare","err");}finally{setSaving(false);};};
  const reset=()=>{setParsed([]);setWarns([]);setSt("idle");};
  if(st==="done")return<div style={{display:"inline-flex",alignItems:"center",gap:6,background:T.greenBg,border:`1px solid ${T.greenBorder}`,color:T.green,padding:"5px 10px",borderRadius:T.radius,fontSize:"0.72rem",fontWeight:600}}>✓ {parsed.length} imp.<button onClick={reset} style={{background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:"0.72rem",padding:"0 2px"}}>OK</button></div>;
  if(st==="preview")return(
    <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:T.radiusLg,padding:10,width:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontWeight:600,fontSize:"0.8rem"}}>{parsed.length} găsite</span><Btn variant="ghost" style={{padding:"2px 6px",fontSize:"0.68rem"}} onClick={reset}>✕</Btn></div>
      {warns.length>0&&<div style={{background:T.amberBg,border:`1px solid ${T.amberBorder}`,borderRadius:T.radius,padding:"4px 8px",fontSize:"0.68rem",color:T.amber,marginBottom:6}}>{warns.length} ignorate</div>}
      <div style={{fontSize:"0.72rem",color:T.textSub,marginBottom:6}}>Importă ca:</div>
      <div style={{display:"flex",gap:6}}><Btn variant="primary" onClick={()=>confirm("members")} style={{opacity:saving?0.6:1,fontSize:"0.72rem",padding:"5px 10px"}}>Membri</Btn><Btn variant="secondary" onClick={()=>confirm("aspirants")} style={{opacity:saving?0.6:1,fontSize:"0.72rem",padding:"5px 10px"}}>Aspiranți</Btn></div>
    </div>
  );
  return(
    <div style={{display:"inline-flex",gap:4}}>
      <label style={{padding:"6px 10px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.radius,fontSize:"0.72rem",fontWeight:600,color:T.textSub,cursor:st==="loading"?"wait":"pointer",display:"inline-flex",alignItems:"center",gap:4,opacity:st==="loading"?0.6:1}}>
        {st==="loading"?"⏳":"↑"}<input ref={ref_} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>e.target.files?.[0]&&handle(e.target.files[0])}/>
      </label>
      <Btn variant="ghost" style={{fontSize:"0.72rem",padding:"6px 8px"}} onClick={downloadTemplate}>Tpl</Btn>
    </div>
  );
}

// ─── Stat bar ─────────────────────────────────────────────────
function StatBar({people}:{people:Person[]}) {
  const s=[{l:"Total",v:people.length,c:T.text},{l:"Prezenți",v:people.filter(p=>p.presence==="Prezent").length,c:T.green},{l:"Absenți",v:people.filter(p=>p.presence==="Absent").length,c:T.red},{l:"Justif.",v:people.filter(p=>p.presence==="Justificat").length,c:T.amber},{l:"Ridicată",v:people.filter(p=>p.activity==="Ridicată").length,c:T.accent}];
  return(
    <div style={{display:"flex",background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.radiusLg,overflow:"hidden",marginBottom:12,flexShrink:0}}>
      {s.map((x,i)=>(
        <div key={x.l} style={{flex:1,padding:"10px 4px",textAlign:"center",borderRight:i<s.length-1?`1px solid ${T.borderSub}`:"none"}}>
          <div style={{fontFamily:T.fontDisplay,fontSize:"1.25rem",color:x.c,lineHeight:1}}>{x.v}</div>
          <div style={{fontSize:"0.52rem",color:T.textMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginTop:2}}>{x.l}</div>
        </div>
      ))}
    </div>
  );
}

function MemberCard({person,sessionHistory,onEdit,onPatchDots,onPatchPresence,readOnly}:{person:Person;sessionHistory:SessionRecord[];onEdit?:()=>void;onPatchDots?:(id:string,field:"presenceDots"|"activityDots",dots:DotState[])=>void;onPatchPresence?:(id:string,presence:Presence)=>void;readOnly?:boolean;}) {
  return (
    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.radiusLg,padding:"7px 10px",transition:"box-shadow 0.15s,border-color 0.15s",WebkitTapHighlightColor:"transparent"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
        <Avatar name={person.name} size={24}/>
        <span style={{fontWeight:700,fontSize:"0.92rem",color:T.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",minWidth:0}}>{person.name}</span>
        {!readOnly&&(
          <button onClick={onEdit} style={{padding:"2px 7px",borderRadius:T.radius,background:T.bg,border:`1px solid ${T.border}`,color:T.textSub,fontSize:"0.63rem",fontWeight:600,cursor:"pointer",flexShrink:0,lineHeight:1.5}}>Edit</button>
        )}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4,flexWrap:"nowrap"}}>
        {person.role&&<span style={{...roleStyle(person.role),flexShrink:0}}>{person.role}</span>}
        {!readOnly?(
          <button onClick={e=>{e.stopPropagation();if(!onPatchPresence)return;const idx=PRES_V.indexOf(person.presence);const next=PRES_V[(idx+1)%PRES_V.length];onPatchPresence(person.id,next);}} style={{...presStyle(person.presence),cursor:"pointer",border:"none",flexShrink:0}}>{person.presence} ⟳</button>
        ):(
          <span style={{...presStyle(person.presence),flexShrink:0}}>{person.presence}</span>
        )}
        <span style={{...actStyle(person.activity),flexShrink:0}}>{person.activity}</span>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:4}}>
        <div style={{flex:1}}><DotsRow dots={normDots(person.presenceDots)} label="P" sessionHistory={sessionHistory} onChange={readOnly?undefined:(d)=>onPatchDots?.(person.id,"presenceDots",d)} readOnly={readOnly} compact/></div>
        <div style={{flex:1}}><DotsRow dots={normDots(person.activityDots)} label="A" onChange={readOnly?undefined:(d)=>onPatchDots?.(person.id,"activityDots",d)} readOnly={readOnly} compact/></div>
      </div>
      {(person.phone||person.email)&&(
        <div style={{display:"flex",gap:10,fontSize:"0.66rem",color:T.textMuted,borderTop:`1px solid ${T.borderSub}`,paddingTop:4}}>
          {person.phone&&<span>{person.phone}</span>}
          {person.email&&<span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{person.email}</span>}
        </div>
      )}
    </div>
  );
}

// ─── People Tab ────────────────────────────────────────────────
function PeopleTab({people,dbPath,showRole,addLabel,emptyText,onPromote,sessionHistory,readOnly}:{people:Person[];dbPath:PersonType;showRole:boolean;addLabel:string;emptyText:string;onPromote?:(p:Person)=>void;sessionHistory:SessionRecord[];readOnly?:boolean}) {
  const [search,setSearch]=useState("");
  const [sortBy,setSortBy]=useState<SortField>("name");
  const [sortDir,setSortDir]=useState<1|-1>(1);
  const [fPres,setFPres]=useState("all");
  const [fAct,setFAct]=useState("all");
  const [fRole,setFRole]=useState("all");
  const [edit,setEdit]=useState<(Partial<Person>&{_new?:boolean})|null>(null);
  const [isMobile,setIsMobile]=useState(window.innerWidth<640);
  useEffect(()=>{const fn=()=>setIsMobile(window.innerWidth<640);window.addEventListener("resize",fn);return()=>window.removeEventListener("resize",fn);},[]);

  const patchDots=useCallback((id:string,field:"presenceDots"|"activityDots",dots:DotState[])=>{
    update(ref(db,`${dbPath}/${id}`),{[field]:dots}).then(()=>showToast("Salvat")).catch(()=>showToast("Eroare","err"));
  },[dbPath]);

  const patchPresence=useCallback((id:string,presence:Presence)=>{
    update(ref(db,`${dbPath}/${id}`),{presence}).then(()=>showToast("Prezență actualizată")).catch(()=>showToast("Eroare","err"));
  },[dbPath]);

  const savePerson=async(p:Person)=>{await set(ref(db,`${dbPath}/${p.id}`),p);showToast("Salvat");setEdit(null);};
  const delPerson=async(id:string)=>{if(!confirm("Ștergi această persoană?"))return;await remove(ref(db,`${dbPath}/${id}`));showToast("Șters","info");setEdit(null);};

  const delLastDot=async()=>{
    if(!confirm(`Ștergi ultimul dot de prezență pentru toți ${people.length}?`))return;
    let n=0;
    for(const p of people){const d=[...normDots(p.presenceDots)]as DotState[];let last=-1;for(let i=DOT_N-1;i>=0;i--){if(d[i]!==0){last=i;break;}}if(last>=0){d[last]=0;await update(ref(db,`${dbPath}/${p.id}`),{presenceDots:d});n++;}}
    showToast(`Dot prez. șters pt. ${n}`);
  };

  const delLastActDotAll=async()=>{
    if(!confirm(`Ștergi ultimul dot de activitate pentru toți ${people.length}?`))return;
    let n=0;
    for(const p of people){const d=[...normDots(p.activityDots)]as DotState[];let last=-1;for(let i=DOT_N-1;i>=0;i--){if(d[i]!==0){last=i;break;}}if(last>=0){d[last]=0;await update(ref(db,`${dbPath}/${p.id}`),{activityDots:d});n++;}}
    showToast(`Dot act. șters pt. ${n}`);
  };

  const greenLastActDotAll=async()=>{
    if(!confirm(`Marchezi ultimul dot de activitate verde pentru toți ${people.length}?`))return;
    let n=0;
    for(const p of people){
      const d=[...normDots(p.activityDots)]as DotState[];
      let last=-1;for(let i=DOT_N-1;i>=0;i--){if(d[i]!==0){last=i;break;}}
      if(last>=0){d[last]=1;await update(ref(db,`${dbPath}/${p.id}`),{activityDots:d});n++;}
    }
    showToast(`Act. verde pt. ${n}`);
  };

  const handleImport=async(pp:Person[],type:PersonType)=>{for(const p of pp)await set(ref(db,`${type}/${p.id}`),p);};
  const sort=(f:SortField)=>{if(sortBy===f)setSortDir(d=>d===1?-1:1);else{setSortBy(f);setSortDir(1);}};
  const si=(k:SortField)=>sortBy===k?(sortDir===1?" ↑":" ↓"):"";

  let rows=people.filter(p=>{
    const s=search.toLowerCase();
    if(s&&!(p.name||"").toLowerCase().includes(s)&&!(p.role||"").toLowerCase().includes(s))return false;
    if(fPres!=="all"&&p.presence!==fPres)return false;
    if(fAct!=="all"&&p.activity!==fAct)return false;
    if(fRole!=="all"&&p.role!==fRole)return false;
    return true;
  });
  rows=[...rows].sort((a,b)=>{
    let c=0;
    if(sortBy==="name")c=(a.name||"").localeCompare(b.name||"","ro");
    else if(sortBy==="role"){const ri=ROLES.indexOf(a.role),rj=ROLES.indexOf(b.role);c=(ri<0?99:ri)-(rj<0?99:rj);}
    else if(sortBy==="presence")c=PRES_V.indexOf(a.presence)-PRES_V.indexOf(b.presence);
    else if(sortBy==="activity")c=ACT_V.indexOf(a.activity)-ACT_V.indexOf(b.activity);
    return c*sortDir;
  });

  const blank={id:uid(),name:"",phone:"",email:"",role:"Membru Activ",presence:"Prezent"as Presence,activity:"Medie"as Activity,observations:"",presenceDots:emptyDots(),activityDots:emptyDots(),_new:true};
  const thS:React.CSSProperties={padding:"10px 12px",textAlign:"left",fontSize:"0.61rem",fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",cursor:"pointer",userSelect:"none",background:T.bg,borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap"};
  const tdS:React.CSSProperties={padding:"10px 12px",fontSize:"0.83rem",color:T.text,borderBottom:`1px solid ${T.borderSub}`,verticalAlign:"middle"};

  const searchRow=(
    <div style={{position:"relative",marginBottom:6}}>
      <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.textMuted,fontSize:"0.8rem",pointerEvents:"none"}}>⌕</span>
      <Inp placeholder="Caută după nume sau funcție…" value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:28}}/>
    </div>
  );

  const filterRow=(
    <div className="filter-row" style={{display:"flex",gap:5,marginBottom:6,alignItems:"center",overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none",msOverflowStyle:"none"}}>
      <Sel style={{width:"auto",minWidth:isMobile?90:110,fontSize:"0.76rem",padding:"7px 8px",flexShrink:0}} value={fPres} onChange={e=>setFPres(e.target.value)}>
        <option value="all">Prezență</option>{PRES_V.map(v=><option key={v}>{v}</option>)}
      </Sel>
      <Sel style={{width:"auto",minWidth:isMobile?90:105,fontSize:"0.76rem",padding:"7px 8px",flexShrink:0}} value={fAct} onChange={e=>setFAct(e.target.value)}>
        <option value="all">Activitate</option>{ACT_V.map(v=><option key={v}>{v}</option>)}
      </Sel>
      {showRole&&(
        <Sel style={{width:"auto",minWidth:isMobile?100:120,fontSize:"0.76rem",padding:"7px 8px",flexShrink:0}} value={fRole} onChange={e=>setFRole(e.target.value)}>
          <option value="all">Funcție</option>{ROLES.map(r=><option key={r}>{r}</option>)}
        </Sel>
      )}
    </div>
  );

  const actionRow=!readOnly&&(
    <div style={{display:"flex",gap:5,flexWrap:"nowrap",marginBottom:8,alignItems:"center",overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none",msOverflowStyle:"none"}}>
      <Btn variant="primary" style={{fontSize:"0.72rem",padding:"6px 10px",flexShrink:0}} onClick={()=>setEdit(blank)}>+ {addLabel}</Btn>
      <div style={{width:1,height:18,background:T.border,flexShrink:0}}/>
      <Btn variant="ghost" style={{fontSize:"0.72rem",padding:"6px 8px",flexShrink:0}} onClick={async()=>{try{await exportMembers(people,dbPath==="members"?"Membri":"Aspiranți");showToast("Export");}catch{showToast("Eroare","err");}}}>↓ Exp.</Btn>
      <ImportBtn onImport={handleImport}/>
      <div style={{width:1,height:18,background:T.border,flexShrink:0}}/>
      {people.length>0&&<Btn variant="danger" style={{fontSize:"0.68rem",padding:"5px 7px",flexShrink:0}} onClick={delLastDot} title="Șterge ultimul dot prezență">⌫P</Btn>}
      {people.length>0&&<>
        <Btn variant="ghost" style={{fontSize:"0.68rem",padding:"5px 7px",borderColor:T.greenBorder,color:T.green,flexShrink:0}} onClick={greenLastActDotAll} title="Marchează ultimul dot activitate verde">✓A</Btn>
        <Btn variant="danger" style={{fontSize:"0.68rem",padding:"5px 7px",flexShrink:0}} onClick={delLastActDotAll} title="Șterge ultimul dot activitate">⌫A</Btn>
      </>}
    </div>
  );

  return(
    <div>
      {edit&&!readOnly&&<PersonModal person={edit} showRole={showRole} onSave={savePerson} onDelete={edit._new?undefined:()=>delPerson(edit.id!)} onClose={()=>setEdit(null)}/>}
      <StatBar people={people}/>
      {searchRow}
      {filterRow}
      {actionRow}
      <div style={{fontSize:"0.67rem",color:T.textMuted,marginBottom:6,fontWeight:500}}>{rows.length} din {people.length}</div>
      {isMobile?(
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {rows.length===0&&<div style={{textAlign:"center",padding:"3rem",color:T.textMuted,fontStyle:"italic"}}>{search?"Niciun rezultat":emptyText}</div>}
          {rows.map(p=><MemberCard key={p.id} person={p} sessionHistory={sessionHistory} onEdit={()=>setEdit(p)} onPatchDots={readOnly?undefined:patchDots} onPatchPresence={readOnly?undefined:patchPresence} readOnly={readOnly}/>)}
        </div>
      ):(
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.radiusLg,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:showRole?860:760}}>
              <thead>
                <tr>
                  <th style={{...thS,width:"16%"}} onClick={()=>sort("name")}>Nume{si("name")}</th>
                  {showRole&&<th style={{...thS,width:"12%"}} onClick={()=>sort("role")}>Funcție{si("role")}</th>}
                  <th style={{...thS,width:"22%",cursor:"default"}}>Prezență · 20</th>
                  <th style={{...thS,width:"22%",cursor:"default"}}>Activitate · 20</th>
                  <th style={{...thS,width:"9%"}}>Telefon</th>
                  <th style={{...thS,width:"9%"}}>Email</th>
                  <th style={{...thS,width:onPromote?"10%":"7%"}}/>
                </tr>
              </thead>
              <tbody>
                {rows.length===0&&<tr><td colSpan={showRole?7:6} style={{...tdS,textAlign:"center",padding:"3rem",color:T.textMuted,fontStyle:"italic"}}>{search?"Niciun rezultat":emptyText}</td></tr>}
                {rows.map((p,i)=>(
                  <tr key={p.id} className="trow" style={{background:i%2===0?T.surface:T.bg}}>
                    <td style={tdS}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={p.name} size={28}/><span style={{fontWeight:600,fontSize:"0.83rem"}}>{p.name||"—"}</span></div></td>
                    {showRole&&<td style={tdS}><span style={roleStyle(p.role)}>{p.role||"Membru"}</span></td>}
                    <td style={{...tdS,padding:"8px 12px"}}><DotsRow dots={normDots(p.presenceDots)} label="P" onChange={readOnly?undefined:d=>patchDots(p.id,"presenceDots",d)} sessionHistory={sessionHistory} readOnly={readOnly}/></td>
                    <td style={{...tdS,padding:"8px 12px"}}><DotsRow dots={normDots(p.activityDots)} label="A" onChange={readOnly?undefined:d=>patchDots(p.id,"activityDots",d)} readOnly={readOnly}/></td>
                    <td style={{...tdS,fontSize:"0.75rem",color:T.textSub}}>{p.phone||"—"}</td>
                    <td style={{...tdS,fontSize:"0.72rem",color:T.textSub,maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.email||"—"}</td>
                    <td style={{...tdS,whiteSpace:"nowrap"}}>
                      {!readOnly&&<div style={{display:"flex",gap:4}}>
                        <Btn variant="ghost" style={{padding:"5px 8px",fontSize:"0.7rem"}} onClick={()=>setEdit(p)}>Editează</Btn>
                        {onPromote&&<Btn variant="ghost" style={{padding:"5px 8px",fontSize:"0.7rem",borderColor:T.greenBorder,color:T.green}} onClick={()=>onPromote(p)}>↑</Btn>}
                      </div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div style={{marginTop:10,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",fontSize:"0.67rem",color:T.textMuted}}>
        <span style={{fontWeight:600}}>Dots:</span>
        {[{c:T.surface,b:T.border,l:"Neînregistrat"},{c:T.green,b:"#15803D",l:"Prezent/Activ"},{c:T.amber,b:"#B45309",l:"Justificat/Mediu"},{c:T.red,b:"#B91C1C",l:"Absent/Slab"}].map(x=>(
          <span key={x.l} style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:9,height:9,borderRadius:"50%",background:x.c,border:`1.5px solid ${x.b}`,display:"inline-block"}}/>{x.l}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Session History ──────────────────────────────────────────
function SessionHistoryPanel({sessions,members,aspirants,readOnly}:{sessions:SessionRecord[];members:Person[];aspirants:Person[];readOnly?:boolean}) {
  const [expanded,setExpanded]=useState<string|null>(null);
  const all=[...members,...aspirants];

  const deleteSession=async(s:SessionRecord,e:React.MouseEvent)=>{
    e.stopPropagation();
    if(!confirm("Ștergi această ședință din istoric?"))return;
    await remove(ref(db,`session_history/${s.id}`));
    showToast("Ședință ștearsă","info");
    if(expanded===s.id)setExpanded(null);
  };

  if(!sessions.length)return<div style={{textAlign:"center",padding:"3rem",color:T.textMuted,fontStyle:"italic",fontSize:"0.88rem"}}>Nicio ședință salvată încă.</div>;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {[...sessions].sort((a,b)=>b.createdAt-a.createdAt).map(s=>{
        const exp=expanded===s.id;
        const att=(s.attendees||[]).map(id=>all.find(p=>p.id===id)?.name||"?");
        const pct=s.totalMembers>0?Math.round(att.length/s.totalMembers*100):0;
        const pc=pct>=75?T.green:pct>=50?T.amber:T.red;
        return(
          <div key={s.id} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.radiusLg,overflow:"hidden"}}>
            <div onClick={()=>setExpanded(exp?null:s.id)} style={{padding:"13px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:pc,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:"0.87rem",color:T.text}}>{s.sessionName}</div>
                <div style={{fontSize:"0.71rem",color:T.textMuted,marginTop:2}}>{s.date} · {att.length}/{s.totalMembers} prezenți</div>
              </div>
              <div style={{fontFamily:T.fontDisplay,fontSize:"1.25rem",color:pc,fontWeight:400,flexShrink:0}}>{pct}%</div>
              {!readOnly&&(
                <button onClick={e=>deleteSession(s,e)} style={{padding:"4px 8px",borderRadius:T.radius,background:T.redBg,color:T.red,border:`1px solid ${T.redBorder}`,cursor:"pointer",fontSize:"0.68rem",fontWeight:600,flexShrink:0}}>🗑</button>
              )}
              <span style={{color:T.textMuted,fontSize:"0.68rem"}}>{exp?"↑":"↓"}</span>
            </div>
            {exp&&(
              <div style={{borderTop:`1px solid ${T.borderSub}`,padding:"13px 16px"}}>
                <div style={{height:3,background:T.borderSub,borderRadius:2,marginBottom:12,overflow:"hidden"}}><div style={{height:"100%",background:pc,width:`${pct}%`,borderRadius:2,transition:"width 0.4s"}}/></div>
                <div style={{fontSize:"0.67rem",fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Prezenți ({att.length})</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
                  {att.length===0&&<span style={{color:T.textMuted,fontStyle:"italic",fontSize:"0.8rem"}}>Nimeni</span>}
                  {att.map((name,i)=><span key={i} style={{background:T.greenBg,color:T.green,border:`1px solid ${T.greenBorder}`,padding:"3px 9px",borderRadius:20,fontSize:"0.71rem",fontWeight:500}}>{name}</span>)}
                </div>
                {s.totalMembers-att.length>0&&<>
                  <div style={{fontSize:"0.67rem",fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Absenți ({s.totalMembers-att.length})</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {all.filter(p=>!(s.attendees||[]).includes(p.id)).map(p=><span key={p.id} style={{background:T.redBg,color:T.red,border:`1px solid ${T.redBorder}`,padding:"3px 9px",borderRadius:20,fontSize:"0.71rem",fontWeight:500}}>{p.name}</span>)}
                  </div>
                </>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── ReservationsTab ────────────────────────────────────────────
function ReservationsTab({reservations}:{reservations:Reservation[]}) {
  const [search,setSearch]=useState("");
  const thS:React.CSSProperties={padding:"10px 12px",textAlign:"left",fontSize:"0.61rem",fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",background:T.bg,borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap"};
  const tdS:React.CSSProperties={padding:"10px 12px",fontSize:"0.83rem",color:T.text,borderBottom:`1px solid ${T.borderSub}`,verticalAlign:"middle"};

  const delRes=async(id:string)=>{
    if(!confirm("Ștergi această rezervare?"))return;
    await remove(ref(db,`reservations/${id}`));
    showToast("Rezervare ștearsă","info");
  };

  const rows=reservations.filter(r=>{
    const s=search.toLowerCase();
    if(!s)return true;
    return (r.name||"").toLowerCase().includes(s)||(r.projectTitle||"").toLowerCase().includes(s)||(r.email||"").toLowerCase().includes(s);
  }).sort((a,b)=>(b.timestamp||"").localeCompare(a.timestamp||""));

  const totalDonation=reservations.reduce((s,r)=>s+(r.minDonation||0),0);

  return(
    <div>
      <div style={{display:"flex",background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.radiusLg,overflow:"hidden",marginBottom:12}}>
        <div style={{flex:1,padding:"10px 4px",textAlign:"center",borderRight:`1px solid ${T.borderSub}`}}>
          <div style={{fontFamily:T.fontDisplay,fontSize:"1.25rem",color:T.text,lineHeight:1}}>{reservations.length}</div>
          <div style={{fontSize:"0.52rem",color:T.textMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginTop:2}}>Total rezervări</div>
        </div>
        <div style={{flex:1,padding:"10px 4px",textAlign:"center"}}>
          <div style={{fontFamily:T.fontDisplay,fontSize:"1.25rem",color:T.green,lineHeight:1}}>{totalDonation} RON</div>
          <div style={{fontSize:"0.52rem",color:T.textMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginTop:2}}>Donații minime potențiale</div>
        </div>
      </div>

      <div style={{position:"relative",marginBottom:10}}>
        <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.textMuted,fontSize:"0.8rem",pointerEvents:"none"}}>⌕</span>
        <Inp placeholder="Caută după nume, email sau eveniment…" value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:28}}/>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <Btn variant="primary" style={{fontSize:"0.76rem"}} disabled={reservations.length===0}
          onClick={async()=>{try{await exportReservations(reservations);showToast("Export gata");}catch{showToast("Eroare","err");}}}>
          ↓ Exportă Excel
        </Btn>
      </div>

      <div style={{fontSize:"0.67rem",color:T.textMuted,marginBottom:6,fontWeight:500}}>{rows.length} din {reservations.length}</div>

      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.radiusLg,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:760}}>
            <thead>
              <tr>
                <th style={thS}>Nume</th>
                <th style={thS}>Email</th>
                <th style={thS}>Telefon</th>
                <th style={thS}>Eveniment</th>
                <th style={thS}>Donație</th>
                <th style={thS}>Data</th>
                <th style={thS}/>
              </tr>
            </thead>
            <tbody>
              {rows.length===0&&<tr><td colSpan={7} style={{...tdS,textAlign:"center",padding:"3rem",color:T.textMuted,fontStyle:"italic"}}>{search?"Niciun rezultat":"Nicio rezervare încă."}</td></tr>}
              {rows.map((r,i)=>(
                <tr key={r.id} className="trow" style={{background:i%2===0?T.surface:T.bg}}>
                  <td style={tdS}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={r.name} size={26}/><span style={{fontWeight:600,fontSize:"0.83rem"}}>{r.name}</span></div></td>
                  <td style={{...tdS,fontSize:"0.75rem",color:T.textSub}}>{r.email}</td>
                  <td style={{...tdS,fontSize:"0.75rem",color:T.textSub}}>{r.phone}</td>
                  <td style={tdS}>{r.projectTitle}</td>
                  <td style={tdS}><span style={{background:T.amberBg,color:T.amber,border:`1px solid ${T.amberBorder}`,padding:"2px 8px",borderRadius:20,fontSize:"0.71rem",fontWeight:600}}>{r.minDonation} RON</span></td>
                  <td style={{...tdS,fontSize:"0.75rem",color:T.textSub,whiteSpace:"nowrap"}}>{r.timestamp?new Date(r.timestamp).toLocaleString("ro-RO"):"—"}</td>
                  <td style={tdS}><Btn variant="danger" style={{padding:"5px 8px",fontSize:"0.7rem"}} onClick={()=>delRes(r.id)}>Șterge</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── CheckInTab ───────────────────────────────────────────────
function CheckInTab({members,aspirants,qrSession,onNewSession,sessions}:{members:Person[];aspirants:Person[];qrSession:QRSession|null;onNewSession:(s:QRSession|null)=>void;sessions:SessionRecord[];}) {
  const [name,setName]=useState("");const [timeLeft,setTimeLeft]=useState(0);
  const [checkedIn,setCheckedIn]=useState<{id:string;name:string;type:string;at:number}[]>([]);
  const [subTab,setSubTab]=useState<"live"|"history">("live");
  useEffect(()=>{if(!qrSession)return;const t=()=>setTimeLeft(Math.max(0,qrSession.expiresAt-Date.now()));t();const iv=setInterval(t,1000);return()=>clearInterval(iv);},[qrSession]);
  useEffect(()=>{if(!qrSession)return;const u=onValue(ref(db,`checkin_sessions/${qrSession.code}/checkins`),snap=>{setCheckedIn(snap.val()?Object.values(snap.val()):[]);});return()=>u();},[qrSession]);
  const gen=async()=>{
    let lat:number|null=null,lng:number|null=null;
    try{const p=await new Promise<GeolocationPosition>((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:8000,enableHighAccuracy:true}));lat=p.coords.latitude;lng=p.coords.longitude;}catch{}
    const code=genCode(),now=Date.now();
    const s:QRSession={code,createdAt:now,expiresAt:now+QR_DUR,sessionName:name.trim()||`Ședință ${toDay()}`,...(lat!==null&&lng!==null?{lat,lng}:{})};
    await set(ref(db,`checkin_sessions/${code}`),{...s,checkins:{}});onNewSession(s);setName("");setCheckedIn([]);showToast("Sesiune generată");
  };
  const close=async()=>{
    if(!qrSession||!confirm("Aplici prezența și închizi?"))return;
    const ids=new Set(checkedIn.map(c=>c.id));
    const all=[...members.map(m=>({...m,pt:"members"as const})),...aspirants.map(a=>({...a,pt:"aspirants"as const}))];
    for(const p of all){if(!ids.has(p.id)){const d:DotState[]=normDots(p.presenceDots);const i=d.findIndex(x=>x===0);d[i>=0?i:DOT_N-1]=3;await update(ref(db,`${p.pt}/${p.id}`),{presenceDots:d,presence:"Absent"});}}
    const rec:SessionRecord={id:uid(),code:qrSession.code,sessionName:qrSession.sessionName,date:toDay(),createdAt:qrSession.createdAt,attendees:checkedIn.map(c=>c.id),totalMembers:all.length};
    await set(ref(db,`session_history/${rec.id}`),rec);await remove(ref(db,`checkin_sessions/${qrSession.code}`));onNewSession(null);setCheckedIn([]);showToast("Prezență aplicată");
  };
  const url=qrSession?`${window.location.origin}${window.location.pathname}?checkin=${qrSession.code}`:"";
  const mins=Math.floor(timeLeft/60000),secs=Math.floor((timeLeft%60000)/1000);
  const expired=timeLeft===0&&!!qrSession,total=members.length+aspirants.length;
  return(
    <div>
      <div style={{display:"flex",gap:2,background:T.bg,border:`1px solid ${T.border}`,borderRadius:T.radiusLg,padding:3,marginBottom:16}}>
        {(["live","history"]as const).map(t=>(
          <button key={t} onClick={()=>setSubTab(t)} style={{flex:1,padding:"8px",borderRadius:12,fontSize:"0.8rem",fontWeight:subTab===t?700:500,border:"none",cursor:"pointer",background:subTab===t?T.surface:"transparent",color:subTab===t?T.text:T.textSub,boxShadow:subTab===t?T.shadow:"none",transition:"all 0.15s"}}>
            {t==="live"?"● Live":`Istoric (${sessions.length})`}
          </button>
        ))}
      </div>
      {subTab==="history"&&<SessionHistoryPanel sessions={sessions} members={members} aspirants={aspirants} readOnly={false}/>}
      {subTab==="live"&&(()=>{
        if(expired)return<div style={{textAlign:"center",padding:"3rem",background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.radiusLg}}><div style={{fontSize:"1.8rem",marginBottom:10}}>⏱</div><div style={{fontWeight:600,marginBottom:12}}>Sesiunea a expirat</div><Btn variant="primary" onClick={()=>onNewSession(null)}>QR nou</Btn></div>;
        if(!qrSession)return(
          <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.radiusLg,padding:"20px"}}>
            <div style={{fontFamily:T.fontDisplay,fontSize:"1.1rem",marginBottom:4,fontWeight:400}}>Ședință nouă</div>
            <div style={{fontSize:"0.77rem",color:T.textMuted,marginBottom:4}}>Membrii scanează și marchează prezența direct, fără login.</div>
            <div style={{fontSize:"0.75rem",color:T.amber,background:T.amberBg,border:`1px solid ${T.amberBorder}`,borderRadius:T.radius,padding:"8px 12px",marginBottom:14}}>📍 Vei fi rugat să permiți locația — necesară pentru geofencing.</div>
            <div style={{display:"flex",gap:8}}><Inp placeholder={`Ședință ${toDay()}`} value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&gen()} style={{flex:1}}/><Btn variant="primary" onClick={gen}>Generează QR</Btn></div>
          </div>
        );
        return(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.radiusLg,padding:"20px"}}>
              <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}&margin=10&color=1A1917`} alt="QR" width={180} height={180} style={{borderRadius:T.radius,border:`1px solid ${T.border}`,flexShrink:0}}/>
                <div style={{flex:1,minWidth:180}}>
                  <div style={{fontFamily:T.fontDisplay,fontSize:"1.1rem",fontWeight:400,marginBottom:8}}>{qrSession.sessionName}</div>
                  <div style={{display:"inline-flex",alignItems:"center",gap:8,background:mins<5?T.redBg:T.greenBg,border:`1px solid ${mins<5?T.redBorder:T.greenBorder}`,borderRadius:T.radius,padding:"6px 12px",marginBottom:10}}>
                    <span style={{fontSize:"1rem",fontWeight:700,fontVariantNumeric:"tabular-nums",color:mins<5?T.red:T.green}}>{String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}</span>
                    <span style={{fontSize:"0.7rem",color:mins<5?T.red:T.green}}>rămas</span>
                  </div>
                  <div style={{fontSize:"0.71rem",color:(qrSession as any).lat!=null?T.green:T.amber,marginBottom:12}}>{(qrSession as any).lat!=null?"📍 Geofencing activ":"⚠ Fără geofencing"}</div>
                  <div style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.71rem",color:T.textSub,marginBottom:4}}><span>{checkedIn.length} / {total}</span><span style={{fontWeight:600,color:T.green}}>{total>0?Math.round(checkedIn.length/total*100):0}%</span></div>
                    <div style={{height:3,background:T.borderSub,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",background:T.green,borderRadius:2,width:`${total>0?checkedIn.length/total*100:0}%`,transition:"width 0.5s"}}/></div>
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <Btn variant="secondary" style={{fontSize:"0.75rem"}} onClick={()=>{navigator.clipboard?.writeText(url);showToast("Link copiat");}}>Copiază link</Btn>
                    <Btn variant="primary" style={{background:T.green,fontSize:"0.75rem"}} onClick={close}>✓ Aplică & închide</Btn>
                  </div>
                </div>
              </div>
            </div>
            <div style={{fontWeight:600,fontSize:"0.84rem",marginBottom:2}}>Au scanat ({checkedIn.length})</div>
            {checkedIn.length===0&&<div style={{padding:"2rem",textAlign:"center",color:T.textMuted,fontSize:"0.84rem",fontStyle:"italic",background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.radiusLg}}>Niciun scan încă.</div>}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[...checkedIn].sort((a,b)=>b.at-a.at).map(c=>(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.radiusLg}}>
                  <Avatar name={c.name} size={30}/>
                  <div style={{flex:1}}><div style={{fontWeight:600,fontSize:"0.85rem"}}>{c.name}</div><div style={{fontSize:"0.69rem",color:T.textMuted}}>{c.type==="member"?"Membru":"Aspirant"} · {new Date(c.at).toLocaleTimeString("ro-RO")}</div></div>
                  <span style={{background:T.greenBg,color:T.green,border:`1px solid ${T.greenBorder}`,padding:"2px 9px",borderRadius:20,fontSize:"0.67rem",fontWeight:600}}>Prezent</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Event Modal (Calendar) ────────────────────────────────────
function EventModal({ event, onSave, onDelete, onClose }: {
  event: Partial<CalEvent> & { _new?: boolean };
  onSave: (e: CalEvent) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [f, setF] = useState({
    title:       event.title       || "",
    date:        event.date        || toDay(),
    time:        event.time        || "",
    endTime:     event.endTime     || "",
    type:        (event.type       || "sedinta") as EventType,
    description: event.description || "",
    location:    event.location    || "",
  });
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF(p => ({ ...p, [k]: e.target.value }));

  const save = () => {
    if (!f.title.trim()) { alert("Completează titlul"); return; }
    if (!f.date)         { alert("Alege data"); return; }
    onSave({ id: event.id || uid(), ...f });
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(26,25,23,0.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: T.surface, width: "100%", maxWidth: 520, borderRadius: `${T.radiusXl} ${T.radiusXl} 0 0`, maxHeight: "94vh", display: "flex", flexDirection: "column", boxShadow: T.shadowMd, animation: "fadeUp 0.22s ease both" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}><div style={{ width: 36, height: 4, borderRadius: 2, background: T.border }} /></div>
        <div style={{ padding: "12px 20px 14px", borderBottom: `1px solid ${T.borderSub}` }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: "1.12rem", fontWeight: 400 }}>{event._new ? "Eveniment nou" : "Editează eveniment"}</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div><Lbl>Titlu</Lbl><Inp value={f.title} onChange={up("title")} placeholder="ex: Ședință board" autoFocus /></div>
          <div><Lbl>Tip</Lbl>
            <Sel value={f.type} onChange={up("type")}>
              {(Object.keys(EVENT_META) as EventType[]).map(k => <option key={k} value={k}>{EVENT_META[k].label}</option>)}
            </Sel>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div style={{ gridColumn: "1 / -1" }}><Lbl>Data</Lbl><Inp type="date" value={f.date} onChange={up("date")} /></div>
            <div><Lbl>Ora start</Lbl><Inp type="time" value={f.time} onChange={up("time")} /></div>
            <div><Lbl>Ora end</Lbl><Inp type="time" value={f.endTime} onChange={up("endTime")} /></div>
          </div>
          <div><Lbl>Locație</Lbl><Inp value={f.location} onChange={up("location")} placeholder="ex: Sala Club" /></div>
          <div><Lbl>Descriere</Lbl>
            <textarea value={f.description} onChange={up("description")} placeholder="Detalii…" rows={3}
              style={{ width: "100%", border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "9px 12px", fontSize: "0.88rem", background: T.surface, color: T.text, resize: "none", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ padding: "12px 20px 20px", borderTop: `1px solid ${T.borderSub}`, display: "flex", gap: 8 }}>
          <Btn variant="primary" style={{ flex: 1 }} onClick={save}>Salvează</Btn>
          {onDelete && <Btn variant="danger" onClick={onDelete}>Șterge</Btn>}
          <Btn variant="secondary" onClick={onClose}>Anulează</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── CalendarTab ───────────────────────────────────────────────
function CalendarTab({
  events,
  sessions,
  readOnly,
}: {
  events: CalEvent[];
  sessions: SessionRecord[];
  readOnly?: boolean;
}) {
  const today = toDay();
  const todayDate = new Date();

  const [view, setView]         = useState<"month" | "list">("month");
  const [monthOffset, setMonth] = useState(0);
  const [filterType, setFilter] = useState<EventType | "all">("all");
  const [edit, setEdit]         = useState<(Partial<CalEvent> & { _new?: boolean }) | null>(null);
  const [selectedDay, setSelDay]= useState<string | null>(null);

  const displayDate = new Date(todayDate.getFullYear(), todayDate.getMonth() + monthOffset, 1);
  const year  = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const days  = getDaysInMonth(year, month);

  const sessionEvents: CalEvent[] = sessions.map(s => ({
    id:    "sess_" + s.id,
    title: s.sessionName,
    date:  s.date,
    type:  "sedinta" as EventType,
    description: `${s.attendees?.length || 0}/${s.totalMembers} prezenți`,
  }));

  const allEvents: CalEvent[] = useMemo(() => {
    const combined = [...events, ...sessionEvents];
    return combined.sort((a, b) => {
      const dc = a.date.localeCompare(b.date);
      if (dc !== 0) return dc;
      return (a.time || "00:00").localeCompare(b.time || "00:00");
    });
  }, [events, sessions]);

  const filtered = filterType === "all" ? allEvents : allEvents.filter(e => e.type === filterType);

  const [wStart, wEnd]   = getWeekRange(0);
  const [w2Start, w2End] = getWeekRange(1);

  const thisWeek = filtered.filter(e => e.date >= wStart  && e.date <= wEnd);
  const nextWeek = filtered.filter(e => e.date >= w2Start && e.date <= w2End);
  const upcoming = filtered.filter(e => e.date > w2End && e.date >= today).slice(0, 20);
  const past     = filtered.filter(e => e.date < today).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

  const monthEventsForDay = (d: Date) => {
    if (!d) return [];
    const ds = dateStr(d);
    return filtered.filter(e => e.date === ds);
  };

  const saveEvent = async (e: CalEvent) => {
    await set(ref(db, `calendar_events/${e.id}`), e);
    setEdit(null);
    showToast("Eveniment salvat");
  };
  const delEvent = async (id: string) => {
    if (!confirm("Ștergi evenimentul?")) return;
    await remove(ref(db, `calendar_events/${id}`));
    setEdit(null);
    showToast("Eveniment șters", "info");
  };

  const EventPill = ({ e, compact = false }: { e: CalEvent; compact?: boolean }) => {
    const m = EVENT_META[e.type];
    const isSess = e.id.startsWith("sess_");
    return (
      <div
        onClick={() => !isSess && !readOnly && setEdit(e)}
        style={{
          display: "flex", alignItems: "center", gap: compact ? 4 : 8,
          background: m.bg, border: `1px solid ${m.border}`, borderRadius: T.radius,
          padding: compact ? "2px 5px" : "8px 12px",
          cursor: (!isSess && !readOnly) ? "pointer" : "default",
          transition: "opacity 0.12s",
          marginBottom: compact ? 1 : 0,
          overflow: "hidden",
        }}
      >
        <span style={{ width: compact ? 5 : 7, height: compact ? 5 : 7, borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
        {!compact && <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "0.84rem", color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
          <div style={{ fontSize: "0.69rem", color: T.textSub, marginTop: 1, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {e.time && <span>⏱ {e.time}{e.endTime ? ` – ${e.endTime}` : ""}</span>}
            {e.location && <span>📍 {e.location}</span>}
            <span style={{ color: m.color, fontWeight: 600 }}>{m.label}</span>
          </div>
          {e.description && <div style={{ fontSize: "0.68rem", color: T.textMuted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.description}</div>}
        </div>}
        {compact && <span style={{ fontSize: "0.58rem", color: m.color, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{e.title}</span>}
      </div>
    );
  };

  const Section = ({ title, evs, badge, badgeColor }: { title: string; evs: CalEvent[]; badge?: string; badgeColor?: string }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ fontFamily: T.fontDisplay, fontSize: "1rem", fontWeight: 400, color: T.text }}>{title}</div>
        {badge && <span style={{ background: badgeColor || T.accentBg, color: badgeColor ? "#fff" : T.accent, border: `1px solid ${badgeColor || T.accentSub}`, borderRadius: 20, fontSize: "0.63rem", fontWeight: 700, padding: "1px 8px" }}>{badge}</span>}
      </div>
      {evs.length === 0
        ? <div style={{ padding: "14px 16px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, color: T.textMuted, fontSize: "0.82rem", fontStyle: "italic" }}>Niciun eveniment.</div>
        : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{evs.map(e => <EventPill key={e.id} e={e} />)}</div>
      }
    </div>
  );

  return (
    <div style={{ fontFamily: T.fontBody }}>
      {edit && !readOnly && (
        <EventModal
          event={edit}
          onSave={saveEvent}
          onDelete={edit._new ? undefined : () => delEvent(edit.id!)}
          onClose={() => setEdit(null)}
        />
      )}

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 2, background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: 3 }}>
          {(["month", "list"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: "7px 14px", borderRadius: 10, fontSize: "0.79rem", fontWeight: view === v ? 700 : 500, border: "none", cursor: "pointer", background: view === v ? T.text : "transparent", color: view === v ? "#fff" : T.textSub, transition: "all 0.15s" }}>
              {v === "month" ? "📅 Lună" : "☰ Listă"}
            </button>
          ))}
        </div>

        <select value={filterType} onChange={e => setFilter(e.target.value as any)}
          style={{ padding: "7px 10px", borderRadius: T.radius, border: `1px solid ${T.border}`, background: T.surface, fontSize: "0.79rem", color: T.text, outline: "none", cursor: "pointer" }}>
          <option value="all">Toate tipurile</option>
          {(Object.keys(EVENT_META) as EventType[]).map(k => <option key={k} value={k}>{EVENT_META[k].label}</option>)}
        </select>

        <div style={{ flex: 1 }} />

        <Btn variant="ghost" style={{ fontSize: "0.76rem" }} onClick={() => exportIcal(events, sessions)}>
          ↓ Export iCal
        </Btn>

        {!readOnly && (
          <Btn variant="primary" style={{ fontSize: "0.79rem" }} onClick={() => setEdit({ _new: true, date: today, type: "sedinta" })}>
            + Eveniment
          </Btn>
        )}
      </div>

      {/* ── MONTH VIEW ── */}
      {view === "month" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <button onClick={() => setMonth(m => m - 1)}
              style={{ width: 32, height: 32, borderRadius: T.radius, border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
            <div style={{ fontFamily: T.fontDisplay, fontSize: "1.2rem", fontWeight: 400, color: T.text, minWidth: 160, textAlign: "center" }}>
              {MONTHS_RO[month]} {year}
            </div>
            <button onClick={() => setMonth(m => m + 1)}
              style={{ width: 32, height: 32, borderRadius: T.radius, border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
            {monthOffset !== 0 && (
              <button onClick={() => setMonth(0)}
                style={{ padding: "4px 10px", borderRadius: T.radius, border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer", fontSize: "0.72rem", color: T.textSub }}>Azi</button>
            )}
          </div>

          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${T.border}` }}>
              {DAYS_RO.map(d => (
                <div key={d} style={{ padding: "8px 4px", textAlign: "center", fontSize: "0.63rem", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
              {days.map((d, i) => {
                const ds  = d ? dateStr(d) : "";
                const evs = d ? monthEventsForDay(d) : [];
                const isToday  = ds === today;
                const isSel    = ds === selectedDay;
                const isOtherM = d && d.getMonth() !== month;
                const dow      = d?.getDay();
                const isWeekend = dow === 0 || dow === 6;
                return (
                  <div key={i} onClick={() => d && setSelDay(isSel ? null : ds)}
                    style={{
                      minHeight: 70, padding: "4px", borderRight: i % 7 !== 6 ? `1px solid ${T.borderSub}` : "none",
                      borderBottom: i < days.length - 7 ? `1px solid ${T.borderSub}` : "none",
                      background: isSel ? T.accentBg : isToday ? "#FFFBEB" : isWeekend ? "#FAFAF9" : T.surface,
                      cursor: d ? "pointer" : "default", transition: "background 0.12s",
                      opacity: isOtherM ? 0.35 : 1,
                    }}>
                    {d && (
                      <>
                        <div style={{
                          width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                          background: isToday ? T.accent : "transparent",
                          color: isToday ? "#fff" : isSel ? T.accent : T.text,
                          fontSize: "0.75rem", fontWeight: isToday || isSel ? 700 : 400, marginBottom: 2,
                        }}>{d.getDate()}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {evs.slice(0, 2).map(e => <EventPill key={e.id} e={e} compact />)}
                          {evs.length > 2 && <div style={{ fontSize: "0.55rem", color: T.textMuted, paddingLeft: 5 }}>+{evs.length - 2}</div>}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {selectedDay && (
            <div style={{ marginTop: 14, background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontFamily: T.fontDisplay, fontSize: "0.98rem", fontWeight: 400 }}>{formatDateRo(selectedDay)}</div>
                {!readOnly && (
                  <Btn variant="primary" style={{ fontSize: "0.72rem", padding: "5px 10px" }} onClick={() => setEdit({ _new: true, date: selectedDay, type: "sedinta" })}>+ Adaugă</Btn>
                )}
              </div>
              {filtered.filter(e => e.date === selectedDay).length === 0
                ? <div style={{ color: T.textMuted, fontSize: "0.82rem", fontStyle: "italic" }}>Niciun eveniment în această zi.</div>
                : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {filtered.filter(e => e.date === selectedDay).map(e => <EventPill key={e.id} e={e} />)}
                  </div>
              }
            </div>
          )}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === "list" && (
        <div>
          <Section
            title="Săptămâna aceasta"
            evs={thisWeek}
            badge={thisWeek.length > 0 ? String(thisWeek.length) : undefined}
            badgeColor={thisWeek.length > 0 ? T.accent : undefined}
          />
          <Section
            title="Săptămâna viitoare"
            evs={nextWeek}
            badge={nextWeek.length > 0 ? String(nextWeek.length) : undefined}
          />
          {upcoming.length > 0 && (
            <Section title="Urmează" evs={upcoming} />
          )}
          {past.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: T.fontDisplay, fontSize: "1rem", fontWeight: 400, color: T.textMuted, marginBottom: 10 }}>Trecut</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, opacity: 0.55 }}>
                {past.map(e => <EventPill key={e.id} e={e} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Legendă ── */}
      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", fontSize: "0.67rem", color: T.textMuted }}>
        <span style={{ fontWeight: 600 }}>Tipuri:</span>
        {(Object.keys(EVENT_META) as EventType[]).map(k => (
          <span key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: EVENT_META[k].dot, display: "inline-block" }} />
            {EVENT_META[k].label}
          </span>
        ))}
        <span style={{ marginLeft: "auto", color: T.textMuted }}>
          {allEvents.length} evenimente totale
        </span>
      </div>
    </div>
  );
}

// ─── CheckIn Page (self-service) ──────────────────────────────
function haversineM(la1:number,lo1:number,la2:number,lo2:number):number{
  const R=6371000,r=(d:number)=>d*Math.PI/180;
  const dLa=r(la2-la1),dLo=r(lo2-lo1);
  const a=Math.sin(dLa/2)**2+Math.cos(r(la1))*Math.cos(r(la2))*Math.sin(dLo/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
const GEO_R=50;

function CheckInPage({code}:{code:string}) {
  const [members,setMembers]=useState<Person[]>([]);
  const [aspirants,setAspirants]=useState<Person[]>([]);
  const [session,setSession]=useState<QRSession|null>(null);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState<{p:Person;type:string}|null>(null);
  const [done,setDone]=useState(false);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [geo,setGeo]=useState<"idle"|"requesting"|"granted"|"far"|"denied">("idle");

  useEffect(()=>{
    if(localStorage.getItem(`checkin_done_${code}`)==="1"){
      setDone(true);
      setLoading(false);
    }
  },[code]);

  useEffect(()=>{
    if(error||done)return;
    onValue(ref(db,`checkin_sessions/${code}`),snap=>{
      if(!snap.val()){setError("Sesiunea nu există sau a expirat.");setLoading(false);return;}
      const s=snap.val()as QRSession;
      if(Date.now()>s.expiresAt){setError("Sesiunea a expirat.");setLoading(false);return;}
      setSession(s);
    },{onlyOnce:true});
    onValue(ref(db,"members"),snap=>{setMembers(snap.val()?Object.values(snap.val()):[]);},{onlyOnce:true});
    onValue(ref(db,"aspirants"),snap=>{setAspirants(snap.val()?Object.values(snap.val()):[]);setLoading(false);},{onlyOnce:true});
  },[code,error,done]);

  const all=[...members.map(p=>({p,type:"member"})),...aspirants.map(p=>({p,type:"aspirant"}))].filter(({p})=>search.length<2||(p.name||"").toLowerCase().includes(search.toLowerCase()));

  const reqGeo=()=>{
    const sa=session as any;
    if(sa?.lat==null){setGeo("granted");return;}
    setGeo("requesting");
    navigator.geolocation.getCurrentPosition(
      pos=>{const d=haversineM(sa.lat,sa.lng,pos.coords.latitude,pos.coords.longitude);setGeo(d>GEO_R?"far":"granted");},
      (()=>setGeo("denied")),
      {timeout:12000,enableHighAccuracy:true,maximumAge:0}
    );
  };

  const doConfirm=async()=>{
    if(!selected||!session||busy||geo!=="granted")return;
    setBusy(true);
    try{
      await set(ref(db,`checkin_sessions/${code}/checkins/${selected.p.id}`),{id:selected.p.id,name:selected.p.name,type:selected.type,at:Date.now()});
      const dbp=selected.type==="member"?"members":"aspirants";
      const d:DotState[]=normDots(selected.p.presenceDots);
      const i=d.findIndex(x=>x===0);d[i>=0?i:DOT_N-1]=1;
      await update(ref(db,`${dbp}/${selected.p.id}`),{presence:"Prezent",presenceDots:d});
      localStorage.setItem(`checkin_done_${code}`,"1");
      setDone(true);
    }catch{alert("Eroare.");}
    finally{setBusy(false);}
  };

  const needsGeo=(session as any)?.lat!=null;

  if(loading)return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg,fontFamily:T.fontBody}}>
      <span style={{color:T.textMuted}}>Se încarcă…</span>
    </div>
  );

  if(error)return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg,fontFamily:T.fontBody,padding:"2rem"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:T.redBg,border:`1px solid ${T.redBorder}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:"1.4rem"}}>✕</div>
        <div style={{fontWeight:600,marginBottom:6}}>{error}</div>
        <div style={{fontSize:"0.8rem",color:T.textMuted}}>Cere un nou QR.</div>
      </div>
    </div>
  );

  if(done)return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(160deg,#F0FDF4 0%,#DCFCE7 60%,#BBF7D0 100%)",fontFamily:T.fontBody,padding:"2rem",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap');
        @keyframes scaleIn{0%{transform:scale(0.5);opacity:0;}60%{transform:scale(1.08);}100%{transform:scale(1);opacity:1;}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(22,163,74,0.3);}50%{box-shadow:0 0 0 16px rgba(22,163,74,0);}}
      `}</style>
      <div style={{textAlign:"center",maxWidth:360}}>
        <div style={{width:100,height:100,borderRadius:"50%",background:T.green,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",animation:"scaleIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both, pulse 2s ease 0.5s infinite"}}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div style={{fontFamily:T.fontDisplay,fontSize:"1.9rem",color:T.green,marginBottom:8,fontWeight:400,animation:"fadeSlide 0.4s 0.3s both"}}>
          Prezență confirmată!
        </div>
        <div style={{fontWeight:700,fontSize:"1.1rem",color:T.text,marginBottom:4,animation:"fadeSlide 0.4s 0.4s both"}}>
          {selected?.p.name||""}
        </div>
        <div style={{fontSize:"0.85rem",color:T.textSub,marginBottom:24,animation:"fadeSlide 0.4s 0.5s both"}}>
          {session?.sessionName||""}
        </div>
        <div style={{display:"inline-block",background:T.greenBg,border:`1px solid ${T.greenBorder}`,borderRadius:T.radiusLg,padding:"10px 20px",fontSize:"0.82rem",color:T.green,fontWeight:600,animation:"fadeSlide 0.4s 0.6s both"}}>
          ✓ Ești marcat ca prezent
        </div>
        <div style={{fontSize:"0.74rem",color:T.textMuted,marginTop:20,animation:"fadeSlide 0.4s 0.7s both"}}>
          Poți închide această pagină.
        </div>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:T.fontBody}}>
      <div style={{background:T.text,padding:"1.1rem 1rem 1.3rem",color:"#fff"}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          <div style={{fontFamily:T.fontDisplay,fontSize:"1.15rem",fontWeight:400,marginBottom:2}}>Check-in</div>
          <div style={{fontSize:"0.78rem",opacity:0.55}}>{session?.sessionName}</div>
        </div>
      </div>
      <div style={{maxWidth:480,margin:"0 auto",padding:"1rem"}}>
        <div style={{background:T.accentBg,border:`1px solid ${T.accentSub}`,borderRadius:T.radiusLg,padding:"11px 14px",marginBottom:14,fontSize:"0.82rem",color:T.accent}}>
          Caută-ți numele și selectează-l.
        </div>
        <Inp type="search" placeholder="Scrie numele tău…" value={search} onChange={e=>{setSearch(e.target.value);setSelected(null);setGeo("idle");}} autoComplete="off" autoFocus style={{padding:"13px 14px",fontSize:"0.95rem",borderRadius:T.radiusLg,marginBottom:12}}/>

        {selected&&geo==="idle"&&(
          <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.radiusLg,padding:"14px",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <Avatar name={selected.p.name} size={38}/>
              <div>
                <div style={{fontWeight:600,fontSize:"0.93rem"}}>{selected.p.name}</div>
                <div style={{fontSize:"0.73rem",color:T.textMuted}}>{selected.type==="member"?(selected.p.role||"Membru"):"Aspirant"}</div>
              </div>
            </div>
            {needsGeo&&<div style={{fontSize:"0.77rem",color:T.textSub,marginBottom:10}}>📍 Permite locația pentru a confirma prezența fizică.</div>}
            <Btn variant="primary" style={{width:"100%",justifyContent:"center",padding:"12px",fontSize:"0.9rem"}} onClick={reqGeo}>
              {needsGeo?"Verifică locația și continuă":"Continuă"}
            </Btn>
          </div>
        )}

        {selected&&geo==="requesting"&&(
          <div style={{background:T.accentBg,border:`1px solid ${T.accentSub}`,borderRadius:T.radiusLg,padding:"14px",marginBottom:12,textAlign:"center",fontSize:"0.84rem",color:T.accent}}>
            📍 Se verifică locația…
          </div>
        )}

        {selected&&geo==="far"&&(
          <div style={{marginBottom:12}}>
            <div style={{background:T.redBg,border:`1px solid ${T.redBorder}`,borderRadius:T.radiusLg,padding:"14px",marginBottom:8,textAlign:"center"}}>
              <div style={{fontWeight:600,color:T.red,marginBottom:4}}>Nu ești în apropiere</div>
              <div style={{fontSize:"0.77rem",color:"#B91C1C"}}>Trebuie să fii fizic prezent.</div>
            </div>
            <Btn variant="secondary" style={{width:"100%",justifyContent:"center"}} onClick={()=>{setGeo("idle");setSelected(null);}}>← Înapoi</Btn>
          </div>
        )}

        {selected&&geo==="denied"&&(
          <div style={{marginBottom:12}}>
            <div style={{background:T.amberBg,border:`1px solid ${T.amberBorder}`,borderRadius:T.radiusLg,padding:"14px",marginBottom:8}}>
              <div style={{fontWeight:600,color:T.amber,marginBottom:4}}>Locație blocată</div>
              <div style={{fontSize:"0.77rem",color:"#92400E",lineHeight:1.5}}>iPhone: <strong>Setări → Safari → Locație → Permite</strong></div>
            </div>
            <Btn variant="secondary" style={{width:"100%",justifyContent:"center"}} onClick={()=>{setGeo("idle");setSelected(null);}}>← Înapoi</Btn>
          </div>
        )}

        {selected&&geo==="granted"&&(
          <div style={{background:T.greenBg,border:`1px solid ${T.greenBorder}`,borderRadius:T.radiusLg,padding:"14px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Avatar name={selected.p.name} size={36}/>
              <div>
                <div style={{fontWeight:600,color:T.green}}>{selected.p.name}</div>
                <div style={{fontSize:"0.71rem",color:"#166534"}}>{needsGeo?"📍 Locație ✓  ":""}{selected.type==="member"?(selected.p.role||"Membru"):"Aspirant"}</div>
              </div>
            </div>
            <Btn variant="primary" style={{background:T.green,flexShrink:0,opacity:busy?0.7:1}} onClick={doConfirm} disabled={busy}>
              {busy?"…":"✓ Confirm"}
            </Btn>
          </div>
        )}

        {search.length<2&&<div style={{textAlign:"center",padding:"3rem",color:T.textMuted,fontSize:"0.84rem"}}>Scrie minim 2 litere</div>}
        {search.length>=2&&all.length===0&&<div style={{textAlign:"center",padding:"2rem",color:T.textMuted,fontSize:"0.84rem"}}>Niciun rezultat pentru „{search}".</div>}

        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {all.map(({p,type})=>(
            <div key={p.id} onClick={()=>{setSelected(prev=>prev?.p.id===p.id?null:{p,type});setGeo("idle");}}
              style={{background:selected?.p.id===p.id?T.accentBg:T.surface,border:`1.5px solid ${selected?.p.id===p.id?T.accent:T.border}`,borderRadius:T.radiusLg,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all 0.15s",WebkitTapHighlightColor:"transparent"}}>
              <Avatar name={p.name} size={36}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:"0.9rem"}}>{p.name}</div>
                <div style={{fontSize:"0.71rem",color:T.textMuted,marginTop:2}}>{type==="member"?(p.role||"Membru"):"Aspirant"}</div>
              </div>
              <div style={{width:22,height:22,borderRadius:"50%",background:selected?.p.id===p.id?T.accent:T.bg,border:`1.5px solid ${selected?.p.id===p.id?T.accent:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                {selected?.p.id===p.id&&<span style={{color:"#fff",fontSize:"0.7rem",fontWeight:700}}>✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Read-only View ───────────────────────────────────────────
function ReadOnlyView({members,aspirants,sessions,events,reservations}:{members:Person[];aspirants:Person[];sessions:SessionRecord[];events:CalEvent[];reservations:Reservation[];}) {
  const [tab,setTab]=useState<"members"|"aspirants"|"sessions"|"calendar"|"reservations">("members");
  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:T.fontBody}}>
      <style>{GLOBAL_CSS}</style>
      <div style={{padding:"20px 24px"}}>
        <div style={{display:"flex",gap:2,background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.radiusLg,padding:3,marginBottom:20,width:"fit-content",flexWrap:"wrap"}}>
          {(["members","aspirants","sessions","calendar","reservations"]as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 16px",borderRadius:10,fontSize:"0.79rem",fontWeight:tab===t?700:500,border:"none",cursor:"pointer",background:tab===t?T.text:"transparent",color:tab===t?"#fff":T.textSub,transition:"all 0.15s"}}>
              {t==="members"?`Membri (${members.length})`:t==="aspirants"?`Aspiranți (${aspirants.length})`:t==="sessions"?`Ședințe (${sessions.length})`:t==="calendar"?`Calendar (${events.length})`:`Rezervări (${reservations.length})`}
            </button>
          ))}
        </div>
        {tab==="members"&&<PeopleTab people={members} dbPath="members" showRole addLabel="" emptyText="Niciun membru." sessionHistory={sessions} readOnly/>}
        {tab==="aspirants"&&<PeopleTab people={aspirants} dbPath="aspirants" showRole={false} addLabel="" emptyText="Niciun aspirant." sessionHistory={sessions} readOnly/>}
        {tab==="sessions"&&<SessionHistoryPanel sessions={sessions} members={members} aspirants={aspirants} readOnly={true}/>}
        {tab==="calendar"&&<CalendarTab events={events} sessions={sessions} readOnly={true}/>}
        {tab==="reservations"&&<ReservationsTab reservations={reservations}/>}
      </div>
    </div>
  );
}

// ─── Nav config ────────────────────────────────────────────────
const NAV:[Tab,string][]=[["members","Membri"],["aspirants","Aspiranți"],["checkin","Check-in"],["calendar","Calendar"],["reservations","Rezervări"]];
const PAGE_TITLE:Record<Tab,string>={members:"Membri",aspirants:"Aspiranți",checkin:"Check-in",calendar:"Calendar",reservations:"Rezervări"};
const PAGE_SUB=(tab:Tab,m:number,a:number,s:number,ev:number,r:number):string=>
  tab==="members"?`${m} membri înregistrați`:
  tab==="aspirants"?`${a} aspiranți`:
  tab==="checkin"?`${s} ședințe în istoric`:
  tab==="calendar"?`${ev} evenimente`:
  `${r} rezervări`;

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({tab,setTab,members,aspirants,sessions,events,reservations,connected,readonlyToken,onLink,onRevoke,onExport,onLogout}:{tab:Tab;setTab:(t:Tab)=>void;members:Person[];aspirants:Person[];sessions:SessionRecord[];events:CalEvent[];reservations:Reservation[];connected:boolean;readonlyToken:string|null;onLink:()=>void;onRevoke:()=>void;onExport:()=>void;onLogout:()=>void;}) {
  const counts:Partial<Record<Tab,number>>={members:members.length,aspirants:aspirants.length,calendar:events.length,reservations:reservations.length};
  return(
    <aside style={{width:220,background:T.surface,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,bottom:0,zIndex:50}}>
      <div style={{padding:"18px 16px 12px",borderBottom:`1px solid ${T.borderSub}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:"50%",background:T.text,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:10,flexShrink:0}}>IC</div>
          <div><div style={{fontWeight:700,fontSize:"0.81rem",color:T.text}}>Portal Membri</div><div style={{fontSize:"0.63rem",color:T.textMuted,marginTop:1}}>Interact Cișmigiu</div></div>
        </div>
      </div>
      <nav style={{flex:1,padding:"10px 8px",display:"flex",flexDirection:"column",gap:1}}>
        {NAV.map(([k,label])=>{
          const active=tab===k;const cnt=counts[k];
          return(
            <button key={k} onClick={()=>setTab(k)} className="nav-btn" style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:T.radius,border:"none",cursor:"pointer",background:active?T.bg:"transparent",color:active?T.text:T.textSub,fontWeight:active?600:400,fontSize:"0.83rem",transition:"background 0.15s",textAlign:"left"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:active?T.text:T.border,flexShrink:0,transition:"background 0.2s"}}/>
              <span style={{flex:1}}>{label}</span>
              {cnt!==undefined&&<span style={{fontSize:"0.63rem",fontWeight:600,color:T.textMuted,background:T.bg,padding:"1px 6px",borderRadius:20,border:`1px solid ${T.borderSub}`}}>{cnt}</span>}
            </button>
          );
        })}
        <div style={{marginTop:8,padding:"5px 10px",fontSize:"0.68rem",color:T.textMuted,display:"flex",alignItems:"center",gap:5}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:T.borderSub,flexShrink:0}}/>
          {sessions.length} ședințe
        </div>
      </nav>
      <div style={{padding:"10px 8px 16px",borderTop:`1px solid ${T.borderSub}`,display:"flex",flexDirection:"column",gap:4}}>
        <button onClick={onLink} className="nav-btn" style={{display:"flex",alignItems:"center",gap:7,padding:"8px 10px",borderRadius:T.radius,border:`1px solid ${T.border}`,background:T.surface,color:T.textSub,fontSize:"0.73rem",fontWeight:500,cursor:"pointer",width:"100%",textAlign:"left"}}>
          <span>👁</span><span style={{flex:1}}>{readonlyToken?"Copiază":"Generează"} link read-only</span>
        </button>
        {readonlyToken&&<button onClick={onRevoke} className="nav-btn" style={{display:"flex",alignItems:"center",gap:7,padding:"6px 10px",borderRadius:T.radius,border:"none",background:"transparent",color:T.textMuted,fontSize:"0.7rem",cursor:"pointer",width:"100%",textAlign:"left"}}>Revocă linkul</button>}
        <button onClick={onExport} className="nav-btn" style={{display:"flex",alignItems:"center",gap:7,padding:"8px 10px",borderRadius:T.radius,border:`1px solid ${T.border}`,background:T.surface,color:T.textSub,fontSize:"0.73rem",fontWeight:500,cursor:"pointer",width:"100%",textAlign:"left"}}>
          <span>↓</span><span>Export complet</span>
        </button>
        <div style={{height:1,background:T.borderSub,margin:"4px 2px"}}/>
        <button onClick={onLogout} className="nav-btn" style={{display:"flex",alignItems:"center",gap:7,padding:"8px 10px",borderRadius:T.radius,border:`1px solid ${T.redBorder}`,background:T.redBg,color:T.red,fontSize:"0.73rem",fontWeight:600,cursor:"pointer",width:"100%",textAlign:"left",transition:"all 0.15s"}}>
          <span>→</span><span>Deconectare</span>
        </button>
        <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",fontSize:"0.63rem",color:connected?T.green:T.amber,fontWeight:500}}>
          <span style={{width:5,height:5,borderRadius:"50%",background:connected?T.green:T.amber,flexShrink:0}}/>
          {connected?"conectat live":"offline"}
        </div>
      </div>
    </aside>
  );
}

// ─── Root ─────────────────────────────────────────────────────
export default function MemberDashboard():JSX.Element {
  let logout:()=>void=()=>{};
  try{ const auth=useAuth(); logout=auth.logout; }catch{}

  const [tab,setTab]=useState<Tab>("members");
  const [members,setMembers]=useState<Person[]>([]);
  const [aspirants,setAspirants]=useState<Person[]>([]);
  const [events,setEvents]=useState<CalEvent[]>([]);
  const [reservations,setReservations]=useState<Reservation[]>([]);
  const [connected,setConnected]=useState(false);
  const [qrSession,setQrSession]=useState<QRSession|null>(null);
  const [sessions,setSessions]=useState<SessionRecord[]>([]);
  const [readonlyToken,setReadonlyToken]=useState<string|null>(null);
  const [isMobile,setIsMobile]=useState(window.innerWidth<768);

  useEffect(()=>{
    const fn=()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",fn);
    return()=>window.removeEventListener("resize",fn);
  },[]);

  const params=new URLSearchParams(window.location.search);
  const checkInCode=params.get("checkin");
  const roToken=params.get("view");

  useEffect(()=>{
    if(checkInCode||roToken)return;
    const u1=onValue(ref(db,"members"),s=>{setMembers(s.val()?Object.values(s.val()):[]);setConnected(true);},()=>setConnected(false));
    const u2=onValue(ref(db,"aspirants"),s=>{setAspirants(s.val()?Object.values(s.val()):[]);});
    const u3=onValue(ref(db,"session_history"),s=>{setSessions(s.val()?Object.values(s.val()):[]);});
    const u4=onValue(ref(db,READONLY_TOKEN_PATH),s=>{setReadonlyToken(s.val()||null);});
    const u5=onValue(ref(db,"calendar_events"),s=>{setEvents(s.val()?Object.values(s.val()):[]);});
    const u6=onValue(ref(db,"reservations"),s=>{setReservations(s.val()?Object.values(s.val()):[]);});
    return()=>{u1();u2();u3();u4();u5();u6();};
  },[checkInCode,roToken]);

  useEffect(()=>{
    if(!roToken)return;
    onValue(ref(db,READONLY_TOKEN_PATH),snap=>{
      if(snap.val()!==roToken){
        document.body.innerHTML='<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;color:#78716C;font-size:0.88rem;">Link invalid sau expirat.</div>';
        return;
      }
      const u1=onValue(ref(db,"members"),s=>{setMembers(s.val()?Object.values(s.val()):[]);});
      const u2=onValue(ref(db,"aspirants"),s=>{setAspirants(s.val()?Object.values(s.val()):[]);});
      const u3=onValue(ref(db,"session_history"),s=>{setSessions(s.val()?Object.values(s.val()):[]);});
      const u4=onValue(ref(db,"calendar_events"),s=>{setEvents(s.val()?Object.values(s.val()):[]);});
      const u5=onValue(ref(db,"reservations"),s=>{setReservations(s.val()?Object.values(s.val()):[]);});
      return()=>{u1();u2();u3();u4();u5();};
    },{onlyOnce:true});
  },[roToken]);

  // ── Rute speciale ──
  if(checkInCode)return<><style>{GLOBAL_CSS}</style><CheckInPage code={checkInCode}/></>;
  if(roToken)return<ReadOnlyView members={members} aspirants={aspirants} sessions={sessions} events={events} reservations={reservations}/>;

  const promoteToMember=async(p:Person)=>{if(!confirm(`Promovezi "${p.name}" la Membri?`))return;await set(ref(db,`members/${p.id}`),{...p,role:"Membru Activ"});await remove(ref(db,`aspirants/${p.id}`));showToast(`${p.name} promovat`);};
  const handleLink=async()=>{let t=readonlyToken;if(!t){t=genCode()+genCode();await set(ref(db,READONLY_TOKEN_PATH),t);setReadonlyToken(t);}const url=`${window.location.origin}${window.location.pathname}?view=${t}`;navigator.clipboard?.writeText(url);showToast("Link copiat");};
  const handleRevoke=async()=>{if(!confirm("Revoci linkul?"))return;await remove(ref(db,READONLY_TOKEN_PATH));setReadonlyToken(null);showToast("Link revocat","info");};
  const handleExport=async()=>{try{await exportAll(members,aspirants);showToast("Export gata");}catch{showToast("Eroare","err");}};
  const handleLogout=()=>logout();

  const CONTENT:Record<Tab,React.ReactNode>={
    members:<PeopleTab people={members} dbPath="members" showRole addLabel="Adaugă membru" emptyText="Niciun membru." sessionHistory={sessions}/>,
    aspirants:<PeopleTab people={aspirants} dbPath="aspirants" showRole={false} addLabel="Adaugă aspirant" emptyText="Niciun aspirant." onPromote={promoteToMember} sessionHistory={sessions}/>,
    checkin:<CheckInTab members={members} aspirants={aspirants} qrSession={qrSession} onNewSession={setQrSession} sessions={sessions}/>,
    calendar:<CalendarTab events={events} sessions={sessions} readOnly={false}/>,
    reservations:<ReservationsTab reservations={reservations}/>,
  };

  // ── Mobile ──
  if(isMobile){
    const NH=60;
    return(
      <div style={{minHeight:"100vh",background:T.bg,fontFamily:T.fontBody,paddingBottom:NH}}>
        <style>{GLOBAL_CSS}</style>
        <ToastContainer/>
        <div style={{position:"sticky",top:0,zIndex:40,background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"9px 12px",display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:7,flex:1,minWidth:0}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:T.text,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:8,flexShrink:0}}>IC</div>
            <div style={{minWidth:0}}>
              <div style={{fontFamily:T.fontDisplay,fontSize:"0.92rem",fontWeight:400,color:T.text,lineHeight:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{PAGE_TITLE[tab]}</div>
              <div style={{fontSize:"0.55rem",color:T.textMuted,marginTop:1,whiteSpace:"nowrap"}}>{PAGE_SUB(tab,members.length,aspirants.length,sessions.length,events.length,reservations.length)}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
            <button onClick={handleLink} title={readonlyToken?"Copiează link read-only":"Generează link read-only"} style={{display:"flex",alignItems:"center",justifyContent:"center",width:30,height:30,borderRadius:T.radius,background:T.bg,border:`1px solid ${T.border}`,color:T.textSub,fontSize:"0.78rem",cursor:"pointer",flexShrink:0}}>👁</button>
            <button onClick={handleExport} title="Export complet" style={{display:"flex",alignItems:"center",justifyContent:"center",width:30,height:30,borderRadius:T.radius,background:T.bg,border:`1px solid ${T.border}`,color:T.textSub,fontSize:"0.78rem",cursor:"pointer",flexShrink:0}}>↓</button>
            <div style={{width:1,height:18,background:T.border}}/>
            <button onClick={handleLogout} title="Deconectare" style={{display:"flex",alignItems:"center",justifyContent:"center",width:30,height:30,borderRadius:T.radius,background:T.redBg,border:`1px solid ${T.redBorder}`,color:T.red,fontSize:"0.78rem",fontWeight:700,cursor:"pointer",flexShrink:0}}>→</button>
          </div>
        </div>
        <main style={{padding:"10px 10px 6px"}}>{CONTENT[tab]}</main>
        <nav style={{position:"fixed",bottom:0,left:0,right:0,height:NH,background:T.surface,borderTop:`1px solid ${T.border}`,display:"flex",alignItems:"stretch",zIndex:100}}>
          {NAV.map(([k,label])=>{
            const active=tab===k;
            const cnt=k==="members"?members.length:k==="aspirants"?aspirants.length:k==="calendar"?events.length:k==="reservations"?reservations.length:undefined;
            return(
              <button key={k} onClick={()=>setTab(k)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,border:"none",cursor:"pointer",background:"transparent",color:active?T.text:T.textMuted,position:"relative",transition:"color 0.15s"}}>
                {active&&<div style={{position:"absolute",top:0,left:"25%",right:"25%",height:1.5,background:T.text,borderRadius:"0 0 2px 2px"}}/>}
                <span style={{width:5,height:5,borderRadius:"50%",background:active?T.text:T.border,transition:"all 0.15s"}}/>
                <span style={{fontSize:"0.63rem",fontWeight:active?700:400,letterSpacing:"0.01em"}}>{label}</span>
                {cnt!==undefined&&cnt>0&&<span style={{position:"absolute",top:7,right:"20%",background:active?T.text:T.border,color:active?"#fff":T.textMuted,borderRadius:20,fontSize:"0.51rem",fontWeight:700,padding:"0 4px",minWidth:14,textAlign:"center"}}>{cnt}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  // ── Desktop ──
  return(
    <div style={{display:"flex",minHeight:"100vh",background:T.bg,fontFamily:T.fontBody}}>
      <style>{GLOBAL_CSS}</style>
      <ToastContainer/>
      <Sidebar tab={tab} setTab={setTab} members={members} aspirants={aspirants} sessions={sessions} events={events} reservations={reservations} connected={connected} readonlyToken={readonlyToken} onLink={handleLink} onRevoke={handleRevoke} onExport={handleExport} onLogout={handleLogout}/>
      <main style={{marginLeft:220,flex:1,padding:"28px 32px",maxWidth:"calc(100vw - 220px)"}}>
        <div style={{marginBottom:20}}>
          <h1 style={{fontFamily:T.fontDisplay,fontSize:"1.55rem",fontWeight:400,color:T.text,margin:0,lineHeight:1}}>{PAGE_TITLE[tab]}</h1>
          <div style={{fontSize:"0.73rem",color:T.textMuted,marginTop:5}}>{PAGE_SUB(tab,members.length,aspirants.length,sessions.length,events.length,reservations.length)}</div>
        </div>
        {CONTENT[tab]}
      </main>
    </div>
  );
}