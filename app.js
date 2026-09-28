let currentPage='splash';
let lastTimbulan=null,lastVolume=null;
let savedHistory=JSON.parse(localStorage.getItem('ecowasteHistory')||'[]');

function showPage(page){
  document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
  document.getElementById(page).classList.remove('hidden');
  currentPage=page;
  if(page==='riwayat') renderHistory();
}
function toggleMenu(){toast('Menu Ecowaste Calc');}

function formatNumber(n,d=2){return Number(n).toLocaleString('id-ID',{minimumFractionDigits:d,maximumFractionDigits:d});}

function calculateTimbulan(){
  const pop=+document.getElementById('population').value;
  const weight=+document.getElementById('totalWeight').value;
  const days=+document.getElementById('days').value;
  if(!pop||!weight||!days) return toast('Lengkapi data terlebih dahulu.');

  // Mengikuti tampilan/contoh pada desain:
  // timbulan per kapita = berat total / jumlah penduduk
  const perCapita=weight/pop;
  const daily=weight/days;
  const density=125;
  const volume=daily/density;

  lastTimbulan={pop,weight,days,perCapita,daily,volume};
  document.getElementById('perCapitaResult').textContent=`${formatNumber(perCapita)} kg/orang/hari`;
  document.getElementById('dailyResult').textContent=`${formatNumber(daily)} kg/hari`;
  document.getElementById('dailyVolumeResult').textContent=`${formatNumber(volume)} m³/hari`;
  document.getElementById('literResult').textContent=`(${formatNumber(volume*1000,0)} liter/hari)`;
  showPage('timbulanResult');
}

function calculateVolume(){
  const weight=+document.getElementById('volumeWeight').value;
  const density=+document.getElementById('density').value;
  if(!weight||!density) return toast('Masukkan berat dan densitas.');
  const volume=weight/density;
  lastVolume={weight,density,volume};
  document.getElementById('volumeResultValue').textContent=`${formatNumber(volume)} m³`;
  document.getElementById('volumeLiter').textContent=`(${formatNumber(volume*1000,0)} liter)`;
  document.getElementById('weightInfo').textContent=`${formatNumber(weight)} kg`;
  document.getElementById('densityInfo').textContent=`${formatNumber(density)} kg/m³`;
  const containers=Math.ceil(volume/0.5);
  document.getElementById('capacityInfo').innerHTML=`${containers} kontainer 500 L<br>(${formatNumber(containers*0.5)} m³)`;
  showPage('volumeResult');
}

function saveTimbulan(){
  if(!lastTimbulan)return;
  savedHistory.unshift({type:'Timbulan Sampah',icon:'🌿',date:new Date().toLocaleString('id-ID'),value:`${formatNumber(lastTimbulan.perCapita)} kg/orang/hari`});
  localStorage.setItem('ecowasteHistory',JSON.stringify(savedHistory));
  toast('Hasil timbulan disimpan.');
}
function saveVolume(){
  if(!lastVolume)return;
  savedHistory.unshift({type:'Volume Sampah',icon:'◈',date:new Date().toLocaleString('id-ID'),value:`${formatNumber(lastVolume.volume)} m³/hari`});
  localStorage.setItem('ecowasteHistory',JSON.stringify(savedHistory));
  toast('Hasil volume disimpan.');
}

function renderHistory(){
  const box=document.getElementById('historyList');
  if(!savedHistory.length){
    box.innerHTML='<div class="info-box">Belum ada riwayat perhitungan.</div>';
    return;
  }
  box.innerHTML=savedHistory.map((h,i)=>`
    <div class="history-item">
      <div class="icon">${h.icon}</div>
      <div><b>${h.type}</b><small>${h.date}</small><small>${h.value}</small></div>
    </div>`).join('');
}

function getHistoricalData(){
  return [...document.querySelectorAll('#historyTable tbody tr')].map(row=>{
    const cells=row.querySelectorAll('td');
    return {x:+cells[0].textContent,y:+cells[1].textContent};
  });
}
function addHistoricalData(){
  const x=+document.getElementById('newX').value,y=+document.getElementById('newY').value;
  if(!x||!y)return toast('Isi X dan Y.');
  const tr=document.createElement('tr');
  tr.innerHTML=`<td>${x}</td><td>${y}</td>`;
  document.querySelector('#historyTable tbody').appendChild(tr);
  document.getElementById('newX').value='';
  document.getElementById('newY').value='';
}
function linearRegression(data){
  const n=data.length;
  const sx=data.reduce((s,p)=>s+p.x,0), sy=data.reduce((s,p)=>s+p.y,0);
  const sxy=data.reduce((s,p)=>s+p.x*p.y,0), sx2=data.reduce((s,p)=>s+p.x*p.x,0);
  const b=(n*sxy-sx*sy)/(n*sx2-sx*sx);
  const a=(sy-b*sx)/n;
  return {a,b};
}
function runRegression(){
  const data=getHistoricalData();
  if(data.length<2)return toast('Minimal 2 data historis.');
  const {a,b}=linearRegression(data);
  document.getElementById('regressionEquation').textContent=`y = ${formatNumber(a)} + ${formatNumber(b)}x`;
  toast('Model regresi berhasil dibuat.');
}
function predictRegression(){
  const data=getHistoricalData(),x=+document.getElementById('predictX').value;
  if(data.length<2||!x)return toast('Masukkan nilai X.');
  const {a,b}=linearRegression(data),y=a+b*x;
  document.getElementById('predictionOutput').textContent=`Prediksi untuk ${x} orang = ${formatNumber(y)} kg/hari`;
}
function selectPrediction(type){
  document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
  if(type==='regresi'){
    document.querySelectorAll('.tab')[0].classList.add('active');
    document.getElementById('regresiBox').classList.remove('hidden');
    document.getElementById('interpolasiBox').classList.add('hidden');
  }else{
    document.querySelectorAll('.tab')[1].classList.add('active');
    document.getElementById('regresiBox').classList.add('hidden');
    document.getElementById('interpolasiBox').classList.remove('hidden');
  }
}
function interpolate(){
  const x1=+document.getElementById('x1').value,y1=+document.getElementById('y1').value;
  const x2=+document.getElementById('x2').value,y2=+document.getElementById('y2').value;
  const x=+document.getElementById('interpX').value;
  if(x1===x2)return toast('X1 dan X2 tidak boleh sama.');
  const y=y1+(x-x1)*(y2-y1)/(x2-x1);
  document.getElementById('interpResult').textContent=`${formatNumber(y)} kg/hari`;
}
function exportReport(){
  const rows=savedHistory.map(h=>`<tr><td>${h.type}</td><td>${h.date}</td><td>${h.value}</td></tr>`).join('');
  const html=`<html><head><title>Laporan Ecowaste Calc</title><style>body{font-family:Arial;padding:30px}h1{color:#08783f}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:10px}</style></head><body><h1>Ecowaste Calc</h1><p>Laporan Riwayat Perhitungan</p><table><tr><th>Jenis</th><th>Waktu</th><th>Hasil</th></tr>${rows||'<tr><td colspan="3">Belum ada data</td></tr>'}</table><script>window.print()<\/script></body></html>`;
  const win=window.open('','_blank'); win.document.write(html); win.document.close();
}
function toast(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.style.display='block';
  setTimeout(()=>t.style.display='none',2200);
}
