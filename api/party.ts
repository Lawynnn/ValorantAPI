import { APIUser, APIParty, APIQueueID , APIPartyAccessibility, APIPartyMember, APIPartyInvite, APICompetitiveTier } from "../types";
import axios, { AxiosInstance } from "axios";
import { _getCompetitiveTiers } from "./valorantApi";
import { _getMember } from "./member";
import Cache from "./cache";

function _getPartyAPI(user: APIUser): AxiosInstance {
    return axios.create({
        baseURL: `https://glz-${user.getRegion()}-1.${user.getShard()}.a.pvp.net`,
        headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "X-Riot-Entitlements-JWT": user.entitlementsToken,
            "X-Riot-ClientVersion": user.clientVersion,
        },
    });
}

async function _kickPartyMember(
    party: APIParty,
    member: APIPartyMember,
    user: APIUser
) {
    const apiParty = _getPartyAPI(user);

    const kick = await apiParty
        .delete(`/parties/v1/players/${member.puuid}`)
        .catch(() => false);
    if (!kick) {
        return false;
    }
    return true;
}

async function _setPartyQueue(user: APIUser, party: APIParty, queueId: APIQueueID | string): Promise<void> {
    const apiParty = _getPartyAPI(user);

    await apiParty.post(`/parties/v1/parties/${party.uuid}/queue`, { queueId }).catch(e => null);
}

async function _setPartyAccessibility(user: APIUser, party: APIParty, accessibility: APIPartyAccessibility): Promise<void> {
    const apiParty = _getPartyAPI(user);

    await apiParty.post(`/parties/v1/parties/${party.uuid}/accessibility`, { accessibility }).catch(e => null);
}

export async function _isInParty(user: APIUser): Promise<boolean> {
    const inParty = _getPartyAPI(user)
        .get(`parties/v1/players/${user.puuid}`)
        .catch((e) => null);
    if (!inParty) return false;

    return true;
}

export async function _getParty(user: APIUser): Promise<APIParty | null> {
    const apiParty = _getPartyAPI(user);

    const partyPlayer = await apiParty
        .get(`/parties/v1/players/${user.puuid}`)
        .catch(() => null);
    if (!partyPlayer) {
        return null;
    }

    const party = await apiParty
        .get(`parties/v1/parties/${partyPlayer.data.CurrentPartyID}`)
        .catch(() => null);
    if (!party) {
        return null;
    }

    const data: APIParty = {
        uuid: party.data.ID,
        isOpen: () => party.data.Accessibility === "OPEN",
        voiceId: party.data.VoiceRoomID,
        matchmaking: {
            id: party.data.MatchmakingData.QueueID,
            prefferedServers: party.data.MatchmakingData.PreferredGamePods,
            penalty: party.data.MatchmakingData.SkillDisparityRRPenalty,
        },
        members: party.data.Members.map((member: any): APIPartyMember => {
            const memberData: APIPartyMember = {
                puuid: member.Subject,
                getRank: (): APICompetitiveTier | null => {
                    const tiers = Cache.get("ranks");
                    if(!tiers || !Array.isArray(tiers)) throw new Error("Failed to get competitive tiers from cache. Try to add them into cache first using user.cache.ranks.fetch()");
                    
                    const tier: APICompetitiveTier = tiers[0].find((tier : APICompetitiveTier) => tier.tier === member.CompetitiveTier);
                    if(!tier) throw new Error("Failed to tier for this rank, try to fetch them");
                    
                    return tier;
                },
                platform: member.PlatformType,
                isOwner: () => member.IsOwner,
                isReady: () => member.IsReady,
                identity: {
                    cardId: member.PlayerIdentity.PlayerCardID,
                    titleId: member.PlayerIdentity.PlayerTitleID,
                    level: member.PlayerIdentity.AccountLevel,
                    borderId: member.PlayerIdentity.PreferredLevelBorderID,
                    incognito: member.PlayerIdentity.Incognito,
                    incognitoLevel: member.PlayerIdentity.HideAccountLevel,
                },
                member: async () => await _getMember(member.Subject),
                kick: async () =>
                    await _kickPartyMember(data, memberData, user),
            };
            return memberData;
        }),
        invites:
            party.data.Invites &&
            party.data.Invites.map((invite: any): APIPartyInvite => {
                return {
                    puuid: invite.Subject,
                    invitedBy: invite.InvitedBySubject,
                    createdAt: new Date(invite.CreatedAt),
                    expiresIn: invite.ExpiresIn,
                };
            }),
        setClosed: async () => await _setPartyAccessibility(user, data, APIPartyAccessibility.Closed),
        setOpen: async () => await _setPartyAccessibility(user, data, APIPartyAccessibility.Open),
        setQueue: async (queueId: APIQueueID | string) => await _setPartyQueue(user, data, queueId),
    };
    return data;
}