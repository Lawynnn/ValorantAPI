import { APIMember } from "../types";
import axios, { AxiosInstance } from "axios";

export async function _getMember(puuid: string) {
    const userData = await axios.get(`https://api.henrikdev.xyz/valorant/v1/by-puuid/account/${puuid}`).catch(() => null);
    if(!userData) {
        throw new Error("Failed to get member");
    }

    const data: APIMember = {
        puuid: userData.data.data.puuid,
        gameName: userData.data.data.name,
        tagLine: userData.data.data.tag,
        cardId: userData.data.data.card.id,
        region: userData.data.data.region,
        level: userData.data.data.account_level,
    }

    return data;
}