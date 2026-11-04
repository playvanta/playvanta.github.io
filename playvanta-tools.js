
"use strict";

const TOOLS = [
  ["crosshair","Valorant","Crosshair Generator","valorant-crosshair-generator.html","https://images.igdb.com/igdb/image/upload/t_1080p/co2mvt.jpg"],
  ["sensitivity","Valorant","Sensitivity Converter","valorant-sensitivity-converter.html","https://images.igdb.com/igdb/image/upload/t_1080p/co2mvt.jpg"],
  ["nether","Minecraft","Nether Portal Calculator","minecraft-nether-calculator.html","https://images.igdb.com/igdb/image/upload/t_1080p/co8fu7.jpg"],
  ["fps","PC Gaming","FPS Frame-Time Calculator","fps-frame-time-calculator.html","https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80"],
  ["fortnite","Fortnite","XP Calculator","fortnite-xp-calculator.html","https://images.igdb.com/igdb/image/upload/t_1080p/co2ekt.jpg"],
  ["robux","Roblox","Robux Tax Calculator","roblox-robux-tax-calculator.html","https://images.igdb.com/igdb/image/upload/t_1080p/co1wyy.jpg"],
  ["cs2","Counter-Strike 2","Economy Calculator","cs2-economy-calculator.html","https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/header.jpg"],
  ["genshin","Genshin Impact","Wish Calculator","genshin-wish-calculator.html","https://images.igdb.com/igdb/image/upload/t_1080p/co5g3r.jpg"],
  ["rocket","Rocket League","Rank Tracker","rocket-league-rank-tracker.html","https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252950/header.jpg"],
  ["lol","League of Legends","LP Calculator","lol-lp-calculator.html","https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg"]
];

const $ = id => document.getElementById(id);
const current = document.body.dataset.tool;
const info = TOOLS.find(t => t[0] === current);
const number = id => Number($(id)?.value || 0);
const integer = (v,min=0,max=1e12) => Math.min(max,Math.max(min,Math.floor(Number(v)||0)));
const fmt = n => Number(n).toLocaleString("en-US",{maximumFractionDigits:2});

function field(id,label,value,opts={}){
  const type=opts.type||"number";
  const min=opts.min??0;
  const max=opts.max??100000000;
  const step=opts.step??1;
  return `<div class="field">
    <label for="${id}">${label}</label>
    <input id="${id}" type="${type}" value="${value}"
      ${type==="number"||type==="range"?`min="${min}" max="${max}" step="${step}"`:""}>
  </div>`;
}
function select(id,label,items){
  return `<div class="field"><label for="${id}">${label}</label>
    <select id="${id}">${items.map(x=>`<option value="${x[0]}">${x[1]}</option>`).join("")}</select>
  </div>`;
}
function result(label="Result"){
  return `<div class="tool-result" aria-live="polite">
    <span class="result-label" id="resultLabel">${label}</span>
    <strong class="result-number" id="resultNumber">—</strong>
    <span class="result-sub" id="resultSub">Adjust the inputs to calculate.</span>
  </div>`;
}
function setResult(value,detail,label){
  $("resultNumber").textContent=value;
  $("resultSub").textContent=detail;
  if(label)$("resultLabel").textContent=label;
}
function attach(fn){
  document.querySelectorAll("#toolControls input,#toolControls select")
    .forEach(el=>el.addEventListener("input",fn));
  fn();
}
function message(text){$("toolMessage").textContent=text;}
function initShell(){
  if(!info)return;
  const [id,game,name]=info;
  document.title=`${game} ${name} | PlayVanta`;
  $("toolGame").textContent=game;
  $("toolName").textContent=name;
  $("toolTitle").textContent=name;
  $("toolBreadcrumb").textContent=game;
  $("year").textContent=new Date().getFullYear();
  $("toolDirectory").replaceChildren();
  TOOLS.forEach(([key,g,n,url,img])=>{
    const a=document.createElement("a");
    a.href=url;
    const image=document.createElement("img");
    image.src=img;
    image.alt=g+" artwork";
    image.loading="lazy";
    image.onerror=()=>{
      image.onerror=null;
      image.src="playvanta-hero.jpg";
    };
    const title=document.createElement("strong");
    title.textContent=g+" — "+n;
    a.append(image,title);
    $("toolDirectory").append(a);
  });
}
const RANKS=[
 "Bronze I","Bronze II","Bronze III",
 "Silver I","Silver II","Silver III",
 "Gold I","Gold II","Gold III",
 "Platinum I","Platinum II","Platinum III",
 "Diamond I","Diamond II","Diamond III",
 "Champion I","Champion II","Champion III",
 "Grand Champion I","Grand Champion II","Grand Champion III",
 "Supersonic Legend"
];

const setups={
  sensitivity(){
    $("toolControls").innerHTML=
      select("fromGame","Convert from",[
        ["valorant","Valorant"],["cs2","Counter-Strike 2"],
        ["overwatch","Overwatch 2"],["apex","Apex Legends"],
        ["fortnite","Fortnite (approximate)"]
      ])+
      select("toGame","Convert to",[
        ["cs2","Counter-Strike 2"],["valorant","Valorant"],
        ["overwatch","Overwatch 2"],["apex","Apex Legends"],
        ["fortnite","Fortnite (approximate)"]
      ])+
      field("sens","Current sensitivity",0.35,{step:0.001,max:100})+
      field("dpi","Mouse DPI",800,{min:1,max:50000});
    $("toolTips").innerHTML="<p>Conversion uses commonly published yaw scales. Fortnite sensitivity is approximate because its settings and input behavior differ.</p><p>Mouse DPI stays unchanged. Test the result in-game before relying on it.</p>";
    const yaw={valorant:0.07,cs2:0.022,overwatch:0.0066,apex:0.022,fortnite:0.0055};
    attach(()=>{
      const from=$("fromGame").value,to=$("toGame").value;
      const sens=number("sens"),dpi=number("dpi");
      const converted=sens*yaw[from]/yaw[to];
      setResult(converted.toFixed(4),
        `Estimated ${to.toUpperCase()} sensitivity · ${fmt(sens*dpi)} source eDPI`,
        "Converted sensitivity");
    });
  },
  nether(){
    $("toolControls").innerHTML=
      field("x","Overworld X",1000,{min:-30000000,max:30000000})+
      field("z","Overworld Z",-500,{min:-30000000,max:30000000})+
      select("direction","Conversion direction",[
        ["nether","Overworld → Nether"],["overworld","Nether → Overworld"]
      ]);
    $("toolTips").innerHTML="<p>Overworld and Nether horizontal coordinates use an 8:1 scale.</p><p>Y coordinates are not converted. Portal linking also depends on nearby existing portals and valid placement.</p>";
    attach(()=>{
      const factor=$("direction").value==="nether"?1/8:8;
      setResult(`X ${fmt(number("x")*factor)}`,
        `Z ${fmt(number("z")*factor)} · Scale ${factor===8?"×8":"÷8"}`,
        "Destination coordinates");
    });
  },
  fps(){
    $("toolControls").innerHTML=
      field("fpsInput","Frames per second (FPS)",144,{min:1,max:100000,step:0.1})+
      field("hz","Monitor refresh rate (Hz)",144,{min:1,max:1000,step:1});
    $("toolTips").innerHTML="<p>Frame time = 1000 ÷ FPS, expressed in milliseconds.</p><p>This is an average mathematical estimate, not a measurement of frame pacing, input latency, or stuttering.</p>";
    attach(()=>{
      const fps=number("fpsInput"),hz=number("hz");
      if(fps<=0||hz<=0)return setResult("—","Enter positive FPS and refresh-rate values.");
      setResult((1000/fps).toFixed(2)+" ms",
        `Monitor refresh interval: ${(1000/hz).toFixed(2)} ms`,
        "Average frame time");
    });
  },
  fortnite(){
    $("toolControls").innerHTML=
      field("currentLevel","Current level",50,{min:1,max:10000})+
      field("targetLevel","Target level",75,{min:1,max:10000})+
      field("currentXP","XP earned toward next level",0,{min:0,max:79999})+
      field("xpPerMatch","Estimated XP earned per match",25000,{min:1,max:10000000});
    $("toolTips").innerHTML="<p>Uses an illustrative 80,000 XP per level for the selected range. Actual Fortnite progression requirements can vary by season or level.</p><p>Use this as a planning estimate, not an official Epic Games XP tracker.</p>";
    attach(()=>{
      const levels=Math.max(0,integer(number("targetLevel"))-integer(number("currentLevel")));
      const needed=Math.max(0,levels*80000-integer(number("currentXP"),0,79999));
      const matches=number("xpPerMatch")>0?Math.ceil(needed/number("xpPerMatch")):0;
      setResult(fmt(needed)+" XP",
        `Approximately ${fmt(matches)} matches at your estimated XP per match`,
        "Estimated XP remaining");
    });
  },
  robux(){
    $("toolControls").innerHTML=
      field("amount","Item / pass sale price (Robux)",1000,{min:0,max:1000000000})+
      field("fee","Marketplace fee (%)",30,{min:0,max:100,step:0.1});
    $("toolTips").innerHTML="<p>Estimates the creator's earnings after a percentage marketplace fee.</p><p>Roblox fees and payout rules can differ by transaction type and program. Confirm the applicable rate for your sale.</p>";
    attach(()=>{
      const gross=Math.max(0,number("amount"));
      const fee=Math.min(100,Math.max(0,number("fee")));
      const net=Math.floor(gross*(1-fee/100));
      setResult(fmt(net)+" Robux",
        `Estimated fee: ${fmt(gross-net)} Robux`,
        "Estimated creator earnings");
    });
  },
  cs2(){
    $("toolControls").innerHTML=
      field("players","Players on your team",5,{min:1,max:5})+
      field("cash","Cash per player ($)",2900,{min:0,max:16000})+
      field("equipment","Equipment spending per player ($)",0,{min:0,max:16000});
    $("toolTips").innerHTML="<p>Estimates team cash available and remaining after the planned per-player purchase.</p><p>Players often have different money amounts. Entering one amount for every player is a simplified model.</p>";
    attach(()=>{
      const p=integer(number("players"),1,5);
      const cash=Math.max(0,number("cash"));
      const spend=Math.max(0,number("equipment"));
      const total=p*cash;
      const remaining=p*(cash-spend);
      setResult("$"+fmt(total),
        `After purchases: $${fmt(remaining)} · ${p} players`,
        "Estimated team economy");
    });
  },
  genshin(){
    $("toolControls").innerHTML=
      field("wishes","Current Intertwined Fates",20,{min:0,max:1000000})+
      field("primogems","Available Primogems",3200,{min:0,max:100000000})+
      field("pity","Current character-event pity",35,{min:0,max:89})+
      select("guaranteed","Next 5-star featured?",[
        ["no","Not guaranteed"],["yes","Guaranteed"]
      ]);
    $("toolTips").innerHTML="<p>Each wish costs 160 Primogems. On the character event banner, a 5-star is guaranteed within 90 wishes, with the featured-character guarantee depending on your previous 5-star result.</p><p>This is a planning calculator, not a probability simulator. Banner rules can change.</p>";
    attach(()=>{
      const total=integer(number("wishes"))+Math.floor(integer(number("primogems"))/160);
      const pity=integer(number("pity"),0,89);
      const toNext=90-pity;
      const maxFeatured=$("guaranteed").value==="yes"?toNext:toNext+90;
      setResult(fmt(total)+" wishes",
        `Up to ${toNext} wishes to next 5-star; up to ${maxFeatured} for featured character`,
        "Available wishes");
    });
  },
  rocket(){
    $("toolControls").innerHTML=
      select("currentRank","Current rank",RANKS.map((r,i)=>[i,r]))+
      select("targetRank","Target rank",RANKS.map((r,i)=>[i,r]))+
      field("wins","Estimated net rank divisions gained per session",1,{min:0.1,max:20,step:0.1});
    $("targetRank").value="16";
    $("toolTips").innerHTML="<p>Shows the number of rank tiers between your current and target rank.</p><p>Rocket League ranks are determined by matchmaking rating, not a fixed number of wins per tier. The session estimate is illustrative only.</p>";
    attach(()=>{
      const gap=Math.max(0,number("targetRank")-number("currentRank"));
      const pace=number("wins");
      setResult(fmt(gap)+" tiers",
        pace>0?`Illustrative progress: ${Math.ceil(gap/pace)} sessions at your chosen pace`:"Enter a positive progress rate.",
        "Rank tiers remaining");
    });
  },
  lol(){
    $("toolControls").innerHTML=
      field("currentLP","Current LP",45,{min:0,max:100})+
      field("winRate","Estimated win rate (%)",55,{min:0,max:100,step:0.1})+
      field("lpGain","LP gained per win",25,{min:0,max:100})+
      field("lpLoss","LP lost per defeat",23,{min:0,max:100})+
      field("matches","Matches to project",10,{min:1,max:1000});
    $("toolTips").innerHTML="<p>Expected LP per game = win probability × LP gain − loss probability × LP loss.</p><p>Actual LP, promotions, demotions, and matchmaking adjustments can differ. This projection is not a guarantee.</p>";
    attach(()=>{
      const wr=Math.min(100,Math.max(0,number("winRate")))/100;
      const expected=wr*number("lpGain")-(1-wr)*number("lpLoss");
      const change=expected*integer(number("matches"),1,1000);
      setResult((change>=0?"+":"")+fmt(change)+" LP",
        `Projected LP before tier changes: ${fmt(number("currentLP")+change)}`,
        "Expected LP change");
    });
  },
  crosshair(){
    $("toolControls").innerHTML=
      field("innerLength","Inner line length",6,{type:"range",min:0,max:20})+
      field("innerThickness","Inner line thickness",2,{type:"range",min:1,max:10})+
      field("gap","Center gap",3,{type:"range",min:0,max:20})+
      field("outerLength","Outer line length",0,{type:"range",min:0,max:20})+
      field("outline","Outline thickness",1,{type:"range",min:0,max:5})+
      field("crossColor","Crosshair color","#00ff99",{type:"color"})+
      `<div class="field"><label><input id="centerDot" type="checkbox"> Show center dot</label></div>
       <div class="field"><label><input id="showOutline" type="checkbox" checked> Show outline</label></div>`;
    $("toolPreview").innerHTML=
      `<div class="crosshair-preview">
        <svg viewBox="0 0 400 290" role="img" aria-label="Live crosshair preview">
          <g id="crosshairLines"></g>
        </svg>
       </div>
       <div class="tool-buttons">
         <button class="tool-button" id="copyCrosshair" type="button">Copy Settings</button>
         <button class="tool-button secondary" id="resetCrosshair" type="button">Reset</button>
       </div>`;
    $("toolTips").innerHTML=
      `<h3>Quick Presets</h3>
       <div class="tool-presets">
         <button type="button" data-preset="classic">Classic</button>
         <button type="button" data-preset="pro">Pro</button>
         <button type="button" data-preset="dot">Dot</button>
         <button type="button" data-preset="minimal">Minimal</button>
       </div>
       <p>Adjust the sliders to preview a crosshair. Copy the settings to reproduce them manually in Valorant.</p>`;
    const presets={
      classic:[6,2,3,0,1,false],
      pro:[4,2,2,0,1,false],
      dot:[0,2,0,0,1,true],
      minimal:[3,1,4,0,0,false]
    };
    function draw(){
      const len=number("innerLength")*2.5;
      const thick=number("innerThickness")*1.5;
      const gap=number("gap")*2.2;
      const outer=number("outerLength")*2.5;
      const outline=$("showOutline").checked?number("outline"):0;
      const color=$("crossColor").value;
      const shapes=[];
      function rect(x,y,w,h){
        shapes.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" stroke="#000" stroke-width="${outline}"/>`);
      }
      const cx=200,cy=145;
      if(len>0){
        rect(cx-gap-len,cy-thick/2,len,thick);
        rect(cx+gap,cy-thick/2,len,thick);
        rect(cx-thick/2,cy-gap-len,thick,len);
        rect(cx-thick/2,cy+gap,thick,len);
      }
      if(outer>0){
        const distance=gap+len+7;
        rect(cx-distance-outer,cy-thick/2,outer,thick);
        rect(cx+distance,cy-thick/2,outer,thick);
        rect(cx-thick/2,cy-distance-outer,thick,outer);
        rect(cx-thick/2,cy+distance,thick,outer);
      }
      if($("centerDot").checked){
        shapes.push(`<circle cx="${cx}" cy="${cy}" r="2.5" fill="${color}"/>`);
      }
      $("crosshairLines").innerHTML=shapes.join("");
    }
    document.querySelectorAll("#toolControls input").forEach(el=>{
      el.addEventListener("input",draw);
      el.addEventListener("change",draw);
    });
    document.querySelectorAll("[data-preset]").forEach(button=>{
      button.onclick=()=>{
        const p=presets[button.dataset.preset];
        ["innerLength","innerThickness","gap","outerLength","outline"].forEach((id,i)=>$(id).value=p[i]);
        $("centerDot").checked=p[5];
        document.querySelectorAll("[data-preset]").forEach(b=>b.classList.toggle("active",b===button));
        draw();
      };
    });
    $("resetCrosshair").onclick=()=>{
      ["innerLength","innerThickness","gap","outerLength","outline"].forEach((id,i)=>$(id).value=[6,2,3,0,1][i]);
      $("crossColor").value="#00ff99";
      $("centerDot").checked=false;
      $("showOutline").checked=true;
      draw();
    };
    $("copyCrosshair").onclick=async()=>{
      const ids=["innerLength","innerThickness","gap","outerLength","outline","crossColor"];
      const text=ids.map(id=>id+": "+$(id).value).join("\n")+
        "\nCenter dot: "+$("centerDot").checked+
        "\nShow outline: "+$("showOutline").checked;
      try{
        await navigator.clipboard.writeText(text);
        message("Settings copied. These are manual settings, not a Valorant import code.");
      }catch{
        message("Clipboard unavailable. Select the settings manually.");
      }
    };
    draw();
  }
};

initShell();

if(info && current!=="crosshair"){
  const preview=$("toolPreview");
  if(preview)preview.innerHTML=result("Calculated result");
}

if(info && setups[current])setups[current]();
