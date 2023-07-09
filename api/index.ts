import axios, { AxiosInstance } from "axios";
import jwt from "jsonwebtoken";
import { APIItem, APIItemType, APIUser, APIQueueID } from "../types";

import { _getParty, _isInParty } from "./party";
import { _getStore } from "./store";
import { _getMatch } from "./match";
import Cache from "./cache";
import { _getCompetitiveTiers, _getMaps } from "./valorantApi";

function convertRegionToShard(region: string): string {
    switch (region) {
        case "na":
            return "na";
        case "br":
            return "na";
        case "latam":
            return "na";
        case "eu":
            return "eu";
        case "ap":
            return "ap";
        case "kr":
            return "kr";
        default:
            return "na";
    }
}

async function getClientVersion(): Promise<string> {
    const version = await axios
        .get("https://valorant-api.com/v1/version")
        .catch(() => null);
    if (!version) {
        throw new Error("Failed to get client version");
    }
    return version.data?.data?.riotClientVersion;
}

export const login = async (token: string): Promise<APIUser> => {
    const playerInfo = await axios
        .get("https://auth.riotgames.com/userinfo", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .catch(() => null);

    if (!playerInfo) {
        throw new Error("Invalid token provided");
    }

    const entitlementsToken = await axios
        .post(
            "https://entitlements.auth.riotgames.com/api/token/v1",
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .catch(() => null);

    if (!entitlementsToken) {
        throw new Error("Invalid token provided (Entitlements token)");
    }

    const shortData = jwt.decode(token, { json: true });
    const clientVersion = await getClientVersion();
    let data: APIUser = {
        country: playerInfo.data.country,
        puuid: playerInfo.data.sub,
        isEmailVerified: () => playerInfo.data.email_verified,
        isPhoneVerified: () => playerInfo.data.phone_number_verified,
        isFullyVerified: () =>
            playerInfo.data.email_verified &&
            playerInfo.data.phone_number_verified,
        isEnabled: () => playerInfo.data.acct.state === "ENABLED",
        getRegion: () => shortData?.pp.c,
        getShard: () => convertRegionToShard(shortData?.pp.c),
        getParty: async () => await _getParty(data),
        isInParty: async () => await _isInParty(data),
        store: () => _getStore(data),
        match: () => _getMatch(data),
        cache: {
            ranks: {
                fetch: async () => await _getCompetitiveTiers(),
            },
            maps: {
                fetch: async () => await _getMaps(),
            }
        },
        clientVersion: clientVersion,
        username: playerInfo.data.username,
        gameName: playerInfo.data.acct.game_name,
        tagLine: playerInfo.data.acct.tag_line,
        createdAt: new Date(playerInfo.data.acct.created_at),
        accessToken: token,
        entitlementsToken: entitlementsToken.data.entitlements_token,
    };
    return data;
};
