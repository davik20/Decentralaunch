import {
  getDoc,
  setDoc,
  collection,
  addDoc,
  where,
  query,
  getDocs,
  updateDoc,
  arrayUnion,
  doc,
} from "firebase/firestore";
// utility functions
export const getIdByParams = async (ref, param, value) => {
  const q = query(ref, where(param, "==", value));

  const result = [];
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots

    result.push(doc.id);
  });
  console.log(result);
  return result[0];
};

export const getIdsByParams = async (ref, param, value) => {
  const q = query(ref, where(param, "==", value));

  const result = [];
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots

    result.push(doc.id);
  });
  //   console.log(result);
  return result;
};

export const getItemByParams = async (ref, param, value) => {
  const q = query(ref, where(param, "==", value));

  const result = [];
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots

    result.push(doc.data());
  });
  //   console.log(result);
  return result[0];
};
export const getItemsByParams = async (ref, param, value) => {
  const q = query(ref, where(param, "==", value));

  const result = [];
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots

    result.push(doc.data());
  });
  //   console.log(result);
  return result;
};
