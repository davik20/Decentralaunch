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
import { db } from "./firebaseConfig";
import { getIdByParams } from "./utils";

const userRef = collection(db, "users");

const user = () => {
  const addUser = async (address) => {
    let user = await getIdByParams(userRef, "address", address);
    if (user) return console.log("This user already exists");
    await addDoc(userRef, {
      address: address,
      presalesCreated: [],
    });
  };

  const addSaleToUser = async (address, { saleName, saleAddress }) => {
    let userId = await getIdByParams(userRef, "address", address);

    if (!userId) {
      console.log("user does not exist");
      return;
    }

    await updateDoc(doc(userRef, userId), {
      presalesCreated: arrayUnion({ saleName, saleAddress }),
    });

    //   console.log(user);
  };

  return {
    addUser,
    addSaleToUser,
  };
};

export default user;
