import { create } from "ipfs-http-client";

/* Create an instance of the client */
const client = create("https://ipfs.infura.io:5001/api/v0");

const addData = (data) => {
  console.log("adding");
  return new Promise((resolve, reject) => {
    client
      .add(data)
      .then((added) => {
        const url = `https://ipfs.io/ipfs/${added.path}`;
        resolve(url);
      })
      .catch((err) => reject(err));
  });
};

export default addData;
