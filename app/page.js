'use client';
import React,{useState,useMemo} from 'react';
import * as XLSX from 'xlsx';

export default function Page(){
const [pickup,setPickup]=useState([]);
const [deli,setDeli]=useState([]);

const parsePickup=(file)=>{
const reader=new FileReader();
reader.onload=(e)=>{
const wb=XLSX.read(e.target.result,{type:'binary'});
const ws=wb.Sheets[wb.SheetNames[0]];
const data=XLSX.utils.sheet_to_json(ws);

const res=data.filter(r=>r.status==='COMPLETED').map(r=>({
date:r.pickup_time?.split(' ')[0],
rev:(Number(r.weight)||0)*490
}));

setPickup(res);
};
reader.readAsBinaryString(file);
};

const parseDeli=(file)=>{
const reader=new FileReader();
reader.onload=(e)=>{
const wb=XLSX.read(e.target.result,{type:'binary'});
const ws=wb.Sheets[wb.SheetNames[0]];
const data=XLSX.utils.sheet_to_json(ws);

const res=data.map(r=>{
const cw=Number(r.CW||0);
return{
date:r.date,
rev:cw<20?30000:cw*1650
}
});
setDeli(res);
};
reader.readAsBinaryString(file);
};

const summary=useMemo(()=>{
const map={};
pickup.forEach(r=>{
map[r.date]=map[r.date]||{pickup:0,deli:0};
map[r.date].pickup+=r.rev;
});
deli.forEach(r=>{
map[r.date]=map[r.date]||{pickup:0,deli:0};
map[r.date].deli+=r.rev;
});
return Object.entries(map).map(([date,v])=>({...v,date,total:v.pickup+v.deli}));
},[pickup,deli]);

const totals=summary.reduce((a,b)=>({
pickup:a.pickup+b.pickup,
deli:a.deli+b.deli,
total:a.total+b.total
}),{pickup:0,deli:0,total:0});

return(
<div style={{padding:40}}>
<h1>AURA BI Dashboard</h1>

<div style={{display:'flex',gap:20}}>
<input type='file' onChange={e=>parsePickup(e.target.files[0])}/>
<input type='file' onChange={e=>parseDeli(e.target.files[0])}/>
</div>

<h3>Total: {totals.total.toLocaleString()}</h3>

<table border='1'>
<thead><tr><th>Date</th><th>Pickup</th><th>Deli</th><th>Total</th></tr></thead>
<tbody>
{summary.map((r,i)=>(
<tr key={i}>
<td>{r.date}</td>
<td>{r.pickup}</td>
<td>{r.deli}</td>
<td>{r.total}</td>
</tr>
))}
</tbody>
</table>
</div>
)
}
