import {
    APICompetitiveTier,
    APIItemType,
    APIMap,
    APIStore,
    APIUser,
    APIWallet,
    APIWalletType,
    APIItem,
} from "../types";
import axios, { AxiosInstance } from "axios";
import { _getAgents } from "./valorantApi";

function _getStoreApi(user: APIUser): AxiosInstance {
    return axios.create({
        baseURL: `https://pd.${user.getShard()}.a.pvp.net`,
        headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "X-Riot-Entitlements-JWT": user.entitlementsToken,
        },
    });
}

export function _getStore(user: APIUser): APIStore {
    const storeApi = _getStoreApi(user);
    return {
        getOwnedItems: async (itemTypeId: APIItemType | string) => {
            const ownedItems = await storeApi
                .get(`/store/v1/entitlements/${user.puuid}/${itemTypeId}`)
                .catch(() => null);
            if (!ownedItems) {
                throw new Error("Failed to get owned items");
            }

            const entitlements: { TypeID: string; ItemID: string }[] =
                ownedItems.data.Entitlements;
            const infoFetches: APIItem<APIItemType>[] = [];
            switch (itemTypeId) {
                case APIItemType.Agents:
                    const agents = await _getAgents();
                    agents.forEach((agent) => {
                        const found = entitlements.find(
                            (en) => en.ItemID === agent.puuid
                        );
                        if (found) {
                            infoFetches.push(agent as APIItem<APIItemType.Agents>);
                        }
                    });
                    break;
                default:
                    entitlements.forEach((entitlement) => {
                        infoFetches.push({
                            puuid: entitlement.ItemID,
                        });
                    });
                    break;
            }

            return infoFetches;
        },
        getWallet: async (): Promise<APIWallet> => {
            const wallet = await storeApi
                .get(`/store/v1/wallet/${user.puuid}`)
                .catch(() => null);
            if (!wallet) {
                throw new Error("Failed to get wallet");
            }

            const balances = wallet.data.Balances;
            const data: APIWallet = {
                ValorantPoints: balances[APIWalletType.ValorantPoints],
                RadianitePoints: balances[APIWalletType.RadianitePoints],
                KingdomCredits: balances[APIWalletType.KingdomCredits],
                FreeAgents: balances[APIWalletType.FreeAgents],
            };
            return data;
        },
    };
}
