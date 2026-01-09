// ---------- Firebase init ----------
firebase.initializeApp({
  apiKey: "AIzaSyDPfqsPhVtjEduj4pkU-8wK2mgCOB8BvK8",
  authDomain: "sargamworld-f7d63.firebaseapp.com",
  projectId: "sargamworld-f7d63",
});

const db = firebase.firestore();
const FieldValue = firebase.firestore.FieldValue;

// ---------- Auth ----------
firebase.auth().signInAnonymously().catch(console.error);

// ---------- Main ----------
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) return;

  const box = document.querySelector(".reaction-box");
  if (!box) return;

  const songId = box.dataset.songId;
  const docRef = db.collection("songs").doc(songId);

  const likeCount  = document.getElementById("like-count");
  const loveCount  = document.getElementById("love-count");
  const viewCount  = document.getElementById("view-count");
  const shareCount = document.getElementById("share-count");

  // Create doc if missing
  if (!(await docRef.get()).exists) {
    await docRef.set({ like: 0, love: 0, views: 0, shares: 0 });
  }

  // Live updates
  docRef.onSnapshot((snap) => {
    const d = snap.data();
    if (!d) return;
    likeCount.textContent  = d.like  || 0;
    loveCount.textContent  = d.love  || 0;
    viewCount.textContent  = d.views || 0;
    shareCount.textContent = d.shares || 0;
  });

  const uid = user.uid;

  // View count
  const viewRef = docRef.collection("views").doc(uid);
  if (!(await viewRef.get()).exists) {
    await viewRef.set({ t: Date.now() });
    await docRef.update({ views: FieldValue.increment(1) });
  }

  // Reactions
  const reactionRef = docRef.collection("reactions").doc(uid);
  let currentReaction = (await reactionRef.get()).data()?.type || null;

  document.querySelectorAll(".reaction").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const r = btn.dataset.reaction;
      if (r === currentReaction) return;

      const update = {};
      if (currentReaction) update[currentReaction] = FieldValue.increment(-1);
      update[r] = FieldValue.increment(1);

      await docRef.update(update);
      await reactionRef.set({ type: r });

      currentReaction = r;
      document.querySelectorAll(".reaction").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  // Share clicks
  document.getElementById("shareBtn")?.addEventListener("click", async () => {
    await docRef.update({ shares: FieldValue.increment(1) });
    await navigator.clipboard.writeText(location.href);
  });
});
