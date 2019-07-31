
function getActiveAccount() {
  window.addEventListener('AERGO_ACTIVE_ACCOUNT', function(event) {
    console.log(event.detail);
    document.getElementById('address').value = event.detail.account.address;
  }, { once: true });
  window.postMessage({
    type: 'AERGO_REQUEST',
    action: 'ACTIVE_ACCOUNT',
  });
}

function startSignRequest() {
  window.addEventListener('AERGO_SIGN_RESULT', function(event) {
    console.log(event.detail);
    document.getElementById('signature').value = event.detail.signature;
  }, { once: true });
  window.postMessage({
    type: 'AERGO_REQUEST',
    action: 'SIGN',
    data: {
      hash: document.getElementById('signMessage').value
    }
  });
}

const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

async function verify() {
  const addr = document.getElementById('address').value;
  if (!addr) {
    alert("Enter address");
    return;
  }
  const key = HerajsCrypto.publicKeyFromAddress(addr);
  const msg = fromHexString(document.getElementById('signMessage').value.slice(2));
  const signature = document.getElementById('signature').value;
  if (!signature) {
    alert("Enter signature");
    return;
  }
  const result = await window.HerajsCrypto.verifySignature(msg, key, signature, 'hex');
  if (result === true) {
    document.getElementById('verify').innerHTML = 'Verified ✓';
  } else {
    document.getElementById('verify').innerHTML = 'Not verified ✗';
  }
}