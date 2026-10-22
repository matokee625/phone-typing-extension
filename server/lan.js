'use strict';
const net = require('node:net');
function privateIpv4(address) {
  if(net.isIP(address)!==4) return false;
  const p=address.split('.').map(Number);
  return p[0]===10 || (p[0]===172 && p[1]>=16 && p[1]<=31) || (p[0]===192 && p[1]===168);
}
function rank(name) {
  if (/wi-?fi|wireless|wlan|^wl\w*|^en[01]$/i.test(name)) return 0;
  if (/virtual|vmware|virtualbox|vbox|vethernet|docker|wsl|tunnel|hyper-v|loopback/i.test(name)) return 3;
  if (/ethernet|local area|^eth\d*/i.test(name)) return 1;
  return 2;
}
function getPhoneUrls(interfaces, port, code) {
  const seen=new Set();
  const candidates=[];
  const query = code ? `?code=${encodeURIComponent(code)}` : '';
  for(const [name, entries] of Object.entries(interfaces)) for(const item of entries || []) {
    if(item.family!=='IPv4'||item.internal||!privateIpv4(item.address)||seen.has(item.address)) continue;
    seen.add(item.address);
    candidates.push({name,address:item.address,url:`http://${item.address}:${port}/${query}`});
  }
  return candidates.sort((a,b)=>rank(a.name)-rank(b.name)||a.name.localeCompare(b.name));
}
module.exports={getPhoneUrls};
