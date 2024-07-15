export interface CobaltResponse {
    status: 'error' | 'redirect' | 'success' | 'stream' | 'rate-limit' | 'picker';
    text?: string;
    url?: string;
    pickerType: 'various' | 'images';
    picker: object[];
    audio?: string;
}