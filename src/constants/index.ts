export const DEXES: any = {
  338: [
    {
      label: "Crona Swap",
      value: [
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
        "0x0a180A76e4466bF68A7F86fB029BEd3cCcFaAac5",
      ], // [routerAddress, factoryAddress, wethAddress] ->
    },
    {
      label: "VVS Finance",
      value: [
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
        "0x0a180A76e4466bF68A7F86fB029BEd3cCcFaAac5",
      ],
    },
  ],
  3: [
    {
      label: "Uniswap",
      value: [
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
        "0xc778417E063141139Fce010982780140Aa0cD5Ab",
      ],
    },
    {
      label: "Uniswap",
      value: [
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
        "0xc778417E063141139Fce010982780140Aa0cD5Ab",
      ],
    },
  ],
  4: [
    {
      label: "Uniswap",
      value: [
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
        "0xc778417E063141139Fce010982780140Aa0cD5Ab",
      ],
    },
    {
      label: "Uniswap",
      value: [
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
        "0xc778417E063141139Fce010982780140Aa0cD5Ab",
      ],
    },
  ],
  5: [
    {
      label: "Uniswap",
      value: [
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
        "0xc778417E063141139Fce010982780140Aa0cD5Ab",
      ],
    },
    {
      label: "Uniswap",
      value: [
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
        "0xc778417E063141139Fce010982780140Aa0cD5Ab",
      ],
    },
  ],
  1337: [
    {
      label: "Uniswap",
      value: [
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
        "0xc778417E063141139Fce010982780140Aa0cD5Ab",
      ],
    },
    {
      label: "Uniswap",
      value: [
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
        "0xc778417E063141139Fce010982780140Aa0cD5Ab",
      ],
    },
  ],
};

export const CONTRACTS: any = {
  338: {
    // cronos testnet
    core: "0x96bfe7ff9d7558d6a040c50a0636cd83c4254196",
    library: "0x417f2A234cc313130a5e7Bfc2fD8F1737c8380c8",
    locker: "0x802409d14088583458Bf17E41e9050A677D70e24",
    router: "0x4aFe45DEdA1e402032DD2bceB6C9a9a7DeBa4F62",
  },
  1337: {
    // localhost
    core: "",
    library: "",
    locker: "",
    router: "",
  },
  3: {
    // ropsten

    core: "0x5482766aeb87717EAdC5fdb87d9ec187210a5CDb",
    library: "0x5C8281C1805A467E01677978A742203DD5C99BDC",
    locker: "0xC8878aBAcB20e146e5cF8951423260AA2cF5d592",
    router: "0x5b7E67644E8c2dA0e7D71016BB29D30659930EF6",
  },
  4: {
    // rinkeby

    core: "0xfAb4A483921B5e3AB05a241948E862fb9fA1D684",
    library: "0x9005EEEECE3457765C79F0F9426ACd01b2457985",
    locker: "0x8f4c5f20A94002719482b2F290F54d930E8a4cB5",
    router: "0x1782e54d0037977Eb95b107Db2696d601cE2B11b",
  },
  5: {

    core: "0x5F690bA242F9fB81377796D443f86F02db17E7fe",
    library: "0x04293614717e5CCE4B87698D03914Eda5eE214a6",
    locker: "0x9DbeFD772a156695Cde8AC64a2554A191bc4EDd9",
    router: "0x4965ff7A48F59d3Db50afCD7433cAcFa172Eba37",
  }
};

export const CURRENCIES: any = {
  3: "ETH",
  4: "ETH",
  334: "CRO",
  1337: "ETH",
};

// export const ALLOWEDCHAINIDS = [338, 25, 3, 4, 1337, 25];
export const ALLOWEDCHAINIDS = [5];

export const DEFAULT_CHAIN_ID = 5;

// export const DEFAULT_RPC_URL = "https://cronos-testnet-3.crypto.org:8545";
let INFURA_KEY: any = process.env?.REACT_APP_INFURA_KEY;

export const DEFAULT_RPC_URL: any = `https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`;

export const allTerms = [
  {
    name: "I have tested my token with the DotLaunch app on a test network. (Ex. Ropsten)",
    checked: false,
    isChecked: false,
  },
  {
    name: "My token has a function to disable special transfers or has no special transfers",
    checked: false,
    isChecked: false,
  },
  {
    name: "My token is not already listed on the target DEX and I have not given out any tokens to users",
    checked: false,
    isChecked: false,
  },
  {
    name: "I understand that DotLaunch is not responsible for any issues or loss of funds caused due to errors or exploits of code.",
    checked: false,
    isChecked: false,
  },
  {
    name: "I understand fees paid to Launch a sale are non-recoverable",
    checked: false,
    isChecked: false,
  },
  {
    name: "I understand that I have to finalize my sale within 48 hours of hitting the hardcap!",
    checked: false,
    isChecked: false,
  },
  {
    name: "I am using DotLaunch as a software tool only and am responsible for anything I create on it",
    checked: false,
    isChecked: false,
  },
  {
    name: "I understand that I am responsible for following my local laws and regulations including KYC and AML practices.",
    checked: false,
    isChecked: false,
  },
  {
    name: "I have read and I agree to the terms and conditions",
    checked: false,
    isChecked: false,
  },
];
