export const CRM_ORIGIN='https://ang-travaux-gestion.greenbun8.chatgpt.site';
export function documentUrl(id:string):string {return `${CRM_ORIGIN}/?document=${encodeURIComponent(id)}`;}
export function documentIdFromQr(raw:string):string|null {
  try{const u=new URL(raw.trim());if(u.origin!==CRM_ORIGIN||u.pathname!=='/'||u.username||u.password)return null;const ids=u.searchParams.getAll('document');return ids.length===1&&ids[0].length>0&&ids[0].length<=200?ids[0]:null;}catch{return null;}
}
