export interface EncryptedPayload {
    encryptedText: string;
    salt: string;
    iv: string;
}

const enc = new TextEncoder();;
const dec = new TextDecoder();

 async function encrypt(
    text: string,
    password: string
): Promise<EncryptedPayload> {
    const data = enc.encode(text)
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    )

    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
    )

    const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        data
    )

    const bufferToBase64 = (buffer: ArrayBuffer) => {
        return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    }

    return {
        encryptedText: bufferToBase64(encryptedData),
        salt: bufferToBase64(salt),
        iv: bufferToBase64(iv),
    };
}

async function decrypt(
    encryptedPayload: EncryptedPayload,
    password: string
): Promise<string> {
    const { encryptedText, salt, iv } = encryptedPayload;

    const base64ToBuffer = (base64: string): ArrayBuffer => {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    };

    const saltBuffer = base64ToBuffer(salt);
    const ivBuffer = base64ToBuffer(iv);
    const encryptedBuffer = base64ToBuffer(encryptedText);

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: saltBuffer,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBuffer },
        key,
        encryptedBuffer
    );

    return dec.decode(decryptedBuffer);
}

const Encryptor = {
    encrypt,
    decrypt
}
export default Encryptor