export default function parseFarsiInt(farsiStr) {
    const farsiDigits = '۰۱۲۳۴۵۶۷۸۹';
    const englishDigits = '0123456789';
    let englishStr = '';
    for (let ch of farsiStr) {
        const idx = farsiDigits.indexOf(ch);
        if (idx > -1) {
            englishStr += englishDigits[idx];
        } else {
            englishStr += ch;
        }
    }
    return parseInt(englishStr, 10);
}
