import { Route, Routes } from "react-router-dom";
import Homepage from "./components/Homepage/Homepage";
import Register from "./components/Register/Register";
import TopNavigation from "./components/TopNavigation/TopNavigation";
import RegistrationPage from "./components/RegistrationPage/RegistrationPage";
import ExplorePage from "./components/ExplorePage/ExplorePage";
import { WagmiConfig, createClient } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { useQuery } from "@apollo/client";
import registrationIdsToFilter from "./components/FilterRegistrations/Filter_Registrations_By_Id";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createHttpLink } from "apollo-link-http";
import useAxios from "axios-hooks";
import queries from "./components/ExplorePage/queries/registrations";
import "./App.css";
import "./bp4-theme.css";
import Eye from "./components/Homepage/Eye/Eye";
import { useEffect, useState } from "react";
import axios from "axios";
import { mockExploreData } from "./components/ExplorePage/mockExploreData";
const mainnetOldClient = new ApolloClient({
  link: createHttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/rashmi-278/daostar-ethereum-mainnet-v0",
  }),
  cache: new InMemoryCache(),
});

const alchemyId = process.env.REACT_APP_ALCHEMY_ID;
const walletConnectId = process.env.REACT_APP_WALLETCONNECT_ID;
const token = process.env.REACT_APP_BEARER_TOKEN;

const client = createClient(
  getDefaultClient({
    appName: "DAOstar",
    alchemyId,
  })
);
let  headers;

const fetchAndStructureDAOs = async (apiUrl, network) => {
  try {
    const response = await axios.get(apiUrl, { headers });
    const data = response.data;
    return data?.results?.map((item) => ({
      contractAddress: item.contractAddress,
      name: item.value.config.name,
      daoURI: item.value.config.dao_uri || "https://daodao.zone/dao/"+item.contractAddress,
      description: item.value.config.description,
      id: item.value.voting_module,
      createdAt: new Date(item.value.createdAt),
      network: network,
      managerAddress: "",
      standalone: "true",
      membersURI: "https://daodao.zone/dao/"+item.contractAddress+"/members",
      activityLogURI: "https://daodao.zone/dao/"+item.contractAddress,
      issuersURI: "https://daodao.zone/dao/"+item.contractAddress,
      proposalsURI: "https://daodao.zone/dao/"+item.contractAddress+"/proposals",
      governanceURI: "https://daodao.zone/dao/"+item.contractAddress+"/subdaos",
    }));
  } catch (error) {
    console.error(`Error fetching ${network} data:`, error);
    return [];
  }
};

function restructureDAOData(daoInstances, networkId) {
  return [
    {
      registrationNetwork: {
        __typename: "RegistrationNetwork",
        id: networkId,
        registrations: daoInstances?.map((item) => ({
          __typename: "RegistrationInstance",
          id: item.id,
          daoName: item.name, 
          daoAddress: item.contractAddress, 
          daoDescription: item.description,
          daoURI: item.daoURI,
          governanceURI: item.governanceURI,
          issuersURI: item.issuersURI,
          managerAddress: item.managerAddress,
          membersURI: item.membersURI,
          proposalsURI: item.proposalsURI,
          registrationAddress: item.contractAddress, 
          registrationNetwork: {
            __typename: "RegistrationNetwork",
            id: networkId,
          },
        })),
      },
    },
  ];
}


function App() {
  //DAODAOINT START

  if(token !== undefined) {
    headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  
  }

  const [daodaoInstances, setDaoDaoInstances] = useState([]);
  const [osmosisInstances, setOsmosisInstances] = useState([]);
  //const [stargazeInstances, setStargazeInstances] = useState([]);  
  
  useEffect(() => {
    const fetchDAOs = async () => {
      const daodaoData = await fetchAndStructureDAOs('https://search.daodao.zone/indexes/daos/documents?limit=500', 'Juno');
      const osmosisData = await fetchAndStructureDAOs('https://search.daodao.zone/indexes/osmosis_daos/documents?limit=500', 'Osmosis');
      //const stargazeData = await fetchAndStructureDAOs('https://search.daodao.zone/indexes/stargaze_daos/documents?limit=500', 'Stargaze');

      setDaoDaoInstances(daodaoData);
      setOsmosisInstances(osmosisData);
      //setStargazeInstances(stargazeData);

      const restructuredDaodao = restructureDAOData(daodaoData, 'Juno');
      const restructuredOsmosis = restructureDAOData(osmosisData, 'Osmosis');
      //const restructuredStargaze = restructureDAOData(stargazeData, 'Stargaze');

      setDaoDaoInstances(restructuredDaodao);
      setOsmosisInstances(restructuredOsmosis);
     // setStargazeInstances(restructuredStargaze);
    };

    fetchDAOs();
  }, []);    


  //DAODAOINT END
  const {
    loading,
    error,
    data: mainnetData,
  } = useQuery(queries.REGISTRATIONS, {
    context: { apiName: "mainnet" },
    variables: { id: "mainnet" },
  });

  const {
    loading: mainnetv0Loading,
    error: mainnetv0Error,
    data: mainnetv0Data,
  } = useQuery(queries.REGISTRATIONSOLD, {
    client: mainnetOldClient,
    context: { apiName: "mainnet" },
    variables: { id: "mainnet" },
  });

  const goerliRes = useQuery(queries.REGISTRATIONS, {
    context: { apiName: "goerli" },
    variables: { id: "goerli" },
  });
  const optimismGoerliRes = useQuery(queries.REGISTRATIONS, {
    context: { apiName: "optimismGoerli" },
    variables: { id: "optimism-goerli" },
  });
  const arbitrumGoerliRes = useQuery(queries.REGISTRATIONS, {
    context: { apiName: "arbitrumGoerli" },
    variables: { id: "arbitrum-goerli" },
  });
  const chapelRes = useQuery(queries.REGISTRATIONS, {
    context: { apiName: "chapel" },
    variables: { id: "chapel" },
  });

  const optimismRes = useQuery(queries.REGISTRATIONS, {
    context: { apiName: "optimism" },
    variables: { id: "optimism" },
  });

  const {
    loading: goerliLoading,
    error: goerliError,
    data: goerliData,
  } = goerliRes;

  const gnosisRes = useQuery(queries.REGISTRATIONS, {
    context: { apiName: "gnosis" },
    variables: { id: "gnosis" },
  });
  const {
    loading: optimismLoading,
    error: optimismError,
    data: optimismData,
  } = optimismRes;

  const {
    loading: optimismGoerliLoading,
    error: optimismGoerliError,
    data: optimismGoerliData,
  } = optimismGoerliRes;
  const {
    loading: arbitrumGoerliLoading,
    error: arbitrumGoerliError,
    data: arbitrumGoerliData,
  } = arbitrumGoerliRes;
  const {
    loading: chapelLoading,
    error: chapelError,
    data: chapelData,
  } = chapelRes;

  const {
    loading: gnosisLoading,
    error: gnosisError,
    data: gnosisData,
  } = gnosisRes;

 

  if (
    error ||
    goerliError ||
    optimismGoerliError ||
    arbitrumGoerliError ||
    chapelError ||
    optimismError ||
    mainnetv0Error
  ) {
    console.error("Mainnet Error " + error);
    console.error("Mainnet v0 Error " + mainnetv0Error);
    console.error("Goerli Error " + goerliError);
    console.error("Optimism Goerli Error " + optimismGoerliError);
    console.error("Arbitrum Goerli Error" + arbitrumGoerliError);
    console.error("Chapel Error" + chapelError);
    console.error("Optimism Error" + optimismError);
  }
  if (
    loading ||
    goerliLoading ||
    gnosisLoading ||
    optimismGoerliLoading ||
    arbitrumGoerliLoading ||
    chapelLoading ||
    optimismLoading
  )
    return "loading...";
  const mainnetRegistrations =
    mainnetData?.registrationNetwork?.registrations || [];
  const mainnetv0Registrations =
    mainnetv0Data?.registrationNetwork?.registrations || [];
  const goerliRegistrations =
    goerliData?.registrationNetwork?.registrations || [];
  const optimismGoerliRegistrations =
    optimismGoerliData?.registrationNetwork?.registrations || [];
  const optimismRegistrations =
    optimismData?.registrationNetwork?.registrations || [];
  const gnosisRegistrations =
    gnosisData?.registrationNetwork?.registrations || [];
  const arbitrumGoerliRegistrations =
    arbitrumGoerliData?.registrationNetwork?.registrations || [];
  const chapelRegistrations =
    chapelData?.registrationNetwork?.registrations || [];

  // This object clones and modifies the mainnetV0 registration instances to change the network ID to "ethereum"
  // So that when we click on an old registration instance card we are able to view and edit its proprties
  // this allows to query mainnetV0 subgraph link

  const allMainnetV0Registrations = mainnetv0Registrations?.map((instance) => ({
    ...instance,
    registrationNetwork: {
      ...instance.registrationNetwork,
      id: "ethereum",
    },
  }));

  


  const allRegistrationInstances = mainnetRegistrations
    .concat(
    allMainnetV0Registrations,
    goerliRegistrations,
    gnosisRegistrations,
    optimismGoerliRegistrations,
    arbitrumGoerliRegistrations,
    chapelRegistrations,
    optimismRegistrations,
    );


  const daodaoRegInstances = daodaoInstances;
  const registrationInstances = allRegistrationInstances.filter(
    (instance) => !registrationIdsToFilter.includes(instance.id)
  );


  

  console.log({
    mainnetData,
    mainnetv0Data,
    goerliData,
    gnosisData,
    optimismGoerliData,
    arbitrumGoerliData,
    chapelData,
  });

  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider
        mode="dark"
        customTheme={{
          "--ck-font-family":
            "IBM Plex Mono, 'Roboto Condensed', 'Roboto', 'Arial', sans-serif",
        }}
        options={{
          hideNoWalletCTA: true,
          walletConnectName: "WalletConnect",
          showAvatar: false,
          hideQuestionMarkCTA: true,
        }}
      >
        <div className="App">
          <TopNavigation />
          {/* <Homepage /> */}

          <Routes>
            <Route path="/eye" element={<Eye />} />
            <Route path="/register" element={<Register />} />
            <Route path="/registration/:regID" element={<RegistrationPage />} />
            <Route
              path="/explore"
              element={
                <ExplorePage registrationInstances={registrationInstances}  junosInstances={daodaoInstances}  osmosisInstances={osmosisInstances}/>
              }
            />
            <Route
              path="/"
              element={
                <Homepage registrationInstances={registrationInstances} />
              }
            />
            <Route
              path="/creative-universe"
              component={() => {
                window.location.href =
                  "https://github.com/metagov/daostar/discussions/41";
                return null;
              }}
            />
          </Routes>
        </div>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

if (window.location.path === "creative-universe") {
  window.location = "https://github.com/metagov/daostar/discussions/41";
}

export default App;
