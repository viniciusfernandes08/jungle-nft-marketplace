import { addEth } from "@/shared/domain/eth";
import { getDb, resetDb, saveDb } from "./db/store";
import { getScenarioName, setScenario, type ScenarioName } from "./scenarios";

export type KurioMocks = {
  scenario: () => ScenarioName;
  setScenario: (name: ScenarioName) => void;
  increasePrice: () => Promise<string | undefined>;
  reset: () => Promise<void>;
};

declare global {
  interface Window {
    kurioMocks?: KurioMocks;
  }
}

export function exposeMockControls(): void {
  window.kurioMocks = {
    scenario: getScenarioName,
    setScenario,
    increasePrice: async () => {
      const db = await getDb();
      const nft = db.nfts[0];
      if (!nft) return undefined;
      nft.priceEth = addEth(nft.priceEth, "0.1");
      nft.version += 1;
      saveDb(db);
      return nft.priceEth;
    },
    reset: async () => {
      setScenario("default");
      await resetDb();
    },
  };
}
