import { APICompetitiveTier, APIMap, APIAgent } from "../types";
import axios, { AxiosInstance } from "axios";
import Cache from "./cache";

export async function _getCompetitiveTiers(): Promise<APICompetitiveTier[]> {
    const competitiveTiers = await axios
        .get("https://valorant-api.com/v1/competitivetiers")
        .catch(() => null);

    if (!competitiveTiers) {
        throw new Error("Failed to get competitive tiers");
    }

    const data: APICompetitiveTier[] = [
        competitiveTiers.data.data[4].tiers.map(
            (tier: any): APICompetitiveTier => {
                return {
                    tier: tier.tier,
                    name: tier.tierName,
                };
            }
        ),
    ];

    // Caching data
    Cache.set("ranks", data);

    return data;
}

export async function _getMaps(): Promise<APIMap[]> {
    const maps = await axios
        .get("https://valorant-api.com/v1/maps")
        .catch(() => null);
    if (!maps) {
        throw new Error("Failed to get maps");
    }

    const data: APIMap[] = maps.data.data.map((map: any): APIMap => {
        return {
            puuid: map.uuid,
            name: map.displayName,
            coordinates: map.coordinates,
            icon: map.splash,
            path: map.assetPath,
            url: map.mapUrl,
        };
    });

    // Caching data
    Cache.set("maps", data);

    return data;
}

export async function _getAgents(): Promise<APIAgent[]> {
    const maps = await axios
        .get("https://valorant-api.com/v1/agents")
        .catch(() => null);
    if (!maps) {
        throw new Error("Failed to get maps");
    }

    const data: APIAgent[] = maps.data.data.map((agent: any): APIAgent => {
        return {
            puuid: agent.uuid,
            name: agent.displayName,
            description: agent.description,
            icon: agent.displayIcon,
            path: agent.assetPath,
        };
    });

    // Caching data
    Cache.set("agents", data);

    return data;
}
