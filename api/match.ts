import {
    APIUser,
    APIMatch,
    APIMatchCurrent,
    APIMatchHistory,
    APIMatchHistoryOptions,
    APIMatchHistoryMatch,
    APIMatchDetails,
    APIMap,
    APIMatchPlayer,
    APIAgent,
    APICompetitiveTier,
} from "../types";
import axios, { AxiosInstance } from "axios";
import Cache from "./cache";
import { _getAgents, _getCompetitiveTiers, _getMaps } from "./valorantApi";

function _getMatchApi(user: APIUser): {
    pvp: AxiosInstance;
    glz: AxiosInstance;
} {
    return {
        pvp: axios.create({
            baseURL: `https://pd.${user.getShard()}.a.pvp.net`,
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
                "X-Riot-Entitlements-JWT": user.entitlementsToken,
            },
        }),
        glz: axios.create({
            baseURL: `https://glz-${user.getRegion()}-1.${user.getShard()}.a.pvp.net`,
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
                "X-Riot-Entitlements-JWT": user.entitlementsToken,
            },
        }),
    };
}

async function _getMatchDetails(
    user: APIUser,
    matchId: string
): Promise<APIMatchDetails | null> {
    const apiMatch = _getMatchApi(user);

    const match = await apiMatch.pvp
        .get(`/match-details/v1/matches/${matchId}`)
        .catch(() => null);
    if (!match) {
        return null;
    }

    const { data } = match;

    if (!Cache.get("maps")) {
        await _getMaps();
    }
    if (!Cache.get("agents")) {
        await _getAgents();
    }
    if (!Cache.get("ranks")) {
        await _getCompetitiveTiers();
    }

    const agents: APIAgent[] | undefined = Cache.get("agents");
    const ranks: APICompetitiveTier[] | undefined = Cache.get("ranks");
    const maps: APIMap[] | undefined = Cache.get("maps");

    const map: APIMap | undefined = maps?.find(
        (map) => map.url === data.matchInfo.mapId
    );
    const details: APIMatchDetails = {
        id: data.matchInfo.matchId,
        map,
        state: data.matchInfo.completionState,
        platform: data.matchInfo.platformType,
        penalties: data.matchInfo.partyRRPenalties,
        queueId: data.matchInfo.queueID,
        ranked: data.matchInfo.isRanked,
        isMatchmaking: () =>
            data.matchInfo.provisioningFlowID === "Matchmaking",
        isCustomGame: () => data.matchInfo.provisioningFlowID === "CustomGame",
        server: data.matchInfo.gamePodId,
        time: {
            gameLength: new Date(data.matchInfo.gameLengthMillis) || 0,
            gameStart: new Date(data.matchInfo.gameStartMillis),
        },
        players: data.players.map((player: any): APIMatchPlayer => {
            return {
                character: agents?.find(
                    (agent) => agent.puuid === player.characterId
                ),
                gameName: player.gameName,
                puuid: player.subject,
                tagLine: player.tagLine,
                platform: player.platformInfo.platformType,
                team: player.teamId,
                rank: ranks?.find((r) => r.tier === player.competitiveTier),
                isObserver: () => player.isObserver,
                partyId: player.partyId,
            };
        }),
    };
    return details;
}

async function _getMatchHistory(
    user: APIUser,
    options: APIMatchHistoryOptions | undefined
): Promise<APIMatchHistory | null> {
    const apiMatch = _getMatchApi(user);

    const matchHistory = await apiMatch.pvp
        .get(
            `/match-history/v1/history/${user.puuid}?startIndex=${
                options?.startIndex || 0
            }&endIndex=${options?.endIndex || 10}${
                options?.queueId ? `&queue=${options.queueId}` : ""
            }`
        )
        .catch(() => null);
    if (!matchHistory) {
        return null;
    }

    if (matchHistory.data.Total === 0) return null;

    const data: APIMatchHistory = {
        total: matchHistory.data.Total,
        matches: matchHistory.data.History.map(
            (match: any): APIMatchHistoryMatch => {
                return {
                    id: match.MatchID,
                    queueId: match.QueueID,
                    startedAt: new Date(match.GameStartTime),
                    getDetails: async () =>
                        await _getMatchDetails(user, match.MatchID),
                };
            }
        ),
        getFirstMatch: () => {
            const m = matchHistory.data.History.sort((b: any, a: any) => new Date(b.GameStartTime).getTime() - new Date(a.GameStartTime).getTime())[0];
            return {
                id: m.MatchID,
                queueId: m.QueueID,
                startedAt: new Date(m.GameStartTime),
                getDetails: async () =>
                    await _getMatchDetails(user, m.MatchID),
            };
        },
        getLastMatch: () => {
            const m = matchHistory.data.History.sort((b: any, a: any) => new Date(a.GameStartTime).getTime() - new Date(b.GameStartTime).getTime())[0];
            return {
                id: m.MatchID,
                queueId: m.QueueID,
                startedAt: new Date(m.GameStartTime),
                getDetails: async () =>
                    await _getMatchDetails(user, m.MatchID),
            };
        },
    };
    return data;
}

export function _getMatch(user: APIUser): APIMatch {
    return {
        history: async (options) => await _getMatchHistory(user, options),
        current: async () => null,
    };
}
