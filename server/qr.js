'use strict';
// Self-contained ISO/IEC 18004 QR Code encoder for short ASCII LAN URLs.
// Version 3, error correction level L, byte mode, 29x29 modules; no dependencies.
const SIZE = 29;
const DATA_LENGTH = 55;
const ECC_LENGTH = 15;

function gfMultiply(a, b) {
  let result = 0;
  for (let i=7; i>=0; i--) {
    result = (result << 1) ^ ((result >>> 7) * 0x11d);
    result ^= ((b >>> i) & 1) * a;
  }
  return result;
}
function eccRemainder(bytes) {
  const divisor = new Uint8Array(ECC_LENGTH);
  divisor[ECC_LENGTH-1] = 1;
  let root = 1;
  for (let i=0; i<ECC_LENGTH; i++) {
    for (let j=0; j<ECC_LENGTH; j++) {
      divisor[j] = gfMultiply(divisor[j], root);
      if (j+1<ECC_LENGTH) divisor[j] ^= divisor[j+1];
    }
    root = gfMultiply(root, 2);
  }
  const output = new Uint8Array(ECC_LENGTH);
  for (const b of bytes) {
    const factor = b ^ output[0];
    output.copyWithin(0,1);
    output[ECC_LENGTH-1] = 0;
    for (let i=0; i<ECC_LENGTH; i++) output[i] ^= gfMultiply(divisor[i],factor);
  }
  return [...output];
}
function getCodewords(text) {
  const bytes = Buffer.from(text,'utf8');
  if (bytes.length > 53) throw new Error('QR link exceeds version 3 byte capacity');
  const bits=[];
  const append = (value, length) => {for(let i=length-1;i>=0;i--) bits.push((value >>> i)&1);};
  append(0b0100,4);append(bytes.length,8);
  for(const b of bytes) append(b,8);
  append(0,Math.min(4,DATA_LENGTH*8-bits.length));
  while(bits.length%8) bits.push(0);
  const result=[];
  for(let i=0;i<bits.length;i+=8) result.push(parseInt(bits.slice(i,i+8).join(''),2));
  for(let i=0;result.length<DATA_LENGTH;i++) result.push(i%2 ? 0x11 : 0xEC);
  return [...result,...eccRemainder(result)];
}
function formatBits(mask) {
  const data = (1 << 3) | mask; // QR ECC level L has binary bits 01
  let remainder = data;
  for (let i=0;i<10;i++) remainder=(remainder<<1)^((remainder>>>9)*0x537);
  return ((data<<10)|remainder)^0x5412;
}
function masked(x,y,mask) {
  switch(mask) {
    case 0: return (x+y)%2===0;
    case 1: return y%2===0;
    case 2: return x%3===0;
    case 3: return (x+y)%3===0;
    case 4: return (Math.floor(y/2)+Math.floor(x/3))%2===0;
    case 5: return (x*y)%2+(x*y)%3===0;
    case 6: return ((x*y)%2+(x*y)%3)%2===0;
    case 7: return ((x+y)%2+(x*y)%3)%2===0;
  }
  throw new Error('Unknown QR mask');
}
function createQrMatrix(text) {
  if (typeof text !== 'string' || !/^http:\/\/[\d.:/?=&#a-zA-Z-]+$/.test(text)) throw new Error('QR supports local HTTP IPv4 URLs only');
  const modules = Array.from({length:SIZE},()=>Array(SIZE).fill(0));
  const functions = Array.from({length:SIZE},()=>Array(SIZE).fill(false));
  function set(x,y,dark) {
    if (x<0||y<0||x>=SIZE||y>=SIZE) return;
    modules[y][x]=dark?1:0;
    functions[y][x]=true;
  }
  function finder(cx,cy) {
    for(let y=-4;y<=4;y++) for(let x=-4;x<=4;x++) {
      const dist=Math.max(Math.abs(x),Math.abs(y));
      set(cx+x,cy+y,dist!==2 && dist!==4);
    }
  }
  finder(3,3);finder(SIZE-4,3);finder(3,SIZE-4);
  for(let i=8;i<SIZE-8;i++) {set(6,i,i%2===0);set(i,6,i%2===0);}
  for(let dy=-2;dy<=2;dy++) for(let dx=-2;dx<=2;dx++) {
    set(SIZE-7+dx,SIZE-7+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1);
  }
  function drawFormat(mask) {
    const bits=formatBits(mask);
    const bit=i=>(bits>>>i)&1;
    for(let i=0;i<=5;i++) set(8,i,bit(i));
    set(8,7,bit(6));set(8,8,bit(7));set(7,8,bit(8));
    for(let i=9;i<15;i++) set(14-i,8,bit(i));
    for(let i=0;i<8;i++) set(SIZE-1-i,8,bit(i));
    for(let i=8;i<15;i++) set(8,SIZE-15+i,bit(i));
    set(8,SIZE-8,1);
  }
  drawFormat(0); // Reserve modules before placing encoded bits.
  const codewords=getCodewords(text);
  let bit=0;
  for(let right=SIZE-1;right>=1;right-=2) {
    if(right===6) right=5;
    for(let vert=0;vert<SIZE;vert++) for(let j=0;j<2;j++) {
      const x=right-j;
      const y=((right+1)&2)===0 ? SIZE-1-vert : vert;
      if(functions[y][x]) continue;
      if(bit<codewords.length*8) modules[y][x]=(codewords[bit>>>3]>>>(7-(bit&7)))&1;
      bit++;
    }
  }
  // Choose the most readable of the 8 standardized patterns.
  let best=null,bestScore=Infinity;
  for(let mask=0;mask<8;mask++) {
    const matrix=modules.map(row=>row.slice());
    for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++) if(!functions[y][x]&&masked(x,y,mask)) matrix[y][x]^=1;
    const bits=formatBits(mask), b=i=>(bits>>>i)&1;
    for(let i=0;i<=5;i++) matrix[i][8]=b(i);
    matrix[7][8]=b(6);matrix[8][8]=b(7);matrix[8][7]=b(8);
    for(let i=9;i<15;i++) matrix[8][14-i]=b(i);
    for(let i=0;i<8;i++) matrix[8][SIZE-1-i]=b(i);
    for(let i=8;i<15;i++) matrix[SIZE-15+i][8]=b(i);
    matrix[SIZE-8][8]=1;
    let score=0;
    for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++) {
      if(x+1<SIZE && y+1<SIZE && matrix[y][x]===matrix[y][x+1] && matrix[y][x]===matrix[y+1][x] && matrix[y][x]===matrix[y+1][x+1]) score+=3;
    }
    for(let t=0;t<2;t++) for(let a=0;a<SIZE;a++) {
      const line=Array.from({length:SIZE},(_,i)=>t?matrix[i][a]:matrix[a][i]);
      let run=1;
      for(let i=1;i<SIZE;i++) {
        if(line[i]===line[i-1]) {run++;if(run===5)score+=3;else if(run>5)score++;}
        else run=1;
      }
      const s=line.join('');
      for(let i=0;i<=SIZE-11;i++) if(s.slice(i,i+11)==='10111010000'||s.slice(i,i+11)==='00001011101') score+=40;
    }
    const dark=matrix.flat().reduce((n,v)=>n+v,0);
    score+=Math.floor(Math.abs(dark*20-SIZE*SIZE*10)/(SIZE*SIZE))*10;
    if(score<bestScore) {best=matrix;bestScore=score;}
  }
  return best;
}
function createQrSvg(url) {
  const matrix=createQrMatrix(url);
  const boxes=[];
  for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++) if(matrix[y][x]) boxes.push(`M${x+4},${y+4}h1v1h-1z`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 37" width="296" height="296" role="img" aria-label="Scan to open the phone typing controller"><rect width="37" height="37" fill="#fff"/><path d="${boxes.join('')}" fill="#101827"/></svg>`;
}
module.exports={createQrMatrix,createQrSvg};
