export type Line={label:string;qty:number;unit:string;price:number;tax:number};
export type Doc={id:string;kind:'devis'|'facture';number:string;clientId:string;projectId:string;date:string;due:string;status:string;lines:Line[];notes:string;source?:string;review?:boolean;snapshot?:{company:Company;client:Client};payments:{id:string;amount:number;date:string;method:string}[]};
export type Client={id:string;name:string;email:string;phone:string;address:string;ice:string};
export type Company={name:string;address:string;ice:string;rc:string;if:string;patente:string;phone:string;email:string};
export type State={owner:string;company:Company;users:{email:string;name:string;role:string;active:boolean}[];clients:Client[];projects:{id:string;name:string;clientId:string;status:string}[];docs:Doc[];counters:Record<string,number>;audit:{date:string;user:string;action:string}[]};
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Casablanca',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const money=(v:number)=>new Intl.NumberFormat('fr-MA',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v)+' DH';
export function totals(d:Pick<Doc,'lines'|'payments'>){const ht=d.lines.reduce((s,l)=>s+Math.round(l.qty*l.price*100),0);const tax=d.lines.reduce((s,l)=>s+Math.round(Math.round(l.qty*l.price*100)*l.tax/100),0);const paid=d.payments.reduce((s,p)=>s+Math.round(p.amount*100),0);return {ht:ht/100,tax:tax/100,ttc:(ht+tax)/100,paid:paid/100,balance:(ht+tax-paid)/100};}
export function status(d:Doc){if(d.kind==='devis'||d.status==='Brouillon')return d.status;const t=totals(d);return t.balance<=0?'Payée':d.due<today()?'En retard':t.paid>0?'Partiellement payée':'À régler';}
export function seed(email:string,name:string):State {return {owner:email,company:{name:'A.N.G Travaux S.A.R.L.',address:'634 Bureau N4, 2ème étage, Quartier Al Massar, Marrakech',ice:'003711607000027',rc:'162721',if:'66263701',patente:'64008141',phone:'0661872766 / 0612964355',email:''},users:[{email,name,role:'Administrateur',active:true}],clients:[{id:'nadia',name:'NADIA',email:'',phone:'',address:'',ice:''}],projects:[{id:'renovation-nadia',name:'Rénovation — Nadia',clientId:'nadia',status:'À planifier'}],docs:[{id:'devis-nadia',kind:'devis',number:'60/2026',clientId:'nadia',projectId:'renovation-nadia',date:'2026-10-06',due:'2026-11-06',status:'Brouillon',review:true,notes:'Import du devis fourni : quantités absentes, saisies à 1 forfait. Vérifier les désignations, les prix et les totaux avant validation. Total imprimé dans la source : 825 000 DH HT / 990 000 DH TTC.',payments:[],lines:sourceLines.map(([label,price])=>({label:String(label),price:Number(price),qty:1,unit:'forfait',tax:20}))}],counters:{},audit:[]};}
const sourceLines:[string,number][]=[['Démolition d’une chambre à l’entrée',4000],['Marbre au sol posé dans le patio et les trois couloirs',96800],['Habillage de deux poteaux au patio',2400],['Fourniture et pose de 2 portes en bois',28000],['Garde-corps en découpage laser',46000],['Porte de terrasse en fer',3000],['Couverture de terrasse motorisée — libellé à vérifier',36000],['Réaménagement de la fontaine au patio',7000],['Finition en tadelakt dans les salles de bain',10000],['Sanitaires, colonnes de douche et vasques — à vérifier',35000],['Séparations de douche',9000],['Interrupteurs, prises et tableau électrique',40000],['Neuf climatiseurs split muraux',63000],['Trappes de visite pour climatisation',6000],['Équipement des couloirs — libellé « proxys » à vérifier',23000],['Évacuations pour les balcons',4000],['Porte principale et moteur de porte de garage',35000],['Arrosage automatique du jardin',58000],['Mur de clôture de 50 m',47000],['Carrelage de deux bassins',5800],['Marbre à l’allée d’entrée',9000],['Système de filtration piscine',32000],['Finition de la piscine',49000],['Condamnation de la deuxième piscine',18000],['Surveillance et visiophone — à vérifier',26000],['Habillage des portes en bois',34000],['Pompe à chaleur piscine',56000],['Monocouche sur la façade',42000]];

// Keep separate annual sequences, including imported references and legacy numbers.
export const missingReference=(number:string|undefined)=>!number?.trim()||number==='Brouillon';
export function referenceIndex(number:string,kind:Doc['kind'],year:string):number {
  const current=(number||'').match(/^(\d+)\/(\d{4})$/);
  const legacy=(number||'').match(/^(DEV|FAC)-(\d{4})-(\d+)$/);
  const value=current&&current[2]===year?Number(current[1]):legacy&&legacy[1]===(kind==='devis'?'DEV':'FAC')&&legacy[2]===year?Number(legacy[3]):0;
  return Number.isSafeInteger(value)&&value>0?value:0;
}
export function nextReference(s:State,kind:Doc['kind'],date:string):string {
  const year=date.slice(0,4),key=kind+'-'+year;
  const last=Math.max(s.counters[key]||0,...s.docs.filter(d=>d.kind===kind).map(d=>referenceIndex(d.number,kind,year)));
  if(!Number.isSafeInteger(last+1))throw Error('Limite de numérotation atteinte');
  return `${last+1}/${year}`;
}
export function assignReference(s:State,d:Doc):void {
  const year=d.date.slice(0,4),key=d.kind+'-'+year;
  if(missingReference(d.number))d.number=nextReference(s,d.kind,d.date);
  else if(!referenceIndex(d.number,d.kind,year))throw Error('La date doit correspondre à l’année de la référence existante');
  if(s.docs.some(other=>other.id!==d.id&&other.kind===d.kind&&referenceIndex(other.number,d.kind,year)===referenceIndex(d.number,d.kind,year)))throw Error('Cette référence est déjà utilisée');
  s.counters[key]=Math.max(s.counters[key]||0,referenceIndex(d.number,d.kind,year));
}

export function matchesReference(reference:string,query:string):boolean {
  const normalize=(value:string)=>value.normalize('NFKC').toLowerCase().replace(/\s+/g,'');
  return normalize(reference).includes(normalize(query));
}

export function whatsAppMessage(d:Doc,s:State):string {
  const t=totals(d),company=d.snapshot?.company||s.company,client=d.snapshot?.client||s.clients.find(c=>c.id===d.clientId);
  const label=d.kind==='devis'?'Devis':'Facture';
  return ['Bonjour,', '', `${company.name}`, `${label} n° ${d.number}`, d.status==='Brouillon'?'BROUILLON — document non validé':'', `Client : ${client?.name||'Non renseigné'}`, `Date : ${d.date}`, `${d.kind==='devis'?'Valable jusqu’au':'Échéance'} : ${d.due}`, '', `Total HT : ${money(t.ht)}`, `TVA : ${money(t.tax)}`, `Total TTC : ${money(t.ttc)}`, ...(d.kind==='facture'?[`Déjà réglé : ${money(t.paid)}`,`Reste à payer : ${money(t.balance)}`]:[]), '', 'Cordialement,', company.name].filter(x=>x!==null).join('\n');
}
export function whatsAppUrl(message:string):string {
  return 'https://wa.me/212661872766?text='+encodeURIComponent(message);
}
