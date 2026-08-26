import { useState, useEffect, useMemo, useCallback } from "react";

const STORAGE_KEY = "datespots_v1";

const INITIAL_PLACES = [
  { id:"p001", region:"영등포", name:"호박집", search:"호박집 영등포동", addr:"서울 영등포구 영등포동5가 2", tags:["food","한식"], concepts:["순대국","국밥","노포"] },
  { id:"p002", region:"영등포", name:"중앙참치", search:"중앙참치 영등포", addr:"서울 영등포구 영등포로43길 14", tags:["food","일식"], concepts:["참치회","횟집","신선"] },
  { id:"p003", region:"영등포", name:"영등포시장 포장마차", search:"영등포시장 포장마차", addr:"서울 영등포구 영등포로 225", tags:["food","분식","market"], concepts:["포장마차","시장","야장"] },
  { id:"p004", region:"영등포", name:"소문난 왕돈까스", search:"소문난 왕돈까스 영등포", addr:"서울 영등포구 영등포로42길 8-1", tags:["food","양식"], concepts:["돈까스","가성비","노포"] },
  { id:"p005", region:"영등포", name:"서도냉면", search:"서도냉면 당산", addr:"서울 영등포구 당산동2가 71번지", tags:["food","naeng","한식"], concepts:["평양냉면","물냉면","전통"] },
  { id:"p006", region:"문래", name:"토방골", search:"토방골 문래", addr:"서울 영등포구 당산로 51", tags:["food","한식"], concepts:["가브리살보쌈","전통주","파전"] },
  { id:"p007", region:"문래", name:"유소바", search:"유소바 영등포", addr:"서울 영등포구 선유로22길 10-1 1층", tags:["food","일식"], concepts:["소바","냉소바","일본식"] },
  { id:"p008", region:"경의선 숲길 전체", name:"파평윤씨", search:"파평윤씨 마포", addr:"서울 마포구 백범로24길 11-3 1층", tags:["food","bar","한식","숲길"], concepts:["전통주","한식안주","감성포차","숲길뷰"], note:"공덕·효창 구간", 숲길:true },
  { id:"p009", region:"경의선 숲길 전체", name:"숲길 holzwege", search:"홀츠베게 마포", addr:"서울 마포구 동교로13길 14 1층", tags:["bar","cafe","숲길"], concepts:["하이볼","포션","감성펍","숲길뷰"], note:"홍대·연남 구간", 숲길:true },
  { id:"p010", region:"경의선 숲길 전체", name:"코멘터리 사운드", search:"코멘터리 사운드 합정", addr:"서울 마포구 월드컵로23길 18", tags:["bar","숲길"], concepts:["와인바","테이크아웃","한강피크닉","내추럴와인"], note:"망원 구간", 숲길:true },
  { id:"p011", region:"경의선 숲길 전체", name:"트릴로지 합정", search:"트릴로지 합정", addr:"서울 마포구 희우정로 19", tags:["bar","숲길"], concepts:["칵테일바","영화컨셉","해리포터","데이트"], note:"합정 구간", 숲길:true },
  { id:"p012", region:"경의선 숲길 전체", name:"버건디", search:"버건디 마포 와인바", addr:"서울 마포구 독막로7길 47 3층", tags:["bar","숲길"], concepts:["와인바","안주","감성","야경"], note:"합정 구간", 숲길:true },
  { id:"p013", region:"경의선 숲길 전체", name:"미드나잇145 마포", search:"미드나잇145 마포", addr:"서울 마포구 마포대로92", tags:["bar","숲길"], concepts:["위스키","와인바","루프탑","야경","프라이빗"], note:"공덕 글래드호텔", 숲길:true },
  { id:"p014", region:"경의선 숲길 전체", name:"낙조 연남", search:"낙조 연남", addr:"서울 마포구 동교로 220-5 4층", tags:["bar","숲길"], concepts:["루프탑","코타츠","노을뷰","포차","하이볼","폴라로이드"], note:"연남 구간", 숲길:true },
  { id:"p015", region:"경의선 숲길 전체", name:"36.5도여름동쪽점", search:"36.5도여름 동쪽점", addr:"서울 마포구 와우산로 29길 9", tags:["bar","숲길"], concepts:["다락방","아늑함","감성술집","히든플레이스"], note:"홍대 구간", 숲길:true },
  { id:"p016", region:"홍대 · 연남", name:"숲길 holzwege", search:"홀츠베게 마포", addr:"서울 마포구 동교로13길 14 1층", tags:["bar","cafe","숲길"], concepts:["하이볼","포션","감성펍"], 숲길:true },
  { id:"p017", region:"홍대 · 연남", name:"낙조 연남", search:"낙조 연남", addr:"서울 마포구 동교로 220-5 4층", tags:["bar","숲길"], concepts:["루프탑","코타츠","노을뷰","포차"], 숲길:true },
  { id:"p018", region:"홍대 · 연남", name:"36.5도여름동쪽점", search:"36.5도여름 동쪽점", addr:"서울 마포구 와우산로 29길 9", tags:["bar","숲길"], concepts:["다락방","감성술집"], 숲길:true },
  { id:"p019", region:"홍대 · 연남", name:"글리치 스튜디오", search:"글리치 스튜디오 홍대", addr:"서울 마포구 와우산로27길 70 3층", tags:["activity"], concepts:["키링제작","3D렌티큘러","체험"] },
  { id:"p020", region:"합정", name:"트릴로지 합정", search:"트릴로지 합정", addr:"서울 마포구 희우정로 19", tags:["bar","숲길"], concepts:["칵테일바","영화컨셉","해리포터","데이트"], 숲길:true },
  { id:"p021", region:"합정", name:"버건디", search:"버건디 마포 와인바", addr:"서울 마포구 독막로7길 47 3층", tags:["bar","숲길"], concepts:["와인바","안주","야경"], 숲길:true },
  { id:"p022", region:"합정", name:"코멘터리 사운드", search:"코멘터리 사운드 합정", addr:"서울 마포구 월드컵로23길 18", tags:["bar","숲길"], concepts:["와인바","한강피크닉"], 숲길:true },
  { id:"p023", region:"공덕 · 마포", name:"파평윤씨", search:"파평윤씨 마포", addr:"서울 마포구 백범로24길 11-3 1층", tags:["food","bar","한식","숲길"], concepts:["전통주","한식안주","감성포차"], 숲길:true },
  { id:"p024", region:"공덕 · 마포", name:"미드나잇145 마포", search:"미드나잇145 마포", addr:"서울 마포구 마포대로92", tags:["bar","숲길"], concepts:["위스키","루프탑","야경","프라이빗"], note:"공덕역 글래드호텔", 숲길:true },
  { id:"p025", region:"혜화 · 대학로", name:"오덕새", search:"오덕새 혜화", addr:"서울 종로구 율곡로19길 57 1층", tags:["cafe"], concepts:["감성카페","조용한"] },
  { id:"p026", region:"혜화 · 대학로", name:"띡", search:"띡 혜화 파스타", addr:"서울 종로구 충신4나길 1 201호", tags:["food","양식"], concepts:["블랙타이거새우","파스타","특이메뉴"] },
  { id:"p027", region:"혜화 · 대학로", name:"컴포트존", search:"컴포트존 성균관대 바", addr:"서울 종로구 창경궁로 235-1", tags:["bar"], concepts:["감성바","편안한","대학가"] },
  { id:"p028", region:"북촌 · 삼청 · 안국", name:"호이식", search:"호이식 안국", addr:"서울 종로구 북촌로2길 10 1층", tags:["food","한식"], concepts:["닭한마리","칼국수","한옥분위기","오픈런"] },
  { id:"p029", region:"북촌 · 삼청 · 안국", name:"깡통만두", search:"깡통만두 북촌", addr:"서울 종로구 북촌로2길 5-6 1층", tags:["food","한식"], concepts:["만두전골","비빔국수","수요미식회"], note:"일 정기휴무" },
  { id:"p030", region:"북촌 · 삼청 · 안국", name:"아모르나폴리", search:"아모르나폴리 안국", addr:"서울 종로구 계동길 15 1·2층", tags:["cafe","양식"], concepts:["이탈리아베이커리","한옥카페","브런치"] },
  { id:"p031", region:"북촌 · 삼청 · 안국", name:"오브젝트 삼청점", search:"오브젝트 삼청", addr:"서울 종로구 재동 11번지", tags:["market"], concepts:["편집샵","소품","굿즈"], note:"매일 12:00-20:00" },
  { id:"p032", region:"북촌 · 삼청 · 안국", name:"효자베이커리", search:"효자베이커리 서촌", addr:"서울 종로구 필운대로 54", tags:["cafe"], concepts:["노포빵집","40년전통","빵지순례"], note:"화~일 08:00-20:20 · 월 휴무" },
  { id:"p033", region:"북촌 · 삼청 · 안국", name:"북촌문화센터", search:"북촌문화센터", addr:"서울 종로구 계동길 37", tags:["activity"], concepts:["한옥체험","문화공간"] },
  { id:"p034", region:"북촌 · 삼청 · 안국", name:"북촌 한옥마을", search:"북촌한옥마을", addr:"서울 종로구 북촌로 일대", tags:["activity"], concepts:["산책","한옥","포토스팟"] },
  { id:"p035", region:"종로 · 서촌", name:"안덕", search:"안덕 냉면 서촌", addr:"서울 종로구 자하문로17길 18 1층", tags:["food","naeng","한식"], concepts:["평양냉면","재료소진조기마감"], note:"수~일 11:30-21:00 / 월~화 휴무" },
  { id:"p036", region:"용산", name:"오일제", search:"오일제 용산 냉면", addr:"서울 용산구 한강대로62다길 29 1층", tags:["food","naeng","한식"], concepts:["평양냉면","50그릇한정","웨이팅"], note:"월~금 10:00-15:00 / 토·일 휴무" },
  { id:"p037", region:"서초 · 강남", name:"3대 삼계장인", search:"3대 삼계장인 반포", addr:"서울 서초구 반포대로28길 56-3 1층", tags:["food","한식"], concepts:["삼계탕","3대째","보양식"], note:"화~일 10:00-19:00 / 월 휴무" },
  { id:"p038", region:"서초 · 강남", name:"묘향옥", search:"묘향옥 강남", addr:"서울 강남구 언주로 563 101호", tags:["food","naeng","한식"], concepts:["평양냉면","전통"] },
  { id:"p039", region:"중구 · 신당", name:"고사리 익스프레스 신당", search:"고사리 익스프레스 신당", addr:"서울 중구 퇴계로85길 12-10 1층", tags:["food","한식"], concepts:["고사리요리","비건","건강식"], note:"화~금 11:30-21:30 / 일~월 휴무" },
  { id:"p040", region:"중구 · 신당", name:"소바키리 스즈", search:"소바키리 스즈", addr:"서울 중구 동호로12길 98 1층", tags:["food","일식"], concepts:["소바","냉소바","면소진조기마감"], note:"수~일 11:30-20:00 / 월~화 휴무" },
  { id:"p041", region:"관악 · 강서", name:"남도포장마차", search:"남도포장마차 봉천", addr:"서울 관악구 청룡2길 3", tags:["food","한식"], concepts:["해산물","실내포차","꽃게탕","짱뚱어탕","수요미식회"], note:"매일 16:00-02:00 / 매달 1·3번째 화 휴무" },
  { id:"p042", region:"관악 · 강서", name:"금야면옥", search:"금야면옥 봉천", addr:"서울 관악구 봉천동 1674-1", tags:["food","naeng","한식"], concepts:["평양냉면","전통"] },
  { id:"p043", region:"관악 · 강서", name:"할마니숯불구이", search:"할마니숯불구이 화곡", addr:"서울 강서구 화곡로58길 19-6 1층", tags:["food","한식"], concepts:["숯불구이","고기","노포"] },
  { id:"p044", region:"마포 · 상암", name:"부벽루", search:"부벽루 상암 냉면", addr:"서울 마포구 상암동 37-25", tags:["food","naeng","한식"], concepts:["평양냉면","전통"] },
  { id:"p045", region:"광진 · 동대문", name:"서북면옥", search:"서북면옥 구의동", addr:"서울 광진구 구의동 80-47", tags:["food","naeng","한식"], concepts:["평양냉면","전통"] },
  { id:"p046", region:"광진 · 동대문", name:"홍릉숲 (수목원)", search:"홍릉수목원", addr:"서울 동대문구 회기로 57", tags:["activity"], concepts:["수목원","산책","자연"], note:"고려대역 3번 출구 도보 7분" },
  { id:"p047", region:"경기 · 안산 · 안양", name:"시랑면옥", search:"시랑면옥 안산", addr:"경기 안산시 상록구 시낭로 39", tags:["food","naeng","한식"], concepts:["평양냉면","전통"] },
  { id:"p048", region:"경기 · 안산 · 안양", name:"연제면옥", search:"연제면옥 안양", addr:"경기 안양시 만안구 장내로120번길 81 1층", tags:["food","naeng","한식"], concepts:["평양냉면","전통"] },
  { id:"p049", region:"경기 · 시흥", name:"산골수목원", search:"산골수목원 시흥", addr:"경기 시흥시 금화로202번길 136-2", tags:["activity","cafe"], concepts:["수목원카페","폭포","온실","자연"], note:"매일 10:00-21:00" },
  { id:"p050", region:"경기 · 성남", name:"팔진회관", search:"팔진회관 분당", addr:"경기 성남시 분당구 구미로192번길 4 2층", tags:["food","naeng","한식"], concepts:["평양냉면","전통"] },
  { id:"p051", region:"오이도", name:"오이도 난전어시장", search:"오이도 난전어시장", addr:"경기 시흥시 오이도 일대", tags:["food","market","한식"], concepts:["해산물","직판","어시장","김짬뽕"] },
  { id:"p052", region:"강릉", name:"처음처럼 공장 투어", search:"처음처럼 공장 강릉", addr:"강원 강릉시 일대", tags:["activity"], concepts:["공장투어","소주","양조장"] },
  { id:"p053", region:"부산", name:"뫼밀집", search:"뫼밀집 해운대", addr:"부산 해운대구 마린시티3로 23", tags:["food","naeng","한식"], concepts:["평양냉면","메밀","전통"], note:"화~금 11:30-20:30 / 월 휴무" },
  { id:"p054", region:"부산", name:"송헌집", search:"송헌집 수영", addr:"부산 수영구 민락로19번길 18", tags:["food","naeng","한식"], concepts:["평양냉면","전통"], note:"월~금 11:00-20:00 / 수 휴무" },
  { id:"p055", region:"부산", name:"평양집", search:"평양집 부산 북구", addr:"부산 북구 금곡대로20번길 21 1층", tags:["food","naeng","한식"], concepts:["평양냉면","전통","조기마감"], note:"월~토 10:30-15:30 / 일 휴무" },
  { id:"p056", region:"기타", name:"공룡 레고만들기", search:"다이소", addr:"다이소 전국 매장", tags:["activity"], concepts:["다이소","조립","가성비"] },
];

const TAG_COLORS = {
  food:["#FFF0E6","#C4520A"],bar:["#EEF0FF","#3730A3"],cafe:["#FFF8E6","#92400E"],
  activity:["#E6F4FF","#0C4A6E"],market:["#F0FFF4","#14532D"],naeng:["#FFF0F5","#9D174D"],
  숲길:["#ECFDF5","#065F46"],한식:["#FFF7ED","#7C2D12"],일식:["#FDF2F8","#701A75"],
  양식:["#EFF6FF","#1E3A5F"],분식:["#FFFBEB","#78350F"],
};
const TL = {food:"식당",bar:"바/펍",cafe:"카페",naeng:"평양냉면",activity:"체험",market:"시장",숲길:"경의선숲길",한식:"한식",일식:"일식",양식:"양식",분식:"분식"};
const REGION_EMOJI = {"영등포":"🏙","문래":"🏭","경의선 숲길 전체":"🌿","홍대 · 연남":"🎨","합정":"🌊","공덕 · 마포":"🏙","혜화 · 대학로":"🎭","북촌 · 삼청 · 안국":"🏯","종로 · 서촌":"🍜","용산":"🌆","서초 · 강남":"✨","중구 · 신당":"🌿","관악 · 강서":"🏠","마포 · 상암":"🎙","광진 · 동대문":"🌳","경기 · 안산 · 안양":"🗺","경기 · 시흥":"🌿","경기 · 성남":"🍜","오이도":"🐚","강릉":"🌊","부산":"🌊","기타":"🛒"};
const TYPE_FILTERS = [{key:"all",label:"전체"},{key:"food",label:"🍽 식당"},{key:"한식",label:"🥢 한식"},{key:"일식",label:"🍱 일식"},{key:"양식",label:"🍝 양식"},{key:"naeng",label:"🍜 냉면"},{key:"bar",label:"🍷 바/펍"},{key:"cafe",label:"☕ 카페"},{key:"activity",label:"🎯 체험"},{key:"market",label:"🛒 시장"},{key:"숲길",label:"🌿 숲길"}];
const CONCEPT_FILTERS = ["루프탑","코타츠","와인바","칵테일바","영화컨셉","전통주","하이볼","노포","한강피크닉","다락방","한옥분위기","오픈런","수목원","데이트","해산물","포차"];
const TAG_OPTIONS = ["food","bar","cafe","activity","market","한식","일식","양식","분식","naeng","숲길"];
const ADMIN_PW = "853146";

const Tag = ({tag})=>{ const c=TAG_COLORS[tag]; if(!c)return null; return <span style={{fontSize:11,padding:"2px 8px",borderRadius:999,background:c[0],color:c[1],fontWeight:500}}>{TL[tag]||tag}</span>; };
const Chip = ({label})=><span style={{fontSize:11,padding:"2px 9px",borderRadius:999,background:"#F3F4F6",color:"#6B7280",border:"1px solid #E5E7EB"}}>{label}</span>;
const FBtn = ({label,active,onClick})=>(
  <button onClick={onClick} style={{fontSize:12,padding:"6px 14px",borderRadius:999,whiteSpace:"nowrap",border:active?"none":"1px solid #E5E7EB",background:active?"#111":"#fff",color:active?"#fff":"#6B7280",fontWeight:active?600:400,cursor:"pointer",flexShrink:0}}>{label}</button>
);
const Input = ({label,value,onChange,placeholder,required})=>(
  <div style={{marginBottom:14}}>
    <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:6}}>{label}{required&&<span style={{color:"#EF4444"}}> *</span>}</label>
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",padding:"11px 14px",borderRadius:10,border:"1.5px solid #E5E7EB",fontSize:16,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
  </div>
);

const BottomTab = ({tab,setTab}) => (
  <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#fff",borderTop:"1px solid #F3F4F6",display:"flex",zIndex:50}}>
    <button onClick={()=>setTab("list")} style={{flex:1,padding:"10px 0 14px",border:"none",background:"none",cursor:"pointer",fontSize:10,color:tab==="list"?"#111":"#9CA3AF",fontWeight:tab==="list"?700:400,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
      <span style={{fontSize:22}}>📍</span>목록
    </button>
    <button onClick={()=>setTab("admin")} style={{flex:1,padding:"10px 0 14px",border:"none",background:"none",cursor:"pointer",fontSize:10,color:tab==="admin"?"#111":"#9CA3AF",fontWeight:tab==="admin"?700:400,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
      <span style={{fontSize:22}}>⚙️</span>관리자
    </button>
  </div>
);

export default function App() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("list");
  const [activeRegion, setActiveRegion] = useState("전체지역");
  const [activeType, setActiveType] = useState("all");
  const [activeConcept, setActiveConcept] = useState("all");
  const [view, setView] = useState("list");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [addTab, setAddTab] = useState("manual");
  const [manName, setManName] = useState("");
  const [manAddr, setManAddr] = useState("");
  const [manRegion, setManRegion] = useState("");
  const [manNote, setManNote] = useState("");
  const [manTags, setManTags] = useState([]);
  const [manTagInput, setManTagInput] = useState("");
  const [manConceptInput, setManConceptInput] = useState("");
  const [manConceptList, setManConceptList] = useState([]);
  const [aiName, setAiName] = useState("");
  const [aiAddr, setAiAddr] = useState("");
  const [aiNote, setAiNote] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  const [aiError, setAiError] = useState("");
  const [toast, setToast] = useState("");
  const [conceptOpen, setConceptOpen] = useState(false);
  const [conceptSearch, setConceptSearch] = useState("");
  const [editTagInput, setEditTagInput] = useState("");
  const [editPlace, setEditPlace] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAddr, setEditAddr] = useState("");
  const [editRegion, setEditRegion] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editTags, setEditTags] = useState([]);
  const [editConcepts, setEditConcepts] = useState([]);
  const [editConceptInput, setEditConceptInput] = useState("");
  // 관리자
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminPwError, setAdminPwError] = useState(false);
  const [accessLogs, setAccessLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  // 위치
  const [locations, setLocations] = useState([]);
  const [locLoading, setLocLoading] = useState(false);
  const [adminTab, setAdminTab] = useState("access"); // access | location

  const save = useCallback(async (data) => {
    setPlaces(data);
    try {
      await fetch("/api/places-set", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({data:JSON.stringify(data)})
      });
    } catch(e){console.error("저장 실패",e);}
  },[]);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""),2500); };

  // 기기 ID 및 접속 로그 + 위치
  useEffect(()=>{
    let deviceId = localStorage.getItem("dd_device_id");
    if(!deviceId){ deviceId="device_"+Math.random().toString(36).slice(2,10); localStorage.setItem("dd_device_id",deviceId); }
    fetch("/api/access-log",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({device:deviceId})}).catch(()=>{});
    // 위치 수집
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        (pos)=>{
          fetch("/api/location-set",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({device:deviceId,lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:Math.round(pos.coords.accuracy)})}).catch(()=>{});
        },
        ()=>{} // 거부하면 무시
      );
    }
  },[]);

  // 서버에서 데이터 불러오기
  useEffect(()=>{
    fetch("/api/places-get").then(r=>r.json()).then(result=>{
      if(result.ok&&result.data){ setPlaces(JSON.parse(result.data)); }
      else { setPlaces(INITIAL_PLACES); fetch("/api/places-set",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:JSON.stringify(INITIAL_PLACES)})}); }
      setLoading(false);
    }).catch(()=>{setPlaces(INITIAL_PLACES);setLoading(false);});
  },[]);

  const exportLink = async () => {
    try { await navigator.clipboard.writeText("https://dongdong-gotgot.vercel.app"); showToast("📋 링크 복사 완료! 상대방에게 보내세요 💌"); }
    catch { showToast("링크 복사 실패"); }
  };

  const confirmManual = () => {
    if(!manName.trim()||!manRegion.trim()){showToast("이름과 지역은 필수예요!");return;}
    const newPlace={id:"u"+Date.now(),name:manName.trim(),addr:manAddr.trim()||manRegion.trim()+" 일대",region:manRegion.trim(),search:manName.trim()+" "+manRegion.trim(),tags:manTags,concepts:manConceptList,...(manNote.trim()?{note:manNote.trim()}:{})};
    save([...places,newPlace]);
    setManName("");setManAddr("");setManRegion("");setManNote("");setManTags([]);setManConceptList([]);setManConceptInput("");setManTagInput("");
    setView("list");setTab("list");showToast("✅ 추가됐어요!");
  };

  const startEdit=(p)=>{setEditPlace(p);setEditName(p.name);setEditAddr(p.addr);setEditRegion(p.region);setEditNote(p.note||"");setEditTags(p.tags||[]);setEditConcepts(p.concepts||[]);setEditConceptInput("");setEditTagInput("");setView("edit");};
  const confirmEdit=()=>{
    if(!editName.trim()||!editRegion.trim()){showToast("이름과 지역은 필수예요!");return;}
    const updated=places.map(p=>p.id===editPlace.id?{...p,name:editName.trim(),addr:editAddr.trim()||editRegion.trim()+" 일대",region:editRegion.trim(),search:editName.trim()+" "+editRegion.trim(),tags:editTags,concepts:editConcepts,note:editNote.trim()||undefined}:p);
    save(updated);setView("detail");setSelectedPlace(updated.find(p=>p.id===editPlace.id));showToast("✅ 수정됐어요!");
  };

  const analyzeWithAI=async()=>{
    if(!aiName.trim()){setAiError("가게 이름을 입력해주세요.");return;}
    setAiLoading(true);setAiError("");setAiPreview(null);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`다음 가게를 분석해서 JSON만 응답해. 마크다운 없이.\n가게이름: ${aiName}\n주소: ${aiAddr||"없음"}\n{"region":"지역명","search":"네이버 검색어 3-4단어","tags":["food/bar/cafe/activity/market 중 해당","한식/일식/양식/분식 중 하나(식당이면)"],"concepts":["분위기 키워드 3-5개"],"isNaeng":false}\nisNaeng은 평양냉면 전문점이면 true.`}]})});
      const data=await res.json();
      const text=data.content?.map(c=>c.text||"").join("").replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(text);
      if(parsed.isNaeng)parsed.tags=[...(parsed.tags||[]),"naeng"];
      delete parsed.isNaeng;setAiPreview(parsed);
    }catch{setAiError("분석 오류가 발생했어요.");}
    setAiLoading(false);
  };

  const confirmAI=()=>{
    if(!aiPreview)return;
    const newPlace={id:"u"+Date.now(),name:aiName.trim(),addr:aiAddr.trim()||aiPreview.region+" 일대",...(aiNote.trim()?{note:aiNote.trim()}:{}),...aiPreview};
    save([...places,newPlace]);setAiName("");setAiAddr("");setAiNote("");setAiPreview(null);setView("list");setTab("list");showToast("✅ 추가됐어요!");
  };

  const deletePlace=(id)=>{if(!window.confirm("이 장소를 삭제할까요?"))return;save(places.filter(p=>p.id!==id));setView("list");setSelectedPlace(null);showToast("🗑 삭제됐어요.");};
  const toggleVisited=(id)=>{const updated=places.map(p=>p.id===id?{...p,visited:!p.visited}:p);save(updated);const p=updated.find(x=>x.id===id);setSelectedPlace(p);showToast(p.visited?"✅ 방문 완료로 표시했어요!":"방문 표시를 해제했어요.");};

  const resetAdd=()=>{setManName("");setManAddr("");setManRegion("");setManNote("");setManTags([]);setManConceptList([]);setManConceptInput("");setManTagInput("");setAiName("");setAiAddr("");setAiNote("");setAiPreview(null);setAiError("");setView("list");};

  const loadAccessLogs=async()=>{
    setLogsLoading(true);
    try{const r=await fetch("/api/access-log");const result=await r.json();if(result.ok)setAccessLogs(result.logs);}
    catch{}setLogsLoading(false);
  };
  const loadLocations=async()=>{
    setLocLoading(true);
    try{const r=await fetch("/api/location-get");const result=await r.json();if(result.ok)setLocations(result.locations);}
    catch{}setLocLoading(false);
  };

  const handleAdminLogin=()=>{
    if(adminPw===ADMIN_PW){setAdminAuthed(true);setAdminPwError(false);loadAccessLogs();loadLocations();}
    else{setAdminPwError(true);}
  };

  const uniqueRegions=useMemo(()=>[...new Set(places.map(p=>p.region))],[places]);
  const allConcepts=useMemo(()=>{const base=[...CONCEPT_FILTERS];places.forEach(p=>(p.concepts||[]).forEach(c=>{if(!base.includes(c))base.push(c);}));return base;},[places]);
  const allTypeTags=useMemo(()=>{const base=[...TYPE_FILTERS];const existing=new Set(TYPE_FILTERS.map(f=>f.key));places.forEach(p=>(p.tags||[]).forEach(t=>{if(!existing.has(t)){existing.add(t);base.push({key:t,label:t});}}));return base;},[places]);
  const filtered=useMemo(()=>places.filter(p=>{const r=activeRegion==="전체지역"||p.region===activeRegion;const t=activeType==="all"||p.tags?.includes(activeType);const c=activeConcept==="all"||(p.concepts||[]).includes(activeConcept);return r&&t&&c;}),[places,activeRegion,activeType,activeConcept]);
  const grouped=useMemo(()=>{const g={};filtered.forEach(p=>{if(!g[p.region])g[p.region]=[];g[p.region].push(p);});return g;},[filtered]);

  const s={fontFamily:"'Apple SD Gothic Neo','Noto Sans KR',sans-serif",background:"#FAFAFA",minHeight:"100dvh",maxWidth:480,margin:"0 auto",position:"relative"};
  const headerStyle={background:"#fff",padding:"52px 20px 12px",borderBottom:"1px solid #F3F4F6",position:"sticky",top:0,zIndex:10};

  // ── 추가 화면
  if(view==="add") return (
    <div style={s}>
      <div style={{...headerStyle,paddingBottom:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <button onClick={resetAdd} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#374151",padding:0,lineHeight:1}}>←</button>
          <span style={{fontSize:17,fontWeight:700,color:"#111"}}>새 장소 추가</span>
        </div>
        <div style={{display:"flex",gap:0,borderBottom:"1px solid #F3F4F6"}}>
          <button onClick={()=>setAddTab("manual")} style={{flex:1,padding:"10px 0",border:"none",background:"none",fontSize:14,fontWeight:addTab==="manual"?700:400,color:addTab==="manual"?"#111":"#9CA3AF",borderBottom:addTab==="manual"?"2px solid #111":"2px solid transparent",cursor:"pointer"}}>직접 추가하기</button>
          <button onClick={()=>setAddTab("ai")} style={{flex:1,padding:"10px 0",border:"none",background:"none",fontSize:14,fontWeight:addTab==="ai"?700:400,color:addTab==="ai"?"#111":"#9CA3AF",borderBottom:addTab==="ai"?"2px solid #111":"2px solid transparent",cursor:"pointer",position:"relative"}}>
            자동 추가하기
            <span style={{position:"absolute",top:-2,right:"calc(50% - 42px)",background:"linear-gradient(135deg,#667EEA,#764BA2)",color:"#fff",fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:"0 4px 4px 0",transform:"skewX(-8deg)"}}>PREMIUM</span>
          </button>
        </div>
      </div>
      <div style={{padding:"20px 20px 60px"}}>
        {addTab==="manual"&&(
          <div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
            <Input label="가게 이름" value={manName} onChange={setManName} placeholder="예) 트릴로지 합정" required/>
            <Input label="지역" value={manRegion} onChange={setManRegion} placeholder="예) 합정, 속초, 부산 해운대" required/>
            <Input label="주소" value={manAddr} onChange={setManAddr} placeholder="예) 서울 마포구 희우정로 19"/>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:6}}>태그</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                {manTags.filter(t=>!TAG_OPTIONS.includes(t)).map(t=>(
                  <span key={t} style={{fontSize:12,padding:"4px 12px",borderRadius:999,background:"#E0F2FE",color:"#0369A1",display:"flex",alignItems:"center",gap:4}}>{t}<button onClick={()=>setManTags(prev=>prev.filter(x=>x!==t))} style={{background:"none",border:"none",color:"#0369A1",cursor:"pointer",fontSize:14,padding:0,lineHeight:1}}>×</button></span>
                ))}
                {TAG_OPTIONS.map(t=>{const c=TAG_COLORS[t];const active=manTags.includes(t);return(
                  <button key={t} onClick={()=>setManTags(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t])} style={{fontSize:12,padding:"4px 12px",borderRadius:999,border:active?"none":"1px solid #E5E7EB",background:active&&c?c[0]:"#fff",color:active&&c?c[1]:"#6B7280",fontWeight:active?600:400,cursor:"pointer"}}>{TL[t]||t}</button>
                );})}
              </div>
              <div style={{display:"flex",gap:6}}>
                <input value={manTagInput} onChange={e=>setManTagInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&manTagInput.trim()){e.preventDefault();setManTags(prev=>[...prev,manTagInput.trim()]);setManTagInput("");}}} placeholder="새 태그 직접 입력 후 Enter" style={{flex:1,padding:"9px 12px",borderRadius:10,border:"1.5px solid #E5E7EB",fontSize:13,outline:"none",fontFamily:"inherit"}}/>
                <button onClick={()=>{if(manTagInput.trim()){setManTags(prev=>[...prev,manTagInput.trim()]);setManTagInput("");}}} style={{padding:"0 14px",borderRadius:10,background:"#111",color:"#fff",border:"none",cursor:"pointer",fontSize:18}}>+</button>
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:6}}>컨셉 키워드</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                {manConceptList.map(c=>(<span key={c} style={{fontSize:12,padding:"3px 10px",borderRadius:999,background:"#111",color:"#fff",display:"flex",alignItems:"center",gap:4}}>{c}<button onClick={()=>setManConceptList(prev=>prev.filter(x=>x!==c))} style={{background:"none",border:"none",color:"#fff",cursor:"pointer",fontSize:14,padding:0,lineHeight:1}}>×</button></span>))}
              </div>
              <div style={{display:"flex",gap:6}}>
                <input value={manConceptInput} onChange={e=>setManConceptInput(e.target.value)} onKeyDown={e=>{if((e.key==="Enter"||e.key===",")&&manConceptInput.trim()){e.preventDefault();setManConceptList(prev=>[...prev,manConceptInput.trim()]);setManConceptInput("");}}} placeholder="키워드 입력 후 Enter" style={{flex:1,padding:"11px 14px",borderRadius:10,border:"1.5px solid #E5E7EB",fontSize:14,outline:"none",fontFamily:"inherit"}}/>
                <button onClick={()=>{if(manConceptInput.trim()){setManConceptList(prev=>[...prev,manConceptInput.trim()]);setManConceptInput("");}}} style={{padding:"0 14px",borderRadius:10,background:"#111",color:"#fff",border:"none",cursor:"pointer",fontSize:18}}>+</button>
              </div>
            </div>
            <Input label="메모" value={manNote} onChange={setManNote} placeholder="예) 월 휴무, 웨이팅 있음"/>
            <button onClick={confirmManual} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:"#111",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>추가하기 ✓</button>
          </div>
        )}
        {addTab==="ai"&&(
          <div>
            <div style={{background:"linear-gradient(135deg,#667EEA15,#764BA215)",border:"1px solid #667EEA30",borderRadius:12,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#667EEA",fontWeight:500}}>✨ 가게 이름만 입력하면 AI가 지역·장르·컨셉을 자동으로 분석해요</div>
            <div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
              <Input label="가게 이름" value={aiName} onChange={v=>{setAiName(v);setAiPreview(null);}} placeholder="예) 트릴로지 합정" required/>
              <Input label="주소" value={aiAddr} onChange={setAiAddr} placeholder="예) 서울 마포구 희우정로 19"/>
              <Input label="메모" value={aiNote} onChange={setAiNote} placeholder="예) 월 휴무, 웨이팅 있음"/>
              <button onClick={analyzeWithAI} disabled={aiLoading||!aiName.trim()} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:aiName.trim()?"linear-gradient(135deg,#667EEA,#764BA2)":"#E5E7EB",color:aiName.trim()?"#fff":"#9CA3AF",fontSize:15,fontWeight:700,cursor:aiName.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:aiError?10:0}}>
                {aiLoading?<><span style={{display:"inline-block",width:16,height:16,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>AI 분석 중...</>:"✨ AI로 자동 분석하기"}
              </button>
              {aiError&&<div style={{marginTop:10,fontSize:13,color:"#EF4444",textAlign:"center"}}>{aiError}</div>}
            </div>
            {aiPreview&&(
              <div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 1px 6px rgba(0,0,0,0.06)",border:"2px solid #667EEA",marginTop:16}}>
                <div style={{fontSize:13,fontWeight:700,color:"#667EEA",marginBottom:14}}>✨ AI 분석 결과</div>
                <div style={{marginBottom:10}}><div style={{fontSize:12,color:"#9CA3AF",marginBottom:4}}>지역</div><div style={{fontSize:15,fontWeight:600,color:"#111"}}>{aiPreview.region}</div></div>
                <div style={{marginBottom:10}}><div style={{fontSize:12,color:"#9CA3AF",marginBottom:6}}>장르</div><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{aiPreview.tags?.map(t=><Tag key={t} tag={t}/>)}</div></div>
                <div style={{marginBottom:20}}><div style={{fontSize:12,color:"#9CA3AF",marginBottom:6}}>컨셉</div><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{aiPreview.concepts?.map(c=><Chip key={c} label={c}/>)}</div></div>
                <button onClick={confirmAI} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:"#111",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>목록에 추가하기 ✓</button>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── 상세 화면
  if(view==="detail"&&selectedPlace){const p=selectedPlace;return(
    <div style={s}>
      <div style={{...headerStyle,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setView("list")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#374151",padding:0}}>←</button>
          <span style={{fontSize:17,fontWeight:700,color:"#111"}}>{p.name}</span>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>toggleVisited(p.id)} style={{background:p.visited?"#DCFCE7":"none",border:"1px solid",borderColor:p.visited?"#86EFAC":"#E5E7EB",fontSize:12,color:p.visited?"#166534":"#374151",cursor:"pointer",padding:"4px 10px",borderRadius:8,fontWeight:p.visited?600:400}}>{p.visited?"✓ 방문":"방문"}</button>
          <button onClick={()=>startEdit(p)} style={{background:"none",border:"1px solid #E5E7EB",fontSize:12,color:"#374151",cursor:"pointer",padding:"4px 10px",borderRadius:8}}>수정</button>
          <button onClick={()=>deletePlace(p.id)} style={{background:"none",border:"none",fontSize:12,color:"#EF4444",cursor:"pointer",padding:"4px 6px"}}>삭제</button>
        </div>
      </div>
      <div style={{padding:"20px 20px 100px"}}>
        <div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 1px 6px rgba(0,0,0,0.06)",marginBottom:14}}>
          <div style={{fontSize:12,color:"#9CA3AF",marginBottom:4}}>주소</div>
          <div style={{fontSize:14,color:"#374151",lineHeight:1.6,marginBottom:p.note?12:0}}>{p.addr}</div>
          {p.note&&<><div style={{fontSize:12,color:"#9CA3AF",marginBottom:4,marginTop:12}}>메모</div><div style={{fontSize:14,color:"#374151",lineHeight:1.6}}>{p.note}</div></>}
          <div style={{height:1,background:"#F3F4F6",margin:"16px 0"}}/>
          <div style={{fontSize:12,color:"#9CA3AF",marginBottom:6}}>장르</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:14}}>{p.tags?.map(t=><Tag key={t} tag={t}/>)}</div>
          {p.concepts?.length>0&&<><div style={{fontSize:12,color:"#9CA3AF",marginBottom:6}}>컨셉</div><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{p.concepts.map(c=><Chip key={c} label={c}/>)}</div></>}
        </div>
        <button onClick={()=>window.open("https://map.naver.com/p/search/"+encodeURIComponent(p.search||p.name),"_blank")} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:"#03C75A",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>🗺 네이버 지도에서 보기</button>
      </div>
    </div>
  );}

  // ── 수정 화면
  if(view==="edit"&&editPlace) return(
    <div style={s}>
      <div style={{...headerStyle,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>setView("detail")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#374151",padding:0}}>←</button>
        <span style={{fontSize:17,fontWeight:700,color:"#111"}}>장소 수정</span>
      </div>
      <div style={{padding:"20px 20px 60px"}}>
        <div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
          <Input label="가게 이름" value={editName} onChange={setEditName} placeholder="예) 트릴로지 합정" required/>
          <Input label="지역" value={editRegion} onChange={setEditRegion} placeholder="예) 합정, 속초" required/>
          <Input label="주소" value={editAddr} onChange={setEditAddr} placeholder="예) 서울 마포구 희우정로 19"/>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:6}}>태그</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
              {editTags.filter(t=>!TAG_OPTIONS.includes(t)).map(t=>(<span key={t} style={{fontSize:12,padding:"4px 12px",borderRadius:999,background:"#E0F2FE",color:"#0369A1",display:"flex",alignItems:"center",gap:4}}>{t}<button onClick={()=>setEditTags(prev=>prev.filter(x=>x!==t))} style={{background:"none",border:"none",color:"#0369A1",cursor:"pointer",fontSize:14,padding:0,lineHeight:1}}>×</button></span>))}
              {TAG_OPTIONS.map(t=>{const c=TAG_COLORS[t];const active=editTags.includes(t);return <button key={t} onClick={()=>setEditTags(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t])} style={{fontSize:12,padding:"4px 12px",borderRadius:999,border:active?"none":"1px solid #E5E7EB",background:active&&c?c[0]:"#fff",color:active&&c?c[1]:"#6B7280",fontWeight:active?600:400,cursor:"pointer"}}>{TL[t]||t}</button>;})}
            </div>
            <div style={{display:"flex",gap:6}}>
              <input value={editTagInput} onChange={e=>setEditTagInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&editTagInput.trim()){e.preventDefault();setEditTags(prev=>[...prev,editTagInput.trim()]);setEditTagInput("");}}} placeholder="새 태그 직접 입력 후 Enter" style={{flex:1,padding:"9px 12px",borderRadius:10,border:"1.5px solid #E5E7EB",fontSize:13,outline:"none",fontFamily:"inherit"}}/>
              <button onClick={()=>{if(editTagInput.trim()){setEditTags(prev=>[...prev,editTagInput.trim()]);setEditTagInput("");}}} style={{padding:"0 14px",borderRadius:10,background:"#111",color:"#fff",border:"none",cursor:"pointer",fontSize:18}}>+</button>
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:6}}>컨셉 키워드</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
              {editConcepts.map(c=>(<span key={c} style={{fontSize:12,padding:"3px 10px",borderRadius:999,background:"#111",color:"#fff",display:"flex",alignItems:"center",gap:4}}>{c}<button onClick={()=>setEditConcepts(prev=>prev.filter(x=>x!==c))} style={{background:"none",border:"none",color:"#fff",cursor:"pointer",fontSize:14,padding:0,lineHeight:1}}>×</button></span>))}
            </div>
            <div style={{display:"flex",gap:6}}>
              <input value={editConceptInput} onChange={e=>setEditConceptInput(e.target.value)} onKeyDown={e=>{if((e.key==="Enter"||e.key===",")&&editConceptInput.trim()){e.preventDefault();setEditConcepts(prev=>[...prev,editConceptInput.trim()]);setEditConceptInput("");}}} placeholder="키워드 입력 후 Enter" style={{flex:1,padding:"11px 14px",borderRadius:10,border:"1.5px solid #E5E7EB",fontSize:14,outline:"none",fontFamily:"inherit"}}/>
              <button onClick={()=>{if(editConceptInput.trim()){setEditConcepts(prev=>[...prev,editConceptInput.trim()]);setEditConceptInput("");}}} style={{padding:"0 14px",borderRadius:10,background:"#111",color:"#fff",border:"none",cursor:"pointer",fontSize:18}}>+</button>
            </div>
          </div>
          <Input label="메모" value={editNote} onChange={setEditNote} placeholder="예) 월 휴무, 웨이팅 있음"/>
          <button onClick={confirmEdit} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:"#111",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>수정 완료 ✓</button>
        </div>
      </div>
    </div>
  );

  // ── 관리자 화면
  if(tab==="admin") return(
    <div style={s}>
      <div style={{...headerStyle}}>
        <div style={{fontSize:20,fontWeight:800,color:"#111"}}>⚙️ 관리자</div>
      </div>
      <div style={{padding:"20px 20px 100px"}}>
        {!adminAuthed?(
          <div style={{background:"#fff",borderRadius:16,padding:24,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:15,fontWeight:600,color:"#111",marginBottom:6}}>🔒 관리자 인증</div>
            <div style={{fontSize:13,color:"#9CA3AF",marginBottom:16}}>비밀번호를 입력해주세요</div>
            <input type="password" value={adminPw} onChange={e=>setAdminPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAdminLogin()} placeholder="비밀번호"
              style={{width:"100%",padding:"12px 14px",borderRadius:10,border:`1.5px solid ${adminPwError?"#EF4444":"#E5E7EB"}`,fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:8}}/>
            {adminPwError&&<div style={{fontSize:12,color:"#EF4444",marginBottom:8}}>비밀번호가 틀렸어요</div>}
            <button onClick={handleAdminLogin} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:"#111",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>확인</button>
          </div>
        ):(
          <div>
            {/* 관리자 서브탭 */}
            <div style={{display:"flex",gap:0,borderBottom:"1px solid #F3F4F6",marginBottom:16}}>
              <button onClick={()=>setAdminTab("access")} style={{flex:1,padding:"10px 0",border:"none",background:"none",fontSize:13,fontWeight:adminTab==="access"?700:400,color:adminTab==="access"?"#111":"#9CA3AF",borderBottom:adminTab==="access"?"2px solid #111":"2px solid transparent",cursor:"pointer"}}>📱 접속 기록</button>
              <button onClick={()=>{setAdminTab("location");loadLocations();}} style={{flex:1,padding:"10px 0",border:"none",background:"none",fontSize:13,fontWeight:adminTab==="location"?700:400,color:adminTab==="location"?"#111":"#9CA3AF",borderBottom:adminTab==="location"?"2px solid #111":"2px solid transparent",cursor:"pointer"}}>📍 위치</button>
            </div>

            {adminTab==="access"&&(
              <div>
                <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
                  <button onClick={loadAccessLogs} style={{background:"none",border:"1px solid #E5E7EB",padding:"6px 12px",borderRadius:8,fontSize:12,color:"#6B7280",cursor:"pointer"}}>새로고침</button>
                </div>
                {logsLoading?(
                  <div style={{textAlign:"center",padding:"40px 0",color:"#9CA3AF"}}>불러오는 중...</div>
                ):accessLogs.length===0?(
                  <div style={{textAlign:"center",padding:"40px 0",color:"#9CA3AF"}}>접속 기록이 없어요</div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {accessLogs.sort((a,b)=>new Date(b.lastAccess)-new Date(a.lastAccess)).map((log,i)=>{
                      const date=new Date(log.lastAccess);
                      const diff=Math.floor((new Date()-date)/1000/60);
                      const timeStr=diff<1?"방금 전":diff<60?`${diff}분 전`:diff<1440?`${Math.floor(diff/60)}시간 전`:`${Math.floor(diff/1440)}일 전`;
                      return(
                        <div key={i} style={{background:"#fff",borderRadius:14,padding:"14px 16px",border:"1px solid #F3F4F6"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                            <span style={{fontSize:14,fontWeight:600,color:"#111"}}>📱 기기 {i+1}</span>
                            <span style={{fontSize:12,background:diff<60?"#DCFCE7":"#F3F4F6",color:diff<60?"#166534":"#6B7280",padding:"2px 8px",borderRadius:999,fontWeight:500}}>{timeStr}</span>
                          </div>
                          <div style={{fontSize:12,color:"#9CA3AF"}}>{date.toLocaleString("ko-KR")}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {adminTab==="location"&&(
              <div>
                <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
                  <button onClick={loadLocations} style={{background:"none",border:"1px solid #E5E7EB",padding:"6px 12px",borderRadius:8,fontSize:12,color:"#6B7280",cursor:"pointer"}}>새로고침</button>
                </div>
                {locLoading?(
                  <div style={{textAlign:"center",padding:"40px 0",color:"#9CA3AF"}}>불러오는 중...</div>
                ):locations.length===0?(
                  <div style={{textAlign:"center",padding:"40px 0",color:"#9CA3AF"}}>
                    <div style={{fontSize:30,marginBottom:8}}>📍</div>
                    <div style={{fontSize:14}}>위치 정보가 없어요</div>
                    <div style={{fontSize:12,marginTop:4,color:"#CBD5E1"}}>앱 접속 시 위치 권한을 허용해야 해요</div>
                  </div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {locations.sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).map((loc,i)=>{
                      const date=new Date(loc.updatedAt);
                      const diff=Math.floor((new Date()-date)/1000/60);
                      const timeStr=diff<1?"방금 전":diff<60?`${diff}분 전`:diff<1440?`${Math.floor(diff/60)}시간 전`:`${Math.floor(diff/1440)}일 전`;
                      const naverUrl=`https://map.naver.com/p/search/${loc.lat},${loc.lng}`;
                      const kakaoUrl=`https://map.kakao.com/link/map/위치,${loc.lat},${loc.lng}`;
                      return(
                        <div key={i} style={{background:"#fff",borderRadius:14,padding:"14px 16px",border:"1px solid #F3F4F6"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                            <span style={{fontSize:14,fontWeight:600,color:"#111"}}>📱 기기 {i+1}</span>
                            <span style={{fontSize:12,background:diff<60?"#DCFCE7":"#F3F4F6",color:diff<60?"#166534":"#6B7280",padding:"2px 8px",borderRadius:999,fontWeight:500}}>{timeStr}</span>
                          </div>
                          <div style={{fontSize:12,color:"#9CA3AF",marginBottom:4}}>{date.toLocaleString("ko-KR")}</div>
                          <div style={{fontSize:12,color:"#6B7280",marginBottom:10}}>위도 {loc.lat?.toFixed(5)} · 경도 {loc.lng?.toFixed(5)} · 정확도 {loc.accuracy}m</div>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={()=>window.open(naverUrl,"_blank")} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",background:"#03C75A",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>🗺 네이버 지도</button>
                            <button onClick={()=>window.open(kakaoUrl,"_blank")} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",background:"#FEE500",color:"#000",fontSize:12,fontWeight:600,cursor:"pointer"}}>🗺 카카오 지도</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <BottomTab tab={tab} setTab={setTab}/>
    </div>
  );

  // ── 메인 리스트
  return(
    <div style={s}>
      <div style={{background:"#fff",padding:"52px 20px 10px",borderBottom:"1px solid #F3F4F6",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div>
            <div style={{fontSize:21,fontWeight:800,color:"#111",letterSpacing:"-0.5px"}}>📍 동동곳곳</div>
            <div style={{fontSize:12,color:"#9CA3AF",marginTop:1}}>{filtered.length}곳</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={exportLink} style={{height:36,padding:"0 12px",borderRadius:18,background:"#F3F4F6",border:"none",fontSize:12,color:"#6B7280",cursor:"pointer",fontWeight:500}}>🔗 공유</button>
            <button onClick={()=>setView("add")} style={{width:44,height:44,borderRadius:22,background:"#111",border:"none",color:"#fff",fontSize:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
          </div>
        </div>
        <div style={{overflowX:"auto",display:"flex",gap:6,paddingBottom:8,marginBottom:4}}>{["전체지역",...uniqueRegions].map(r=><FBtn key={r} label={r==="전체지역"?"전체":r} active={activeRegion===r} onClick={()=>setActiveRegion(r)}/>)}</div>
        <div style={{overflowX:"auto",display:"flex",gap:6,paddingBottom:8,marginBottom:4}}>{allTypeTags.map(f=><FBtn key={f.key} label={f.label} active={activeType===f.key} onClick={()=>setActiveType(f.key)}/>)}</div>
        <div style={{marginBottom:4}}>
          <button onClick={()=>{setConceptOpen(o=>!o);setConceptSearch("");}} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:999,border:"1px solid #E5E7EB",background:activeConcept!=="all"?"#111":"#fff",color:activeConcept!=="all"?"#fff":"#6B7280",fontSize:12,fontWeight:activeConcept!=="all"?600:400,cursor:"pointer"}}>
            {activeConcept==="all"?"🎨 컨셉·분위기":activeConcept}
            <span style={{fontSize:10,display:"inline-block",transform:conceptOpen?"rotate(180deg)":"rotate(0deg)"}}>▼</span>
          </button>
          {conceptOpen&&(
            <div style={{position:"absolute",left:16,right:16,background:"#fff",borderRadius:14,boxShadow:"0 4px 20px rgba(0,0,0,0.12)",zIndex:50,padding:12,marginTop:6}}>
              <input value={conceptSearch} onChange={e=>setConceptSearch(e.target.value)} placeholder="검색..." style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #E5E7EB",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:10,fontFamily:"inherit"}}/>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,maxHeight:200,overflowY:"auto"}}>
                <button onClick={()=>{setActiveConcept("all");setConceptOpen(false);}} style={{fontSize:12,padding:"5px 12px",borderRadius:999,border:"none",background:activeConcept==="all"?"#111":"#F3F4F6",color:activeConcept==="all"?"#fff":"#374151",cursor:"pointer",fontWeight:activeConcept==="all"?600:400}}>전체</button>
                {allConcepts.filter(c=>c.includes(conceptSearch)).map(c=>(
                  <button key={c} onClick={()=>{setActiveConcept(c);setConceptOpen(false);}} style={{fontSize:12,padding:"5px 12px",borderRadius:999,border:"none",background:activeConcept===c?"#111":"#F3F4F6",color:activeConcept===c?"#fff":"#374151",cursor:"pointer",fontWeight:activeConcept===c?600:400}}>{c}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{padding:"12px 16px 100px"}}>
        {loading?(
          <div style={{textAlign:"center",padding:"60px 0",color:"#9CA3AF"}}><div style={{fontSize:30,marginBottom:12}}>⏳</div><div style={{fontSize:15}}>불러오는 중...</div></div>
        ):Object.keys(grouped).length===0?(
          <div style={{textAlign:"center",padding:"60px 0",color:"#9CA3AF"}}><div style={{fontSize:40,marginBottom:12}}>🔍</div><div style={{fontSize:15}}>해당 조건의 장소가 없어요</div></div>
        ):Object.entries(grouped).map(([region,rplaces])=>(
          <div key={region} style={{marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,paddingBottom:8,borderBottom:"1px solid #F3F4F6"}}>
              <span style={{fontSize:18}}>{REGION_EMOJI[region]||"📍"}</span>
              <span style={{fontSize:15,fontWeight:700,color:"#111"}}>{region}</span>
              <span style={{fontSize:12,color:"#CBD5E1"}}>{rplaces.length}</span>
            </div>
            {rplaces.map(p=>(
              <div key={p.id} onClick={()=>{setSelectedPlace(p);setView("detail");}} style={{background:"#fff",borderRadius:14,padding:"14px 16px",marginBottom:8,borderLeft:p.숲길?"3px solid #10B981":"none",border:p.숲길?"1px solid #E5E7EB":"1px solid #F3F4F6",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                  <span style={{fontSize:15,fontWeight:600,color:"#111",flex:1}}>{p.name}</span>
                  <div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0,marginLeft:8}}>
                    {p.visited&&<span style={{fontSize:10,background:"#DCFCE7",color:"#166534",padding:"2px 8px",borderRadius:4,fontWeight:700}}>✓ 방문</span>}
                    {p.id?.startsWith("u")&&<span style={{fontSize:10,background:"#EEF2FF",color:"#6366F1",padding:"2px 6px",borderRadius:4}}>추가됨</span>}
                  </div>
                </div>
                <div style={{fontSize:12,color:"#9CA3AF",marginBottom:8,lineHeight:1.4}}>{p.addr}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:p.concepts?.length?6:0}}>{p.tags?.map(t=><Tag key={t} tag={t}/>)}</div>
                {p.concepts?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4}}>{p.concepts.map(c=><Chip key={c} label={c}/>)}</div>}
                {p.note&&<div style={{fontSize:11,color:"#9CA3AF",marginTop:6}}>{p.note}</div>}
              </div>
            ))}
          </div>
        ))}
      </div>
      {toast&&<div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",background:"#111",color:"#fff",padding:"10px 20px",borderRadius:20,fontSize:14,fontWeight:500,zIndex:100,whiteSpace:"nowrap",boxShadow:"0 4px 12px rgba(0,0,0,0.2)"}}>{toast}</div>}
      <BottomTab tab={tab} setTab={setTab}/>
    </div>
  );
}
