import CryptoJS from "crypto-js";

export interface EncryptedPayload {
  encryptedText: string;
  salt: string;
  iv: string;
}

function encrypt(text: string, password: string): EncryptedPayload {
  const salt = CryptoJS.lib.WordArray.random(16);
  const iv = CryptoJS.lib.WordArray.random(16);

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 100000,
    hasher: CryptoJS.algo.SHA256,
  });

  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return {
    encryptedText: encrypted.toString(),
    salt: CryptoJS.enc.Base64.stringify(salt),
    iv: CryptoJS.enc.Base64.stringify(iv),
  };
}

function decrypt(payload: EncryptedPayload, password: string): string {
  const { encryptedText, salt, iv } = payload;

  const saltWords = CryptoJS.enc.Base64.parse(salt);
  const ivWords = CryptoJS.enc.Base64.parse(iv);

  const key = CryptoJS.PBKDF2(password, saltWords, {
    keySize: 256 / 32,
    iterations: 100000,
    hasher: CryptoJS.algo.SHA256,
  });

  const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
    iv: ivWords,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

const Encryptor = {
  encrypt,
  decrypt,
};

export default Encryptor;
