
/* active account */
function getActiveAccount() {
  window.addEventListener('AERGO_ACTIVE_ACCOUNT', function(event) {
    console.log(event.detail);
    document.getElementById('address').value = event.detail.account.address;
    // insert into txBody if not changed
    try {
      let txData = JSON.parse(document.getElementById('txJson').value);
      if (!txData.from) {
        txData.from = event.detail.account.address;
        document.getElementById('txJson').value = JSON.stringify(txData, undefined, 2);
      }
    } catch(e) {}
  }, { once: true });
  window.postMessage({
    type: 'AERGO_REQUEST',
    action: 'ACTIVE_ACCOUNT',
  });
}

/* message sign */
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

/* tx sign */
function startTxSignRequest() {
  let data;
  try {
    data = jsonlint.parse(document.getElementById('txJson').value)
  } catch(e) {
    console.log(e);
    alert('Could not parse tx json. ' + e);
    return;
  }

  window.addEventListener('AERGO_SIGN_TX_RESULT', function(event) {
    console.log('AERGO_SIGN_TX_RESULT', event.detail);
    document.getElementById('tx_signature').value = event.detail.signature;
  }, { once: true });
  window.postMessage({
    type: 'AERGO_REQUEST',
    action: 'SIGN_TX',
    data
  });
}
function startTxSendRequest() {
  let data;
  try {
    data = jsonlint.parse(document.getElementById('txJson').value)
  } catch(e) {
    console.log(e);
    alert('Could not parse tx json. ' + e);
    return;
  }

  window.addEventListener('AERGO_SEND_TX_RESULT', function(event) {
    console.log('AERGO_SEND_TX_RESULT', event.detail);
    document.getElementById('tx_hash').innerHTML = event.detail.hash;
  }, { once: true });
  window.postMessage({
    type: 'AERGO_REQUEST',
    action: 'SEND_TX',
    data
  });
}

/** utils */
const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

const hexToBase64 = hexString => {
    return btoa(hexString.match(/\w{2}/g).map(function(a) {
        return String.fromCharCode(parseInt(a, 16));
    }).join(""));
}
