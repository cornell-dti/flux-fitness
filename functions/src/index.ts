const serviceAccount = require('../firebase.json');
const admin = require('firebase-admin');
const XLSX = require('xlsx');
const functions = require('firebase-functions');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://campus-density.firebaseio.com"
});

const db = admin.firestore();
const gyms = ['teagle', 'helen_newman', 'noyes', 'appel'];

exports.getURL = functions.https.onCall((data: { id: string, startDate: string, endDate: string }) => {
    if (!data.id || !data.startDate || !data.endDate) {
        throw new functions.https.HttpsError('invalid-argument', 'ID missing!');
    }
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const id = data.id;
    return getData(id, startDate, endDate);
});

async function getData(gymName: string, startDate: Date, endDate: Date) {
    console.log(startDate);
    console.log(endDate);
    const gymCounts = db.collection('gymdata').doc(gymName).collection('counts').where('time', '>=', startDate).where('time', '<=', endDate);
    const allGymDocs = await gymCounts.get();
    const sheet = allGymDocs.docs.map((doc: any) => [new Date(doc.get('time').seconds * 1000).toLocaleString(), doc.get('treadmill'), doc.get('count')]);
    sheet.unshift(['Time', 'Treadmill Count', 'Total Count']);
    const wb = XLSX.utils.book_new();
    wb.SheetNames.push(gymName);
    const ws = XLSX.utils.aoa_to_sheet(sheet);
    wb.Sheets[gymName] = ws;
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const storage = admin.storage();

    const bucket = storage.bucket('campus-density-gym');
    const file = bucket.file(`${gymName}.xlsx`);
    await file.save(buffer);
    return "/campus-density-gym";
};