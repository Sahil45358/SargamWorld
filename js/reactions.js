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
  if (!songId) {
    console.error("Missing data-song-id");
    return;
  }

  const docRef = db.collection("songs").doc(songId);

  const likeCount  = document.getElementById("like-count");
  const loveCount  = document.getElementById("love-count");
  const viewCount  = document.getElementById("view-count");
  const shareCount = document.getElementById("share-count");

  // ---------- Ensure document exists ----------
  const snap = await docRef.get();
  if (!snap.exists) {
    await docRef.set({
      like: 0,
      love: 0,
      views: 0,
      shares: 0
    });
  }

  // ---------- Live sync ----------
  docRef.onSnapshot(doc => {
    const d = doc.data() || {};
    likeCount.textContent  = d.like   || 0;
    loveCount.textContent  = d.love   || 0;
    viewCount.textContent  = d.views  || 0;
    shareCount.textContent = d.shares || 0;
  });

  let uid = null;
  let currentReaction = null;

  // ---------- Auth-dependent logic ----------
  firebase.auth().onAuthStateChanged(async user => {
    if (!user) return;

    uid = user.uid;

    // 👁️ Views (unique per user)
    const viewRef = docRef.collection("views").doc(uid);
    if (!(await viewRef.get()).exists) {
      await viewRef.set({ t: Date.now() });
      await docRef.update({ views: FieldValue.increment(1) });
    }

    // ❤️ Load previous reaction
    const reactionRef = docRef.collection("reactions").doc(uid);
    const rSnap = await reactionRef.get();
    currentReaction = rSnap.exists ? rSnap.data().type : null;

    if (currentReaction) {
      document
        .querySelector(`[data-reaction="${currentReaction}"]`)
        ?.classList.add("selected");
    }
  });

  // ---------- Reaction buttons ----------
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

  // ---------- Share ----------
  const shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      await docRef.update({ shares: FieldValue.increment(1) });

      const url = location.href;
      if (navigator.share) {
        try {
          await navigator.share({ title: document.title, url });
        } catch {}
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied!");
      }
    });
  }

});
