import { create } from "ipfs-http-client";
const auth = 'Basic ' + Buffer.from(process.env.REACT_APP_INFURA_KEY + ':' + process.env.REACT_APP_INFURA_KEY_SECRET).toString('base64');

// const client = ipfsClient.create({
//   host: 'ipfs.infura.io',
//   port: 5001,
//   protocol: 'https',
//   headers: {
//     authorization: auth,
//   },
// });

const client = create({ url: "https://ipfs.infura.io:5002/api/v0" });

export const addData = (data) => {
  console.log("adding");
  console.log(data);
  return new Promise((resolve, reject) => {
    client
      .add(data)
      .then((added) => {
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        console.log(added);
        resolve(url);
      })
      .catch((err) => reject(err));
  });
};

export default addData
