import assert from 'node:assert/strict';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import {documentUrl,documentIdFromQr,CRM_ORIGIN} from '../lib/document-qr.ts';
for(const id of ['devis-nadia','95f11222-3dfe-4ba1-94c7-670a6ff2ddd2','facture avec espace']){
const url=documentUrl(id),qr=QRCode.create(url,{errorCorrectionLevel:'M'}),n=qr.modules.size,scale=5,w=(n+8)*scale,data=new Uint8ClampedArray(w*w*4).fill(255);
for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(qr.modules.get(y,x))for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++){const index=(((y+4)*scale+dy)*w+(x+4)*scale+dx)*4;data[index]=data[index+1]=data[index+2]=0;}
const decoded=jsQR(data,w,w);assert.equal(decoded?.data,url);assert.equal(documentIdFromQr(decoded.data),id);
}
for(const invalid of ['javascript:alert(1)','https://example.com/?document=devis-nadia',CRM_ORIGIN+'/?document=',CRM_ORIGIN+'/?document=a&document=b',CRM_ORIGIN+'/api/crm?document=a','60/2026'])assert.equal(documentIdFromQr(invalid),null);
console.log('QR encode/decode round trips and untrusted link rejection passed.');
