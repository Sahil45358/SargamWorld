// ================= FIREBASE INIT =================
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyDPfqsPhVtjEduj4pkU-8wK2mgCOB8BvK8",
    authDomain: "sargamworld-f7d63.firebaseapp.com",
    projectId: "sargamworld-f7d63",
  });
}

firebase.auth().signInAnonymously().catch(console.error);

const db = firebase.firestore();
const FieldValue = firebase.firestore.FieldValue;

// ================= MAIN =================
document.addEventListener("DOMContentLoaded", async () => {

  const box = document.querySelector(".reaction-box");
  if (!box) return;

  const songId = box.dataset.songId;
  if (!songId) return;

  const docRef = db.collection("songs").doc(songId);

  const likeCount  = document.getElementById("like-count");
  const loveCount  = document.getElementById("love-count");
  const viewCount  = document.getElementById("view-count");
  const shareCount = document.getElementById("share-count");

  // ---------- Ensure song document exists ----------
  const snap = await docRef.get();
  if (!snap.exists) {
    await docRef.set({
      like: 0,
      love: 0,
      views: 0,
      shares: 0
    });
  }

  // ---------- Live counters ----------
  docRef.onSnapshot(doc => {
    const d = doc.data() || {};
    likeCount.textContent  = d.like   || 0;
    loveCount.textContent  = d.love   || 0;
    viewCount.textContent  = d.views  || 0;
    shareCount.textContent = d.shares || 0;
  });

  let uid = null;
  let currentReaction = null;

  // ================= AUTH =================
  firebase.auth().onAuthStateChanged(async user => {
    if (!user) return;
    uid = user.uid;

    // ================= 👁️ VIEWS (1 PER DAY) =================
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    try {
      await db.runTransaction(async (tx) => {
        const songSnap = await tx.get(docRef);
        if (!songSnap.exists) return;

        const viewRef = docRef.collection("views").doc(uid);
        const viewSnap = await tx.get(viewRef);

        if (!viewSnap.exists || viewSnap.data().day !== today) {
          tx.set(viewRef, { day: today }, { merge: true });
          tx.update(docRef, {
            views: FieldValue.increment(1)
          });
        }
      });
    } catch (e) {
      console.error("Daily view transaction failed:", e);
    }

    // ================= ❤️ LOAD PREVIOUS REACTION =================
    const reactionRef = docRef.collection("reactions").doc(uid);
    const rSnap = await reactionRef.get();
    currentReaction = rSnap.exists ? rSnap.data().type : null;

    if (currentReaction) {
      document
        .querySelector(`[data-reaction="${currentReaction}"]`)
        ?.classList.add("selected");
    }
  });

  // ================= ❤️ REACTIONS =================
  document.querySelectorAll(".reaction").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!uid) return;

      const newReaction = btn.dataset.reaction;
      if (newReaction === currentReaction) return;

      const update = {};
      if (currentReaction) {
        update[currentReaction] = FieldValue.increment(-1);
      }
      update[newReaction] = FieldValue.increment(1);

      await docRef.update(update);
      await docRef
        .collection("reactions")
        .doc(uid)
        .set({ type: newReaction });

      currentReaction = newReaction;

      document
        .querySelectorAll(".reaction")
        .forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  // ================= 🔗 SHARE =================
  const shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      await docRef.update({
        shares: FieldValue.increment(1)
      });

      const url = location.href;
      if (navigator.share) {
        try {
          await navigator.share({
            title: document.title,
            url
          });
        } catch {}
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied!");
      }
    });
  }

});
