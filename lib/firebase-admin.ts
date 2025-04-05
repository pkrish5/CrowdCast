import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

const apps = getApps();

if (!apps.length) {
  const serviceAccount: ServiceAccount = {
    projectId: 'crowdcast-a94e9',
    clientEmail: 'firebase-adminsdk-fbsvc@crowdcast-a94e9.iam.gserviceaccount.com',
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCl05SF0patxu3S\nSG+7rgzRi7ySuz8AqGmU699OcwFti1V19weFp+lQsE9nboLcVM/UKq7GNmfLph+N\nAVQvO1rCQ0ftCbL3bKzl3mqewEIyXaXNcnf+QpVixVS8EjNtEdJPw5WYXS/RAGdG\nxQmufnQbPU7nB95azBbdZE1xedEBrt9LE5sK3O2HmGqn9EUnLwSUuK7jcne9yNGa\nFPJIw1mc4pyDRB8+jOb3sifL8MeeTa22T+LNwXvZG1dfX3j0iHw9ed8oRaND/HwI\nW0HZdCjHWuPq6DsGl3q0sFnUVNuui/DwSMO9TQ8zWlc44UhgcqNP55MIJVDblBwU\nDQfWvCONAgMBAAECggEANj8bxBda4WhFHlhB7PSIDviWbK3Cc3WkbGoo9+HZYruE\n7n0sQcXnJlU29JALUQaRokeAOylLFSy3/4miv3y8OPaHjfxxRk2P1fbHjD06qn1G\nIwpCRLQFaHVDPe76UcDVuvAxfNFnNgjawCTvAN0vIEYTDLLfQ3amODB6wRdnjxPd\n9yZEIjPILt+CMhsMIEBTXOQ8Uqtql4+kZQhJVC3k2DO0/2c0QeJlKg/cboDtnTxH\nV3Lp1ZRGuL/9N6qsk6e0fCamRwgi3X8WPI81qQi7wWZrlIOk1ShXt5mGnlm32hoT\nIbxr4dEIhxt6uxKynr0GmHZ/2MZhPTXCOAa091bahQKBgQDRpS9Z4m7qkMbbXzTT\ngHz9UHbyxQGywDlKEuJiLAhdK9lkeH3INCXzjxnijmyddCoJNmpLj3AN4SB3SFsO\n09TzmhY6BJaFW7zgVlkbEcFTZ8aAgZMWABAA7nLtv2slEFbJ18oOamDshqojs5xc\nx1RXP208/+MCzQ+1JOb8jRQguwKBgQDKfhDsAIlNxAmuT6WQuslXb1gcBF1i6Jb4\nFiUyYgVCCB34QLJ/lCr+xVPCiAXdaCY9IYBXRTf0xMfyr5lKTSpqTFnJ68iyA5f2\nNhS0d6RygGEK+m9pDg/RX4iikb0WhGRymZfG1ptvXnayLr2cNcleqZII82VHjchp\nfflci3DMVwKBgQDRVcASYKegUTA/nLGC/6nOx6n+f/lSI98QuAqVPKKdZkuMp0Px\nxSCgMyQFtXF/R58x08QP7wpU0Zc5hGZoR9074YCQLkSepRvUZmRTQ0dnoRf0+W2F\nakqQo4jfHWQ/fjErGu4HtvFRPKZnP9HCUsdE13CcmGZ1RY2Js29yfuy6QQKBgDTf\nJdv5Z+B+R2jUMw7PNrM1x3PJT/j7ci/k2GGHZogPRoQDoJffQDq1m2E30xA0mYds\nr+4ZjLrEhtC/OO9FpsWKmgc3IXgZqBwJku5sLuwWyT/slBqCKW8p2qtYEl9GwlOJ\n9y9b6cnyiFuOCMQ45xNog1EC/HbqdmHVGr8nSZSRAoGAfhPiUINjTB/w3TLYAXzV\nUMJR20FGuQfZD6OnEyx6CKAhrvZvXnmbqQCMmEfmU5ndimTzuNFGLiXz1P4g6umM\nE/j7D3pQ9gasOQixHviB2gsZUf8m/m3hHrxoEZ9NoN9p/YQFvtcTKj7yCu0XMI3E\nyP35oRV0GQrRBFOvs9UvIj0=\n-----END PRIVATE KEY-----\n"
  };

  initializeApp({
    credential: credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
  });
}

const adminDb = getFirestore();

export { adminDb }; 