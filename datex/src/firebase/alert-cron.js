import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import emailjs from "@emailjs/nodejs";

// Firebase Admin SDK setup
initializeApp({
  credential: applicationDefault(),
});
const db = getFirestore();

// Helper function to send alert email
const sendEmail = async ({ product, expiry, to_email }) => {
  await emailjs.send("your_service_id", "your_template_id", {
    product,
    expiry,
    to_email,
    to_name: "User",
  }, "your_public_key");
};

const runCron = async () => {
  const snapshot = await db.collection("products").get();
  const now = new Date();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const expiryDate = new Date(data.expiry);
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 3 && !data.notified) {
      // Send email
      await sendEmail({
        product: data.product,
        expiry: data.expiry,
        to_email: data.owner, // make sure product has this field
      });

      // Update product as notified
      await db.collection("products").doc(doc.id).update({
        notified: true,
      });

      console.log(`Alert sent for ${data.product}`);
    }
  }
};

runCron();
