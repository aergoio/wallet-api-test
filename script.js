/**
 * Wrapper to make a promise out of a async call to Aergo Connect
 */
function aergoConnectCall(action, responseType, data) {
  return new Promise((resolve, reject) => {
    window.addEventListener(responseType, function(event) {
      resolve(event.detail);
    }, { once: true });
    window.addEventListener(responseType + '_CANCEL', function() {
      reject(new Error('request was cancelled by user'));
    }, { once: true });
    window.postMessage({
      type: 'AERGO_REQUEST',
      action: action,
      data: data,
    });
  });
}

/* active account */
async function getActiveAccount() {
  const result = await aergoConnectCall('ACTIVE_ACCOUNT', 'AERGO_ACTIVE_ACCOUNT', {});
  document.getElementById('address').value = result.account.address;
  // insert into txBody if not changed
  try {
    let txData = JSON.parse(document.getElementById('txJson').value);
    if (!txData.from) {
      txData.from = result.account.address;
      document.getElementById('txJson').value = JSON.stringify(txData, undefined, 2);
    }
  } catch(e) {}
}

/* message sign */
async function startSignRequest() {
  const result = await aergoConnectCall('SIGN', 'AERGO_SIGN_RESULT', {
    hash: document.getElementById('signMessage').value
  });
  document.getElementById('signature').value = result.signature;
}

async function verify() {
  const addr = document.getElementById('address').value;
  if (!addr) {
    alert("Enter address");
    return;
  }
  const key = window.HerajsCrypto.publicKeyFromAddress(addr);
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

function parseJson(json) {
  try {
    return jsonlint.parse(json)
  } catch(e) {
    alert('Could not parse tx json. ' + e);
    throw e;
  }
}

/* tx sign */
async function startTxSignRequest() {
  let data = parseJson(document.getElementById('txJson').value);
  const result = await aergoConnectCall('SIGN_TX', 'AERGO_SIGN_TX_RESULT', data);
  console.log('AERGO_SIGN_TX_RESULT', result);
  document.getElementById('tx_signature').value = result.signature;
}
async function startTxSendRequest() {
  let data = parseJson(document.getElementById('txJson').value);
  const result = await aergoConnectCall('SEND_TX', 'AERGO_SEND_TX_RESULT', data);
  console.log('AERGO_SEND_TX_RESULT', result);
  document.getElementById('tx_hash').innerHTML = result.hash;
}

/** utils */
const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

const hexToBase64 = hexString => {
    return btoa(hexString.match(/\w{2}/g).map(function(a) {
        return String.fromCharCode(parseInt(a, 16));
    }).join(""));
}
