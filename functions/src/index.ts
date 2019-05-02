const serviceAccount = require('../firebase.json');
const admin = require('firebase-admin');
const XLSX = require('xlsx');
const functions = require('firebase-functions');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://testing-gym-data.firebaseio.com", 
    client_email: "firebase-adminsdk-l2o7o@testing-gym-data.iam.gserviceaccount.com"
});

const db = admin.firestore();
const gyms = ['teagle', 'helen_newman', 'noyes', 'appel'];

exports.getURL = functions.https.onCall((data: any) => {
    const id = data.id
    return getData(id); 
});

async function getData(gymName: string) {
    const gymCounts = db.collection('gymdata').doc(gymName).collection('counts');
    const allGymDocs = await gymCounts.get();
    const sheet = allGymDocs.docs.map((doc: any) => [new Date(doc.get('time').seconds * 1000).toLocaleString(), doc.get('treadmill'), doc.get('count')]);
    sheet.unshift(['Time', 'Treadmill Count', 'Total Count']);

    const wb = XLSX.utils.book_new();
    wb.SheetNames.push(gymName);
    const ws = XLSX.utils.aoa_to_sheet(sheet);
    wb.Sheets[gymName] = ws;
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const storage = admin.storage();

    const bucket = storage.bucket('testing-gym-data');
    const file = bucket.file(`${gymName}.xlsx`);
    await file.save(buffer);
    return "/testing-gym-data"; 

};
