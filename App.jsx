import { useState, useEffect, useCallback } from "react";

/* ── 持久化儲存 helpers (localStorage) ── */
const DB = {
  get(key) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch { return false; }
  },
};

/* ── 預設測試帳號 ── */
const DEFAULT_USERS = [
  { id: "u1", username: "admin", password: "admin123", name: "Admin 管理員", role: "admin", color: "#e8c97a" },
  { id: "u2", username: "demo",  password: "demo123",  name: "Demo 用戶",  role: "member", color: "#6aa0c8" },
];

/* ── 狀態設定 ── */
const STATUS = {
  proposal:       { label: "提案中",   color: "#6aa0c8", bg: "rgba(106,160,200,0.15)", border: "rgba(106,160,200,0.3)" },
  preproduction:  { label: "前製準備", color: "#e89a5a", bg: "rgba(232,154,90,0.15)",  border: "rgba(232,154,90,0.3)"  },
  production:     { label: "拍攝中",   color: "#6fb87a", bg: "rgba(111,184,122,0.15)", border: "rgba(111,184,122,0.3)" },
  postproduction: { label: "後製剪輯", color: "#c85c3a", bg: "rgba(200,92,58,0.15)",   border: "rgba(200,92,58,0.3)"  },
  completed:      { label: "已完成",   color: "#e8c97a", bg: "rgba(232,201,122,0.15)", border: "rgba(232,201,122,0.3)"},
};

const VIDEO_TYPES = ["廣告影片","品牌影片","紀錄片","活動記錄","MV","教育影片","其他"];
const PHASE_TEMPLATES = ["提案討論","前製準備","正式拍攝","後製剪輯"];

/* ────────── STYLES ────────── */
const S = {
  body: {
    background:"#0d0d0d", color:"#e8e4dc", fontFamily:"'DM Mono','Noto Serif TC',monospace",
    minHeight:"100vh", overflowX:"hidden",
  },
  loginWrap: {
    minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
    background:"radial-gradient(ellipse at 30% 40%, rgba(232,201,122,0.06) 0%, transparent 60%), #0d0d0d",
  },
  loginBox: {
    width:420, background:"#161616", border:"1px solid #2a2a2a", borderRadius:14,
    padding:"40px 40px 36px", boxShadow:"0 32px 80px rgba(0,0,0,0.7)",
  },
  sidebar: {
    width:220, background:"#161616", borderRight:"1px solid #2a2a2a",
    position:"fixed", top:0, left:0, bottom:0, display:"flex", flexDirection:"column", zIndex:100,
  },
  topbar: {
    position:"sticky", top:0, background:"rgba(13,13,13,0.88)", backdropFilter:"blur(14px)",
    borderBottom:"1px solid #2a2a2a", padding:"14px 32px", display:"flex",
    alignItems:"center", justifyContent:"space-between", zIndex:50,
  },
  card: {
    background:"#161616", border:"1px solid #2a2a2a", borderRadius:10,
    overflow:"hidden", cursor:"pointer", transition:"all .22s",
  },
  overlay: {
    position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", backdropFilter:"blur(6px)",
    zIndex:300, display:"flex", alignItems:"center", justifyContent:"center",
  },
  modal: {
    background:"#161616", border:"1px solid #2a2a2a", borderRadius:13,
    width:540, maxHeight:"85vh", overflowY:"auto",
    boxShadow:"0 30px 80px rgba(0,0,0,0.8)",
  },
  panelOverlay: {
    position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", backdropFilter:"blur(5px)",
    zIndex:200, display:"flex", alignItems:"center", justifyContent:"flex-end",
  },
  panel: {
    width:520, height:"100vh", background:"#161616", borderLeft:"1px solid #2a2a2a",
    overflowY:"auto",
  },
  input: {
    width:"100%", background:"#1e1e1e", border:"1px solid #2a2a2a", borderRadius:6,
    padding:"10px 14px", fontFamily:"inherit", fontSize:12, color:"#e8e4dc", outline:"none",
    transition:"border-color .2s", boxSizing:"border-box",
  },
  label: { display:"block", fontSize:9, letterSpacing:"0.25em", textTransform:"uppercase", color:"#7a7670", marginBottom:7 },
  btnPrimary: {
    background:"#e8c97a", color:"#000", border:"none", borderRadius:5,
    padding:"9px 18px", fontFamily:"inherit", fontSize:11, fontWeight:600,
    letterSpacing:"0.05em", cursor:"pointer", transition:"all .18s",
  },
  btnGhost: {
    background:"transparent", color:"#b0aba3", border:"1px solid #2a2a2a", borderRadius:5,
    padding:"9px 18px", fontFamily:"inherit", fontSize:11, cursor:"pointer", transition:"all .18s",
  },
  btnDanger: {
    background:"rgba(200,92,92,0.12)", color:"#c85c5c", border:"1px solid rgba(200,92,92,0.25)", borderRadius:5,
    padding:"7px 14px", fontFamily:"inherit", fontSize:11, cursor:"pointer", transition:"all .18s",
  },
};

/* ════════════════════════════════
   LOGIN PAGE
════════════════════════════════ */
function LoginPage({ onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    setLoading(true); setErr("");
    setTimeout(() => {
      const users = DB.get("frame:users") || DEFAULT_USERS;
      const found = users.find(x => x.username === u && x.password === p);
      if (found) { onLogin(found); }
      else { setErr("帳號或密碼錯誤"); setLoading(false); }
    }, 350);
  };

  return (
    <div style={S.loginWrap}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden"}}>
        {[...Array(6)].map((_,i) => (
          <div key={i} style={{position:"absolute",left:`${10+i*16}%`,top:0,bottom:0,width:1,
            background:"rgba(232,201,122,0.03)"}} />
        ))}
      </div>
      <div style={S.loginBox}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:32,letterSpacing:"0.18em",color:"#e8c97a",marginBottom:6}}>FRAME</div>
          <div style={{fontSize:9,letterSpacing:"0.35em",color:"#7a7670",textTransform:"uppercase"}}>影片拍攝專案管理系統</div>
        </div>
        <div style={{marginBottom:18}}>
          <label style={S.label}>帳號</label>
          <input style={S.input} placeholder="輸入帳號"
            value={u} onChange={e=>setU(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&submit()}
            onFocus={e=>{e.target.style.borderColor="#e8c97a"}}
            onBlur={e=>{e.target.style.borderColor="#2a2a2a"}} />
        </div>
        <div style={{marginBottom:8}}>
          <label style={S.label}>密碼</label>
          <input style={S.input} type="password" placeholder="輸入密碼"
            value={p} onChange={e=>setP(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&submit()}
            onFocus={e=>{e.target.style.borderColor="#e8c97a"}}
            onBlur={e=>{e.target.style.borderColor="#2a2a2a"}} />
        </div>
        {err && <div style={{fontSize:11,color:"#c85c5c",marginBottom:12,textAlign:"center"}}>{err}</div>}
        <div style={{marginTop:22}}>
          <button style={{...S.btnPrimary,width:"100%",padding:"13px",fontSize:13,borderRadius:7}}
            onClick={submit} disabled={loading}>
            {loading ? "驗證中..." : "登入系統"}
          </button>
        </div>
        <div style={{marginTop:20,padding:"14px",background:"#1a1a1a",borderRadius:7,border:"1px solid #252525"}}>
          <div style={{fontSize:9,letterSpacing:"0.2em",color:"#7a7670",textTransform:"uppercase",marginBottom:8}}>測試帳號</div>
          <div style={{fontSize:11,color:"#b0aba3",lineHeight:1.9}}>
            admin / admin123 &nbsp;·&nbsp; <span style={{color:"#e8c97a"}}>管理員</span><br/>
            demo / demo123 &nbsp;&nbsp;&nbsp;·&nbsp; <span style={{color:"#6aa0c8"}}>一般用戶</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   MAIN APP
════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [panelId, setPanelId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const showToast = (msg, type="success") => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    // init users
    if (!DB.get("frame:users")) DB.set("frame:users", DEFAULT_USERS);
    // init projects
    const stored = DB.get("frame:projects");
    if (stored && stored.length > 0) {
      setProjects(stored);
    } else {
      const demo = getDemoProjects();
      setProjects(demo);
      DB.set("frame:projects", demo);
    }
    setLoading(false);
  }, []);

  const saveProjects = useCallback((updated) => {
    setProjects(updated);
    DB.set("frame:projects", updated);
  }, []);

  if (!user) return <LoginPage onLogin={setUser} />;
  if (loading) return (
    <div style={{...S.body,display:"flex",alignItems:"center",justifyContent:"center",height:"100vh"}}>
      <div style={{fontSize:12,color:"#7a7670",letterSpacing:"0.2em"}}>載入中...</div>
    </div>
  );

  const filtered = projects.filter(p => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search && !p.name.includes(search) && !p.client.includes(search)) return false;
    return true;
  });

  const panelProject = projects.find(p => p.id === panelId);

  return (
    <div style={S.body}>
      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", bottom:28, right:28, zIndex:999,
          background: toast.type==="success" ? "rgba(111,184,122,0.92)" : "rgba(200,92,92,0.92)",
          color:"#000", borderRadius:8, padding:"12px 20px",
          fontSize:12, fontWeight:600, backdropFilter:"blur(8px)",
          boxShadow:"0 8px 24px rgba(0,0,0,0.5)",
          animation:"fadeUp .25s ease",
        }}>
          {toast.type==="success" ? "✓ " : "✕ "}{toast.msg}
        </div>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <nav style={S.sidebar}>
          <div style={{padding:"26px 22px 18px",borderBottom:"1px solid #2a2a2a"}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,letterSpacing:"0.15em",color:"#e8c97a"}}>FRAME</div>
            <div style={{fontSize:9,letterSpacing:"0.3em",color:"#7a7670",textTransform:"uppercase",marginTop:4}}>影片製作管理</div>
          </div>
          <div style={{padding:"18px 0",flex:1}}>
            <NavSection title="篩選狀態" />
            {[
              ["all","◈","全部專案",undefined],
              ["proposal","◻","提案中",STATUS.proposal.color],
              ["preproduction","◫","前製準備",STATUS.preproduction.color],
              ["production","◉","拍攝中",STATUS.production.color],
              ["postproduction","◐","後製剪輯",STATUS.postproduction.color],
              ["completed","✦","已完成",STATUS.completed.color],
            ].map(([val,icon,label,color]) => (
              <NavItem key={val} icon={icon} label={label} active={filter===val}
                color={color} onClick={()=>setFilter(val)} />
            ))}
          </div>
          <div style={{padding:"16px 22px",borderTop:"1px solid #2a2a2a"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:user.color,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:11,fontWeight:700,color:"#000"}}>{user.name[0]}</div>
              <div>
                <div style={{fontSize:11,color:"#e8e4dc"}}>{user.name}</div>
                <div style={{fontSize:9,color:"#7a7670",letterSpacing:"0.15em"}}>{user.role==="admin"?"管理員":"成員"}</div>
              </div>
            </div>
            <button style={{...S.btnGhost,width:"100%",fontSize:10}}
              onClick={()=>setUser(null)}>登出</button>
          </div>
        </nav>
      )}

      {/* Main */}
      <div style={{marginLeft:sidebarOpen?220:0,minHeight:"100vh",transition:"margin .2s"}}>
        {/* Topbar */}
        <div style={S.topbar}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <button style={{background:"none",border:"none",color:"#7a7670",fontSize:18,cursor:"pointer",padding:4}}
              onClick={()=>setSidebarOpen(v=>!v)}>☰</button>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:"#e8e4dc"}}>
              {filter==="all" ? "所有專案" : STATUS[filter]?.label}
            </div>
            <div style={{background:"#1e1e1e",border:"1px solid #2a2a2a",borderRadius:20,
              padding:"3px 10px",fontSize:10,color:"#7a7670"}}>
              {filtered.length} 個
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <input style={{...S.input,width:180,padding:"8px 14px",fontSize:11}}
              placeholder="搜尋名稱 / 客戶..."
              value={search} onChange={e=>setSearch(e.target.value)} />
            <button style={S.btnPrimary} onClick={()=>setShowModal(true)}>＋ 新增提案</button>
          </div>
        </div>

        <div style={{padding:"28px 32px"}}>
          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}}>
            {[
              ["全部專案", projects.length, "本系統"],
              ["進行中", projects.filter(p=>p.status==="production"||p.status==="postproduction").length, "拍攝 & 後製"],
              ["提案待確認", projects.filter(p=>p.status==="proposal").length, "等待客戶回覆"],
              ["已完成", projects.filter(p=>p.status==="completed").length, "成功交件"],
            ].map(([label,val,sub],i) => (
              <div key={i} style={{background:"#161616",border:"1px solid #2a2a2a",borderRadius:8,
                padding:"18px 20px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,
                  background:["#e8c97a","#6fb87a","#6aa0c8","#e89a5a"][i]}} />
                <div style={{fontSize:9,letterSpacing:"0.25em",textTransform:"uppercase",color:"#7a7670",marginBottom:8}}>{label}</div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:32,lineHeight:1,color:"#e8e4dc"}}>{val}</div>
                <div style={{fontSize:10,color:"#7a7670",marginTop:5}}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div style={{textAlign:"center",padding:"60px 0",color:"#7a7670",fontSize:12,letterSpacing:"0.15em"}}>
              {search ? `找不到「${search}」相關專案` : "此分類尚無專案，點擊右上角新增"}
            </div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(330px,1fr))",gap:18}}>
              {filtered.map((p) => (
                <ProjectCard key={p.id} project={p}
                  onClick={()=>setPanelId(p.id)}
                  onDelete={()=>setShowDeleteModal(p.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {panelProject && (
        <div style={S.panelOverlay} onClick={e=>{ if(e.target===e.currentTarget) setPanelId(null); }}>
          <div style={S.panel}>
            <DetailPanel
              project={panelProject}
              onClose={()=>setPanelId(null)}
              onUpdate={(updated) => {
                saveProjects(projects.map(p=>p.id===updated.id?updated:p));
              }}
              onDelete={()=>{ setShowDeleteModal(panelProject.id); setPanelId(null); }}
              showToast={showToast}
            />
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showModal && (
        <NewProjectModal
          onClose={()=>setShowModal(false)}
          onCreate={(data)=>{
            saveProjects([data, ...projects]);
            setShowModal(false);
            showToast("提案已建立！");
          }}
        />
      )}

      {/* Delete Confirm */}
      {showDeleteModal && (
        <div style={S.overlay} onClick={e=>{ if(e.target===e.currentTarget) setShowDeleteModal(null); }}>
          <div style={{...S.modal,width:380,padding:"32px 32px 28px",textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:14}}>⚠</div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,marginBottom:10}}>確認刪除？</div>
            <div style={{fontSize:12,color:"#b0aba3",lineHeight:1.7,marginBottom:24}}>
              刪除後無法復原，專案的所有階段與任務資料將永久移除。
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button style={S.btnGhost} onClick={()=>setShowDeleteModal(null)}>取消</button>
              <button style={{...S.btnDanger,padding:"9px 24px"}} onClick={()=>{
                saveProjects(projects.filter(p=>p.id!==showDeleteModal));
                setShowDeleteModal(null);
                setPanelId(null);
                showToast("專案已刪除","error");
              }}>確認刪除</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=Noto+Serif+TC:wght@300;400;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:2px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}
        textarea{resize:vertical}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.5)}
      `}</style>
    </div>
  );
}

/* ── Nav helpers ── */
function NavSection({title}) {
  return <div style={{fontSize:9,letterSpacing:"0.3em",color:"#7a7670",textTransform:"uppercase",
    padding:"0 22px 8px",marginTop:6}}>{title}</div>;
}
function NavItem({icon,label,active,color,onClick}) {
  return (
    <div onClick={onClick} style={{
      display:"flex",alignItems:"center",gap:10,padding:"9px 22px",cursor:"pointer",
      fontSize:12,color:active?(color||"#e8c97a"):"#b0aba3",
      borderLeft:`2px solid ${active?(color||"#e8c97a"):"transparent"}`,
      background:active?"rgba(232,201,122,0.04)":"transparent",
      transition:"all .15s",
    }}>
      <span style={{fontSize:13,width:18,textAlign:"center",color:color||undefined}}>{icon}</span>
      {label}
    </div>
  );
}

/* ════════════════════════════════
   PROJECT CARD
════════════════════════════════ */
function ProjectCard({ project: p, onClick, onDelete }) {
  const s = STATUS[p.status];
  const allTasks = p.phases?.flatMap(ph=>ph.tasks)||[];
  const doneTasks = allTasks.filter(t=>t.done).length;
  const progress = allTasks.length ? Math.round(doneTasks/allTasks.length*100) : 0;
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{...S.card,...(hover?{borderColor:"rgba(232,201,122,0.3)",transform:"translateY(-2px)",
        boxShadow:"0 8px 32px rgba(0,0,0,0.45)"}:{})}}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      onClick={onClick}>
      <div style={{height:3,background:s.color}} />
      <div style={{padding:"16px 18px 12px",borderBottom:"1px solid #2a2a2a",
        display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1,paddingRight:10}}>
          <div style={{fontFamily:"'Noto Serif TC',serif",fontSize:13,fontWeight:600,
            color:"#e8e4dc",lineHeight:1.4,marginBottom:4}}>{p.name}</div>
          <div style={{fontSize:9,letterSpacing:"0.15em",color:"#7a7670",textTransform:"uppercase"}}>{p.type} · {p.client}</div>
        </div>
        <span style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",
          padding:"3px 8px",borderRadius:3,fontWeight:600,whiteSpace:"nowrap",
          background:s.bg,color:s.color,border:`1px solid ${s.border}`}}>{s.label}</span>
      </div>
      <div style={{padding:"12px 18px"}}>
        <div style={{display:"flex",gap:14,marginBottom:12,flexWrap:"wrap"}}>
          {[["👤",p.director||"—"],["📅",p.deadline||"—"],["✓",`${doneTasks}/${allTasks.length}`]].map(([icon,val],i)=>(
            <div key={i} style={{fontSize:10,color:"#7a7670",display:"flex",alignItems:"center",gap:4}}>
              {icon} <span style={{color:"#b0aba3"}}>{val}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,
            letterSpacing:"0.1em",color:"#7a7670",textTransform:"uppercase",marginBottom:5}}>
            <span>整體進度</span><span>{progress}%</span>
          </div>
          <div style={{height:3,background:"#2a2a2a",borderRadius:2,overflow:"hidden"}}>
            <div style={{width:`${progress}%`,height:"100%",background:s.color,borderRadius:2,transition:"width .5s"}} />
          </div>
        </div>
      </div>
      <div style={{padding:"10px 18px",borderTop:"1px solid #2a2a2a",
        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:9,letterSpacing:"0.1em",color:"#7a7670",textTransform:"uppercase"}}>
          {p.phases?.length||0} 個階段
        </div>
        <button style={{...S.btnDanger,padding:"4px 10px",fontSize:9}}
          onClick={e=>{e.stopPropagation();onDelete();}}>刪除</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   DETAIL PANEL
════════════════════════════════ */
function DetailPanel({ project, onClose, onUpdate, onDelete, showToast }) {
  const [p, setP] = useState(project);
  const [tab, setTab] = useState("phases");
  const [newTaskText, setNewTaskText] = useState({});
  const [newPhaseText, setNewPhaseText] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name:project.name, client:project.client, director:project.director||"",
    type:project.type, status:project.status,
    start:project.start||"", deadline:project.deadline||"", notes:project.notes||""
  });

  useEffect(() => { setP(project); }, [project]);

  const save = (updated) => { setP(updated); onUpdate(updated); };

  const toggleTask = (phaseIdx, taskIdx) => {
    const next = {...p, phases: p.phases.map((ph,pi)=>pi!==phaseIdx?ph:{
      ...ph, tasks: ph.tasks.map((t,ti)=>ti!==taskIdx?t:{...t,done:!t.done})
    })};
    save(next);
  };

  const addTask = (phaseIdx) => {
    const text = (newTaskText[phaseIdx]||"").trim();
    if (!text) return;
    const next = {...p, phases: p.phases.map((ph,pi)=>pi!==phaseIdx?ph:{
      ...ph, tasks:[...ph.tasks, {name:text, done:false, assign:"—"}]
    })};
    save(next);
    setNewTaskText(v=>({...v,[phaseIdx]:""}));
    showToast("任務已新增");
  };

  const deleteTask = (phaseIdx, taskIdx) => {
    const next = {...p, phases: p.phases.map((ph,pi)=>pi!==phaseIdx?ph:{
      ...ph, tasks: ph.tasks.filter((_,ti)=>ti!==taskIdx)
    })};
    save(next);
    showToast("任務已刪除","error");
  };

  const addPhase = () => {
    if (!newPhaseText.trim()) return;
    const next = {...p, phases:[...p.phases, {name:newPhaseText.trim(), status:"pending", date:"待定", tasks:[]}]};
    save(next);
    setNewPhaseText("");
    showToast("階段已新增");
  };

  const deletePhase = (phaseIdx) => {
    const next = {...p, phases: p.phases.filter((_,i)=>i!==phaseIdx)};
    save(next);
    showToast("階段已刪除","error");
  };

  const saveEdit = () => {
    save({...p, ...editData});
    setEditMode(false);
    showToast("專案資訊已更新");
  };

  const s = STATUS[p.status];
  const allTasks = p.phases?.flatMap(ph=>ph.tasks)||[];
  const doneTasks = allTasks.filter(t=>t.done).length;
  const progress = allTasks.length ? Math.round(doneTasks/allTasks.length*100) : 0;

  return (
    <div style={{animation:"slideIn .28s ease"}}>
      <div style={{padding:"24px 26px 18px",borderBottom:"1px solid #2a2a2a",
        position:"sticky",top:0,background:"#161616",zIndex:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1,paddingRight:12}}>
            <div style={{fontSize:9,letterSpacing:"0.25em",color:"#7a7670",textTransform:"uppercase",marginBottom:7}}>
              {p.type} · {p.client}
            </div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,lineHeight:1.3,marginBottom:10}}>{p.name}</div>
            <span style={{fontSize:9,padding:"3px 9px",borderRadius:3,
              background:s.bg,color:s.color,border:`1px solid ${s.border}`,
              textTransform:"uppercase",letterSpacing:"0.1em"}}>{s.label}</span>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button style={{...S.btnGhost,padding:"7px 12px",fontSize:10}}
              onClick={()=>setEditMode(v=>!v)}>{editMode?"取消":"編輯"}</button>
            <button style={{background:"none",border:"none",color:"#7a7670",fontSize:18,cursor:"pointer",
              width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:4}}
              onClick={onClose}>✕</button>
          </div>
        </div>
        <div style={{marginTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#7a7670",
            textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>
            <span>整體進度</span><span style={{color:s.color}}>{progress}%</span>
          </div>
          <div style={{height:4,background:"#2a2a2a",borderRadius:2,overflow:"hidden"}}>
            <div style={{width:`${progress}%`,height:"100%",background:s.color,transition:"width .5s"}} />
          </div>
        </div>
        <div style={{display:"flex",gap:2,marginTop:16,background:"#1a1a1a",borderRadius:6,padding:3,width:"fit-content"}}>
          {[["phases","階段任務"],["info","專案資訊"],["notes","備忘錄"]].map(([val,label])=>(
            <div key={val} onClick={()=>setTab(val)} style={{
              padding:"6px 14px",fontSize:11,borderRadius:4,cursor:"pointer",
              background:tab===val?"#e8c97a":"transparent",
              color:tab===val?"#000":"#b0aba3",fontWeight:tab===val?600:400,
              transition:"all .15s",
            }}>{label}</div>
          ))}
        </div>
      </div>

      <div style={{padding:"22px 26px"}}>
        {/* EDIT MODE */}
        {editMode && (
          <div style={{marginBottom:20,background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:10,padding:18}}>
            <div style={{fontSize:9,letterSpacing:"0.25em",color:"#7a7670",textTransform:"uppercase",
              marginBottom:14,paddingBottom:8,borderBottom:"1px solid #2a2a2a"}}>編輯專案資訊</div>
            {[["name","專案名稱","text"],["client","客戶 / 品牌","text"],
              ["director","導演 / 負責人","text"],["start","開始日期","date"],["deadline","截止日期","date"]
            ].map(([key,label,type])=>(
              <div key={key} style={{marginBottom:12}}>
                <label style={S.label}>{label}</label>
                <input style={S.input} type={type} value={editData[key]}
                  onChange={e=>setEditData(v=>({...v,[key]:e.target.value}))} />
              </div>
            ))}
            <div style={{marginBottom:12}}>
              <label style={S.label}>影片類型</label>
              <select style={S.input} value={editData.type}
                onChange={e=>setEditData(v=>({...v,type:e.target.value}))}>
                {VIDEO_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{marginBottom:14}}>
              <label style={S.label}>專案狀態</label>
              <select style={S.input} value={editData.status}
                onChange={e=>setEditData(v=>({...v,status:e.target.value}))}>
                {Object.entries(STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button style={S.btnGhost} onClick={()=>setEditMode(false)}>取消</button>
              <button style={S.btnPrimary} onClick={saveEdit}>儲存變更</button>
            </div>
          </div>
        )}

        {/* TAB: PHASES */}
        {tab==="phases" && (
          <div>
            {p.phases?.map((phase, pi) => {
              const pDone = phase.tasks.filter(t=>t.done).length;
              return (
                <div key={pi} style={{marginBottom:22}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:22,height:22,borderRadius:"50%",flexShrink:0,
                        border:`2px solid ${phase.status==="done"?"#6fb87a":phase.status==="active"?"#e8c97a":"#2a2a2a"}`,
                        background:phase.status==="done"?"rgba(111,184,122,0.1)":phase.status==="active"?"rgba(232,201,122,0.1)":"#1a1a1a",
                        display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,
                        color:phase.status==="done"?"#6fb87a":phase.status==="active"?"#e8c97a":"#7a7670"}}>
                        {phase.status==="done"?"✓":phase.status==="active"?"►":"○"}
                      </div>
                      <div>
                        <div style={{fontSize:12,color:"#e8e4dc",fontWeight:500}}>{phase.name}</div>
                        <div style={{fontSize:9,color:"#7a7670"}}>{phase.date} · {pDone}/{phase.tasks.length} 完成</div>
                      </div>
                    </div>
                    <button style={{...S.btnDanger,padding:"3px 9px",fontSize:9}}
                      onClick={()=>deletePhase(pi)}>刪除階段</button>
                  </div>
                  <div style={{marginLeft:32,display:"flex",flexDirection:"column",gap:6}}>
                    {phase.tasks.map((task,ti)=>(
                      <div key={ti} style={{display:"flex",alignItems:"center",gap:10,
                        padding:"8px 12px",background:"#1a1a1a",borderRadius:6,
                        border:"1px solid #252525",fontSize:11}}>
                        <div onClick={()=>toggleTask(pi,ti)} style={{
                          width:16,height:16,borderRadius:3,flexShrink:0,cursor:"pointer",
                          border:`1.5px solid ${task.done?"#6fb87a":"#3a3a3a"}`,
                          background:task.done?"#6fb87a":"transparent",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:9,color:"#000",transition:"all .15s"}}>
                          {task.done?"✓":""}
                        </div>
                        <div style={{flex:1,color:task.done?"#7a7670":"#e8e4dc",
                          textDecoration:task.done?"line-through":"none"}}>{task.name}</div>
                        <div style={{fontSize:10,color:"#7a7670"}}>{task.assign}</div>
                        <button onClick={()=>deleteTask(pi,ti)}
                          style={{background:"none",border:"none",color:"#555",cursor:"pointer",
                          fontSize:13,padding:"0 2px",lineHeight:1}}>✕</button>
                      </div>
                    ))}
                    <div style={{display:"flex",gap:6,marginTop:4}}>
                      <input style={{...S.input,flex:1,padding:"7px 12px",fontSize:11}}
                        placeholder="新增任務..."
                        value={newTaskText[pi]||""}
                        onChange={e=>setNewTaskText(v=>({...v,[pi]:e.target.value}))}
                        onKeyDown={e=>e.key==="Enter"&&addTask(pi)} />
                      <button style={{...S.btnPrimary,padding:"7px 14px",fontSize:11}}
                        onClick={()=>addTask(pi)}>＋</button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{background:"#1a1a1a",border:"1px dashed #2a2a2a",borderRadius:8,padding:14,marginTop:8}}>
              <div style={{fontSize:9,letterSpacing:"0.2em",color:"#7a7670",textTransform:"uppercase",marginBottom:10}}>新增拍攝階段</div>
              <div style={{display:"flex",gap:8}}>
                <input style={{...S.input,flex:1,fontSize:11}} placeholder="階段名稱（例：分鏡討論）"
                  value={newPhaseText} onChange={e=>setNewPhaseText(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&addPhase()} />
                <button style={{...S.btnPrimary,padding:"9px 16px"}} onClick={addPhase}>新增</button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: INFO */}
        {tab==="info" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {[["導演 / 負責人",p.director||"—"],["影片類型",p.type],
              ["客戶 / 品牌",p.client],["開始日期",p.start||"—"],
              ["截止日期",p.deadline||"—"],["專案狀態",s.label],
              ["任務完成",`${doneTasks} / ${allTasks.length}`],["拍攝階段",`${p.phases?.length||0} 個`]
            ].map(([label,val])=>(
              <div key={label} style={{background:"#1a1a1a",border:"1px solid #252525",borderRadius:7,padding:"12px 14px"}}>
                <label style={{...S.label,marginBottom:5}}>{label}</label>
                <div style={{fontSize:13,color:"#e8e4dc"}}>{val}</div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: NOTES */}
        {tab==="notes" && (
          <div>
            <textarea style={{...S.input,minHeight:180,fontSize:12,lineHeight:1.8,
              fontFamily:"'Noto Serif TC',serif",color:"#b0aba3"}}
              value={editData.notes}
              onChange={e=>setEditData(v=>({...v,notes:e.target.value}))}
              placeholder="製作備忘、客戶需求、特殊注意事項..." />
            <button style={{...S.btnPrimary,marginTop:10}} onClick={()=>{
              save({...p,notes:editData.notes});
              showToast("備忘錄已儲存");
            }}>儲存備忘錄</button>
          </div>
        )}

        <div style={{marginTop:28,paddingTop:18,borderTop:"1px solid #2a2a2a"}}>
          <button style={{...S.btnDanger,width:"100%",padding:10,fontSize:11}} onClick={onDelete}>
            🗑 刪除此專案
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   NEW PROJECT MODAL
════════════════════════════════ */
function NewProjectModal({ onClose, onCreate }) {
  const today = new Date().toISOString().slice(0,10);
  const [form, setForm] = useState({
    name:"", type:"廣告影片", client:"", director:"",
    start:today, deadline:"", notes:"",
    phases: PHASE_TEMPLATES.map(name=>({name, status:"pending", date:"待定", tasks:[]}))
  });
  const [error, setError] = useState("");

  const set = (key,val) => setForm(f=>({...f,[key]:val}));

  const submit = () => {
    if (!form.name.trim()) { setError("請填寫專案名稱"); return; }
    if (!form.client.trim()) { setError("請填寫客戶名稱"); return; }
    const project = {
      ...form,
      id: "proj_" + Date.now(),
      status: "proposal",
      phases: form.phases.map((ph,i)=>i===0?{...ph,status:"active"}:ph),
    };
    onCreate(project);
  };

  return (
    <div style={S.overlay} onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={S.modal}>
        <div style={{padding:"24px 28px 18px",borderBottom:"1px solid #2a2a2a",
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18}}>新增影片提案</div>
          <button style={{background:"none",border:"none",color:"#7a7670",fontSize:18,cursor:"pointer",
            width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center"}}
            onClick={onClose}>✕</button>
        </div>
        <div style={{padding:"22px 28px"}}>
          <div style={{marginBottom:16}}>
            <label style={S.label}>專案名稱 *</label>
            <input style={S.input} placeholder="例：2025年品牌形象影片" value={form.name}
              onChange={e=>set("name",e.target.value)} />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
            <div>
              <label style={S.label}>影片類型</label>
              <select style={S.input} value={form.type} onChange={e=>set("type",e.target.value)}>
                {VIDEO_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>客戶 / 品牌 *</label>
              <input style={S.input} placeholder="客戶名稱" value={form.client}
                onChange={e=>set("client",e.target.value)} />
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={S.label}>導演 / 負責人</label>
            <input style={S.input} placeholder="姓名" value={form.director}
              onChange={e=>set("director",e.target.value)} />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
            <div>
              <label style={S.label}>開始日期</label>
              <input style={S.input} type="date" value={form.start} onChange={e=>set("start",e.target.value)} />
            </div>
            <div>
              <label style={S.label}>截止日期</label>
              <input style={S.input} type="date" value={form.deadline} onChange={e=>set("deadline",e.target.value)} />
            </div>
          </div>
          <div style={{marginBottom:6}}>
            <label style={S.label}>提案說明 / 備忘</label>
            <textarea style={{...S.input,minHeight:80,fontSize:12,lineHeight:1.7,fontFamily:"inherit"}}
              placeholder="簡述影片概念、拍攝目的..." value={form.notes}
              onChange={e=>set("notes",e.target.value)} />
          </div>
          <div style={{background:"#1a1a1a",border:"1px solid #252525",borderRadius:7,padding:"12px 14px",marginTop:14}}>
            <div style={{fontSize:9,letterSpacing:"0.2em",color:"#7a7670",textTransform:"uppercase",marginBottom:8}}>
              預設拍攝階段（建立後可新增 / 刪除）
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {form.phases.map((ph,i)=>(
                <span key={i} style={{fontSize:10,padding:"3px 9px",borderRadius:4,
                  background:"rgba(232,201,122,0.08)",color:"#e8c97a",border:"1px solid rgba(232,201,122,0.2)"}}>
                  {ph.name}
                </span>
              ))}
            </div>
          </div>
          {error && <div style={{color:"#c85c5c",fontSize:11,marginTop:10}}>{error}</div>}
        </div>
        <div style={{padding:"14px 28px 22px",display:"flex",justifyContent:"flex-end",gap:10}}>
          <button style={S.btnGhost} onClick={onClose}>取消</button>
          <button style={S.btnPrimary} onClick={submit}>建立提案 →</button>
        </div>
      </div>
    </div>
  );
}

/* ── Demo Data ── */
function getDemoProjects() {
  return [
    {
      id:"demo1", name:"2025 春季新品廣告", type:"廣告影片", client:"LOKA Fashion",
      director:"陳導", status:"production", start:"2025-03-01", deadline:"2025-05-30",
      notes:"客戶希望整體色調偏暖，有日系雜誌的感覺。配樂方向以輕快爵士為主，需取得版權。",
      phases:[
        {name:"提案 & 腳本",status:"done",date:"3月 1-7日",tasks:[
          {name:"客戶簡報",done:true,assign:"陳導"},
          {name:"腳本撰寫",done:true,assign:"林編"},
          {name:"提案通過",done:true,assign:"王製"},
        ]},
        {name:"前製準備",status:"done",date:"3月 8-20日",tasks:[
          {name:"場勘台北東區",done:true,assign:"陳導"},
          {name:"演員試鏡",done:true,assign:"王製"},
        ]},
        {name:"正式拍攝",status:"active",date:"4月 1-15日",tasks:[
          {name:"第一天外景拍攝",done:true,assign:"全組"},
          {name:"攝影棚拍攝",done:false,assign:"全組"},
          {name:"補拍鏡頭",done:false,assign:"陳導"},
        ]},
        {name:"後製剪輯",status:"pending",date:"5月 1-25日",tasks:[
          {name:"粗剪 v1",done:false,assign:"林剪"},
          {name:"客戶審片",done:false,assign:"王製"},
          {name:"調色 & 配樂",done:false,assign:"張調"},
        ]},
      ]
    },
    {
      id:"demo2", name:"永續未來 ESG 形象影片", type:"品牌影片", client:"GreenTech Corp",
      director:"王導", status:"postproduction", start:"2025-02-01", deadline:"2025-05-15",
      notes:"企業 ESG 年度報告形象影片，時長 3 分鐘，用於股東會議及官網首頁展示。",
      phases:[
        {name:"提案",status:"done",date:"2月",tasks:[
          {name:"概念提案",done:true,assign:"王導"},
          {name:"腳本定稿",done:true,assign:"陳編"},
        ]},
        {name:"拍攝",status:"done",date:"3月",tasks:[
          {name:"工廠拍攝",done:true,assign:"全組"},
          {name:"高層專訪",done:true,assign:"王導"},
        ]},
        {name:"後製",status:"active",date:"4月-5月",tasks:[
          {name:"粗剪通過",done:true,assign:"林剪"},
          {name:"動態字幕 & 配樂",done:false,assign:"設計組"},
          {name:"客戶終審",done:false,assign:"王導"},
        ]},
      ]
    },
    {
      id:"demo3", name:"城市邊緣 — 街頭藝術紀錄", type:"紀錄片", client:"文化部補助",
      director:"張導", status:"preproduction", start:"2025-04-01", deadline:"2025-08-31",
      notes:"記錄台北、台中街頭藝術家的創作過程，獲得文化部補助 80 萬，需於 8/31 前提交成品。",
      phases:[
        {name:"企劃提案",status:"done",date:"4月 1-15日",tasks:[
          {name:"補助申請書",done:true,assign:"張導"},
          {name:"拍攝計劃書",done:true,assign:"何攝"},
        ]},
        {name:"田野調查",status:"active",date:"4月-5月",tasks:[
          {name:"訪談藝術家名單",done:true,assign:"張導"},
          {name:"台北場勘",done:false,assign:"何攝"},
          {name:"台中場勘",done:false,assign:"何攝"},
        ]},
        {name:"正式拍攝",status:"pending",date:"6月-7月",tasks:[
          {name:"台北拍攝週",done:false,assign:"全組"},
          {name:"台中拍攝週",done:false,assign:"全組"},
        ]},
        {name:"後製 & 發行",status:"pending",date:"8月",tasks:[
          {name:"剪輯初版",done:false,assign:"李剪"},
          {name:"影展送件",done:false,assign:"張導"},
        ]},
      ]
    },
    {
      id:"demo4", name:"夏日音樂祭活動記錄", type:"活動記錄", client:"Summer Beats",
      director:"李導", status:"proposal", start:"2025-06-01", deadline:"2025-07-31",
      notes:"為期兩天的戶外音樂節活動全程記錄，需製作 highlights 短片及完整紀錄版本。合約待簽署。",
      phases:[
        {name:"提案討論",status:"active",date:"5月",tasks:[
          {name:"報價單提交",done:true,assign:"李導"},
          {name:"合約簽署",done:false,assign:"業務組"},
        ]},
        {name:"前製準備",status:"pending",date:"6月",tasks:[
          {name:"場地勘查",done:false,assign:"蔡攝"},
        ]},
        {name:"拍攝執行",status:"pending",date:"7/5-7/6",tasks:[
          {name:"第一天記錄",done:false,assign:"全組"},
          {name:"第二天記錄",done:false,assign:"全組"},
        ]},
      ]
    },
  ];
}
