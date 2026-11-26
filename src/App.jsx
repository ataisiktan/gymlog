import React, {useEffect, useMemo, useState} from 'react';
import {Activity, CalendarDays, ChartNoAxesColumnIncreasing, Dumbbell, Plus, Trash2, ChevronLeft, ChevronRight, Check, Clock3, Trophy, Flame, X, Save} from 'lucide-react';

const DAYS=['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
const PLAN=['PUSH','PULL','LEGS','OFF','PUSH','PULL','OFF'];
const EXERCISES={
 PUSH:['Incline Dumbbell Press','Chest Press Machine','Pec Deck Fly','Shoulder Press','Lateral Raise','Face Pull','V-Bar Pushdown','Overhead Rope Extension'],
 PULL:['Wide Lat Pulldown','T-Bar Row','Chest-Supported Row','Close Neutral Cable Row','Reverse Pec Deck','Incline Dumbbell Curl','Hammer Curl','Preacher Curl'],
 LEGS:['Leg Press','Lying Leg Curl','Hip Thrust','Leg Extension','Standing Calf Raise','Cable Crunch']
};
const todayKey=()=>new Date().toISOString().slice(0,10);
const dateKey=(d)=>{const x=new Date(d);return x.toISOString().slice(0,10)};
const blank=()=>({sets:[{reps:'',kg:''},{reps:'',kg:''}]});
const seed=()=>({logs:{}, scores:{}, createdAt:Date.now()});
function App(){
 const [data,setData]=useState(()=>{try{return JSON.parse(localStorage.getItem('gymlog-v1'))||seed()}catch{return seed()}});
 const [date,setDate]=useState(todayKey());
 const [tab,setTab]=useState('workout');
 const [selected,setSelected]=useState('');
 const [newExercise,setNewExercise]=useState('');
 const [score,setScore]=useState(8);
 const [showAdd,setShowAdd]=useState(false);
 useEffect(()=>localStorage.setItem('gymlog-v1',JSON.stringify(data)),[data]);
 const dayIndex=(new Date(date+'T12:00:00').getDay()+6)%7;
 const type=PLAN[dayIndex];
 const entries=data.logs[date]||{};
 const names=useMemo(()=>type==='OFF'?[]:[...(EXERCISES[type]||[]),...Object.keys(entries).filter(n=>!(EXERCISES[type]||[]).includes(n))],[type,entries]);
 const allDates=Object.keys(data.logs).sort().reverse();
 const weekDates=Array.from({length:7},(_,i)=>{let d=new Date(date+'T12:00:00');d.setDate(d.getDate()-((d.getDay()+6)%7)+i);return dateKey(d)});
 const weekly=weekDates.map(k=>({date:k,score:Number(data.scores[k]||0),count:Object.values(data.logs[k]||{}).filter(e=>e.sets?.some(s=>s.kg!==''||s.reps!=='')).length}));
 const trained=weekly.filter(x=>x.count>0).length;
 const average=weekly.filter(x=>x.score>0).length?weekly.filter(x=>x.score>0).reduce((a,b)=>a+b.score,0)/weekly.filter(x=>x.score>0).length:0;
 const update=(fn)=>setData(old=>fn(structuredClone(old)));
 const updateSet=(exercise,index,field,value)=>update(d=>{d.logs[date]??={};d.logs[date][exercise]??=blank();d.logs[date][exercise].sets[index][field]=value;return d});
 const addSet=(exercise)=>update(d=>{d.logs[date]??={};d.logs[date][exercise]??=blank();d.logs[date][exercise].sets.push({reps:'',kg:''});return d});
 const removeExercise=(exercise)=>update(d=>{if(d.logs[date])delete d.logs[date][exercise];return d});
 const saveScore=()=>update(d=>{d.scores[date]=score;return d});
 const changeDate=(n)=>{let d=new Date(date+'T12:00:00');d.setDate(d.getDate()+n);setDate(dateKey(d))};
 const fmt=(k)=>new Date(k+'T12:00:00').toLocaleDateString('tr-TR',{day:'2-digit',month:'short'});
 const volume=(entry)=>entry?.sets?.reduce((a,s)=>a+(Number(s.kg)||0)*(Number(s.reps)||0),0)||0;
 const exerciseHistory=(name)=>allDates.map(k=>({date:k,sets:data.logs[k]?.[name]?.sets||[]})).filter(x=>x.sets.length);
 const latest=allDates.slice(0,30);
 const totalSessions=allDates.filter(k=>Object.keys(data.logs[k]||{}).length).length;
 const totalVolume=allDates.reduce((a,k)=>a+Object.values(data.logs[k]||{}).reduce((b,e)=>b+volume(e),0),0);
 return <div className="app">
  <aside className="sidebar"><div className="brand"><div className="brand-mark">G<span>.</span></div><div><b>GYMLOG</b><small>TRAINING MODE</small></div></div>
   <div className="side-label">MENÜ</div>
   {[['workout',Dumbbell,'Antrenman'],['progress',ChartNoAxesColumnIncreasing,'Performans'],['archive',CalendarDays,'Arşiv']].map(([id,Icon,label])=><button key={id} className={'nav '+(tab===id?'active':'')} onClick={()=>setTab(id)}><Icon size={18}/>{label}</button>)}
   <div className="sidebar-bottom"><div className="status-dot"/> <span>LOCAL STORAGE AKTİF</span></div>
  </aside>
  <main className="main">
   <header className="topbar"><div><div className="eyebrow">YOUR TRAINING JOURNAL</div><h1>{tab==='workout'?'Antrenman':tab==='progress'?'Performans':'Antrenman Arşivi'}</h1></div><div className="top-right"><span className="live"><i/> SYSTEM ONLINE</span><div className="avatar">A</div></div></header>
   {tab==='workout'&&<>
    <section className="hero-grid">
     <div className="hero-card"><div className="hero-top"><span>BUGÜNÜN PROGRAMI</span><span className="pill">{type==='OFF'?'REST DAY':type}</span></div><h2>{type==='OFF'?'Dinlenme günü.':type==='PUSH'?'Push Day':type==='PULL'?'Pull Day':'Legs Day'}</h2><p>{DAYS[dayIndex]} · {new Date(date+'T12:00:00').toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'})}</p><div className="date-controls"><button onClick={()=>changeDate(-1)}><ChevronLeft size={17}/></button><button onClick={()=>setDate(todayKey())}>BUGÜNE DÖN</button><button onClick={()=>changeDate(1)}><ChevronRight size={17}/></button></div></div>
     <div className="stat-card"><div className="stat-head">HAFTALIK PERFORMANS <Activity size={17}/></div><div className="stat-value">{trained}<small>/5</small></div><div className="stat-caption">İDMAN TAMAMLANDI</div><div className="mini-bars">{weekly.map((w,i)=><div key={w.date} className="mini-col"><div className={'mini-bar '+(w.count?'filled':'')} style={{height:(w.count?34:9)+'px'}}/><small>{DAYS[i].slice(0,2)}</small></div>)}</div></div>
     <div className="stat-card score-card"><div className="stat-head">ORTALAMA PUAN <Trophy size={17}/></div><div className="stat-value">{average?average.toFixed(1):'—'}<small>/10</small></div><div className="stat-caption">HAFTALIK ANTRENMAN KALİTESİ</div><div className="score-line"><span style={{width:(average*10)+'%'}}/></div></div>
    </section>
    <section className="week-strip">{PLAN.map((p,i)=><button key={i} onClick={()=>{let d=new Date(date+'T12:00:00');d.setDate(d.getDate()-((d.getDay()+6)%7)+i);setDate(dateKey(d))}} className={'week-day '+(i===dayIndex?'chosen':'')+(weekDates[i]===todayKey()?' today':'')}><small>{DAYS[i].slice(0,3).toUpperCase()}</small><b>{new Date(weekDates[i]+'T12:00:00').getDate()}</b><span>{p}</span></button>)}</section>
    <section className="section-head"><div><div className="eyebrow">SESSION LOG</div><h2>Hareket kayıtları</h2></div><span className="muted">{Object.keys(entries).length} HAREKET</span></section>
    {type==='OFF'?<div className="rest-panel"><div className="rest-icon"><Clock3 size={28}/></div><h3>Recovery is part of progress.</h3><p>Bugün dinlen. Kasların gelişimi toparlanma sırasında devam eder.</p></div>:<div className="exercise-list">{names.map((name,idx)=>{const entry=entries[name]||blank();return <article className="exercise-card" key={name}><div className="exercise-title"><div className="exercise-number">{String(idx+1).padStart(2,'0')}</div><div><h3>{name}</h3><small>{entry.sets.length} SET · TOPLAM HACİM {volume(entry).toLocaleString('tr-TR')} KG</small></div><button className="icon-btn delete" title="Hareketi kaldır" onClick={()=>removeExercise(name)}><Trash2 size={16}/></button></div><div className="set-labels"><span>SET</span><span>TEKRAR</span><span>AĞIRLIK <small>(KG)</small></span><span/></div>{entry.sets.map((s,i)=><div className="set-row" key={i}><span className="set-index">{String(i+1).padStart(2,'0')}</span><input aria-label="Tekrar" type="number" min="0" placeholder="—" value={s.reps} onChange={e=>updateSet(name,i,'reps',e.target.value)}/><input aria-label="Kilogram" type="number" min="0" step="0.5" placeholder="—" value={s.kg} onChange={e=>updateSet(name,i,'kg',e.target.value)}/><span className="done-mark">{s.reps!==''&&s.kg!==''?<Check size={16}/>:''}</span></div>)}<button className="add-set" onClick={()=>addSet(name)}><Plus size={15}/> SET EKLE</button>
      {exerciseHistory(name).length>0&&<details className="history-inline"><summary>Önceki ağırlıkları gör <span>{exerciseHistory(name).length} kayıt</span></summary><div className="history-chips">{exerciseHistory(name).slice(0,5).map(h=><span key={h.date}>{fmt(h.date)} · {Math.max(...h.sets.map(s=>Number(s.kg)||0))} kg</span>)}</div></details>}
     </article>})}<button className="add-exercise" onClick={()=>setShowAdd(true)}><Plus size={17}/> HAREKET EKLE</button></div>}
    <section className="rating-panel"><div><div className="eyebrow">DAILY CHECK-IN</div><h3>Bugünkü antrenmanını puanla</h3><p>Performansını 10 üzerinden değerlendir.</p></div><div className="rating-actions"><div className="score-picker">{[1,2,3,4,5,6,7,8,9,10].map(n=><button key={n} onClick={()=>setScore(n)} className={score===n?'selected':''}>{n}</button>)}</div><button className="primary-btn" onClick={saveScore}><Save size={16}/> PUANI KAYDET</button></div></section>
   </>}
   {tab==='progress'&&<><section className="metrics-row"><div className="metric"><span>TOPLAM ANTRENMAN</span><b>{totalSessions}</b><small>kayıtlı gün</small></div><div className="metric"><span>TOPLAM HACİM</span><b>{Math.round(totalVolume).toLocaleString('tr-TR')} <i>kg</i></b><small>tekrar × ağırlık</small></div><div className="metric"><span>BU HAFTA</span><b>{trained}/5</b><small>hedef antrenman</small></div></section>
    <section className="panel"><div className="section-head"><div><div className="eyebrow">WEEKLY OVERVIEW</div><h2>Haftalık performans grafiği</h2></div><span className="muted">PUAN / 10</span></div><div className="chart">{weekly.map((w,i)=><div className="chart-col" key={w.date}><div className="chart-value">{w.score||'—'}</div><div className="chart-track"><div className="chart-fill" style={{height:(w.score*10)+'%'}}/></div><b>{DAYS[i].slice(0,3)}</b><small>{w.count?'ANTRENMAN':'-'}</small></div>)}</div></section>
    <section className="panel"><div className="section-head"><div><div className="eyebrow">EXERCISE TRACKING</div><h2>Hareket bazında ağırlık geçmişi</h2></div></div><div className="history-table"><div className="table-row table-head"><span>HAREKET</span><span>SON KAYIT</span><span>EN YÜKSEK</span><span>KAYIT</span></div>{[...new Set(allDates.flatMap(k=>Object.keys(data.logs[k]||{})))].map(n=>{let h=exerciseHistory(n);let max=Math.max(...h.flatMap(x=>x.sets.map(s=>Number(s.kg)||0)));let last=h[0];return <div className="table-row" key={n}><b>{n}</b><span>{fmt(last.date)}</span><span className="yellow">{max} kg</span><span>{h.length} hafta/gün</span></div>})}{!allDates.length&&<p className="empty">Henüz kayıt yok. İlk antrenmanını kaydettiğinde burada görünecek.</p>}</div></section>
   </>}
   {tab==='archive'&&<section className="panel"><div className="section-head"><div><div className="eyebrow">LAST 30 DAYS</div><h2>Son 1 aylık antrenman arşivi</h2></div><span className="muted">{latest.length} GÜN</span></div><div className="archive-list">{latest.map(k=>{let ix=(new Date(k+'T12:00:00').getDay()+6)%7;let ex=Object.entries(data.logs[k]||{});return <div className="archive-item" key={k}><div className="archive-date"><b>{new Date(k+'T12:00:00').getDate()}</b><span>{fmt(k).split(' ')[1]}</span></div><div className="archive-info"><b>{DAYS[ix]} · {PLAN[ix]}</b><small>{ex.length} hareket · {ex.reduce((a,[,e])=>a+e.sets.length,0)} set · {Math.round(ex.reduce((a,[,e])=>a+volume(e),0)).toLocaleString('tr-TR')} kg hacim</small></div><div className="archive-score">{data.scores[k]?data.scores[k]+'/10':'—'}</div></div>})}{!latest.length&&<div className="empty">Henüz arşiv kaydı bulunmuyor.</div>}</div></section>}
   <footer><span>GYMLOG <b>•</b> TRAINING MODE</span><span>VERİLERİN BU TARAYICIDA SAKLANIR</span></footer>
  </main>
  {showAdd&&<div className="modal-backdrop" onClick={()=>setShowAdd(false)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setShowAdd(false)}><X/></button><div className="eyebrow">CUSTOM EXERCISE</div><h2>Hareket ekle</h2><p>Bugünkü antrenmanına yeni bir hareket ekle.</p><input autoFocus placeholder="Örn. Cable Lateral Raise" value={newExercise} onChange={e=>setNewExercise(e.target.value)} onKeyDown={e=>e.key==='Enter'&&newExercise.trim()&&(update(d=>{d.logs[date]??={};d.logs[date][newExercise.trim()]=blank();return d}),setNewExercise(''),setShowAdd(false))}/><button className="primary-btn full" onClick={()=>{if(newExercise.trim()){update(d=>{d.logs[date]??={};d.logs[date][newExercise.trim()]=blank();return d});setNewExercise('');setShowAdd(false)}}}>HAREKETİ EKLE <Plus size={16}/></button></div></div>}
 </div>
}
export default App;