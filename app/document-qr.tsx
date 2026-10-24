'use client';
import {useMemo} from 'react';
import QRCode from 'qrcode';
import {documentUrl} from '../lib/document-qr';
export default function DocumentQr({id,reference}:{id:string;reference:string}){
 const url=documentUrl(id);
 const qr=useMemo(()=>QRCode.create(url,{errorCorrectionLevel:'M'}),[url]);
 const n=qr.modules.size,margin=4;
 let path='';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(qr.modules.get(y,x))path+=`M${x+margin} ${y+margin}h1v1h-1z`;
 return <div className="document-qr"><a href={url} aria-label={'Ouvrir le document '+reference}><svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label={'QR code du document '+reference} width="144" height="144" viewBox={`0 0 ${n+8} ${n+8}`} shapeRendering="crispEdges"><rect width={n+8} height={n+8} fill="#fff"/><path d={path} fill="#000"/></svg></a><div><strong>Retrouver ce document</strong><p>Scannez le QR code avec votre téléphone<br/>ou le scanner du CRM.</p><small>Connexion et accès autorisé requis.</small><span>{reference}</span></div></div>
}
